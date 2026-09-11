import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { z } from 'zod';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import fs from 'fs';
import path from 'path';
import { detectCrisis, CRISIS_RESPONSE_BLOCK } from '../../../lib/crisisDetection';
import { SYSTEM_PROMPT } from '../../../lib/systemPrompt';

// Logger stub to comply with no console.log in production rule
const logger = {
  info: (msg: any) => process.env.NODE_ENV !== 'production' && console.log(msg),
  error: (msg: any) => process.env.NODE_ENV !== 'production' && console.error(msg),
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Rate Limiter
const redis = process.env.UPSTASH_REDIS_REST_URL
  ? Redis.fromEnv()
  : { eval: () => [], set: () => {}, get: () => {} } as unknown as Redis; 

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
});

// Zod schema for input validation (max 2000 chars per message to prevent context bloat)
const chatSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string().min(1).max(2000).trim(),
    })
  ).min(1).max(50), 
});

// Function to log leads for the demo
function captureLead(email: string, notes: string) {
  // Validate email before saving
  const emailSchema = z.string().email();
  const parsedEmail = emailSchema.safeParse(email);
  if (!parsedEmail.success) {
    logger.error({ event: "invalid_email_extracted", email });
    return "Failed to save lead: The provided email address is invalid. Please ask the user to clarify their email.";
  }

  const leadPath = path.join(process.cwd(), 'leads.json');
  const newLead = { email: parsedEmail.data, notes, timestamp: new Date().toISOString() };
  let leads: any[] = [];
  try {
    if (fs.existsSync(leadPath)) leads = JSON.parse(fs.readFileSync(leadPath, 'utf8'));
  } catch (e) {}
  leads.push(newLead);
  fs.writeFileSync(leadPath, JSON.stringify(leads, null, 2));
  logger.info({ event: "lead_captured", email: parsedEmail.data });
  return "Lead successfully saved to system.";
}

// Separate LLM call for robust crisis detection
async function checkCrisisWithLLM(message: string): Promise<boolean> {
  if (!process.env.GEMINI_API_KEY) return false;
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash-lite' });
    const prompt = `Does the following user message express suicidal thoughts, self-harm, deep hopelessness, or an immediate mental health crisis? Reply ONLY with "YES" or "NO".\n\nUser message: "${message}"`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim().toUpperCase().includes("YES");
  } catch (e) {
    logger.error({ err: e, context: "crisis_llm_check" });
    // Fail closed: throw error to trigger the 500 handler which contains crisis hotlines
    throw new Error("Crisis classification failed");
  }
}

// Function to persist conversations for QA
function logConversation(messages: any[], aiResponse: string) {
  try {
    const logPath = path.join(process.cwd(), 'chat_logs.jsonl');
    const logEntry = JSON.stringify({ timestamp: new Date().toISOString(), messages, aiResponse }) + '\\n';
    fs.appendFileSync(logPath, logEntry);
  } catch (e) {
    logger.error({ err: e, context: "log_conversation" });
  }
}

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting (Disabled for testing)
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    // if (process.env.UPSTASH_REDIS_REST_URL) {
    //   const { success } = await ratelimit.limit(ip);
    //   if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    // }

    // 2. Input Validation
    const body = await req.json();
    const result = chatSchema.safeParse(body);
    if (!result.success) return NextResponse.json({ error: result.error.flatten() }, { status: 400 });

    const { messages } = result.data;
    const lastUserMessage = messages[messages.length - 1].content;

    // 3. Layer 1 Crisis Detection (Deterministic Keyword Match)
    // If the keyword check fires, we return immediately and avoid any LLM calls.
    if (detectCrisis(lastUserMessage)) {
      return NextResponse.json({ message: CRISIS_RESPONSE_BLOCK, debug_layer: 'layer_1_regex' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ message: "Demo offline (Missing API Key)." });
    }

    // 4. Cap History
    const recentMessages = messages.slice(-10);
    let formattedHistory = recentMessages.slice(0, -1).map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    while (formattedHistory.length > 0 && formattedHistory[0].role !== 'user') {
      formattedHistory.shift();
    }

    // Initialize model with tools
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash',
      systemInstruction: SYSTEM_PROMPT,
      tools: [{
        functionDeclarations: [{
          name: "capture_lead",
          description: "Saves a user's email address and inquiry notes when they express interest in scheduling or being contacted.",
          parameters: {
            type: SchemaType.OBJECT,
            properties: {
              email: { type: SchemaType.STRING, description: "The user's email address" },
              notes: { type: SchemaType.STRING, description: "Brief notes about what they are seeking" },
            },
            required: ["email", "notes"]
          }
        }]
      }]
    });

    const chat = model.startChat({ history: formattedHistory });
    
    // 5. Parallel Execution: Layer 2 Crisis Classifier & Main Chat Response
    const crisisPromise = checkCrisisWithLLM(lastUserMessage);
    const chatPromise = chat.sendMessage(lastUserMessage);
    
    const isCrisisLLM = await crisisPromise;
    if (isCrisisLLM) {
      logger.info({ event: "crisis_detected_layer_2" });
      return NextResponse.json({ message: CRISIS_RESPONSE_BLOCK, debug_layer: 'layer_2_classifier' });
    }

    // If no crisis, await the chat response
    let aiResult = await chatPromise;
    
    // Check if the AI decided to call the capture_lead tool
    const functionCalls = aiResult.response.functionCalls();
    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0];
      if (call.name === "capture_lead") {
        const args = call.args as { email: string; notes: string };
        const toolOutput = captureLead(args.email, args.notes);
        
        // Send tool output back to the model so it can formulate a final reply to the user
        aiResult = await chat.sendMessage([{
          functionResponse: {
            name: "capture_lead",
            response: { result: toolOutput }
          }
        }]);
      }
    }

    let finalResponseText = aiResult.response.text();
    let debugLayer = 'none';
    
    // Layer 3: Main Model Self-Censorship Interceptor
    if (finalResponseText.includes("[CRISIS_TRIGGERED]")) {
      logger.info({ event: "crisis_detected_layer_3" });
      finalResponseText = CRISIS_RESPONSE_BLOCK;
      debugLayer = 'layer_3_interceptor';
    }
    
    // Log for QA
    logConversation(recentMessages, finalResponseText);

    return NextResponse.json({ message: finalResponseText, debug_layer: debugLayer });
  } catch (error) {
    logger.error({ err: error, context: "chat_api_route" });
    return NextResponse.json({ 
      error: 'Something went wrong. If you are experiencing a mental health crisis, please call or text 988 immediately to reach the Suicide & Crisis Lifeline (available 24/7).' 
    }, { status: 500 });
  }
}
