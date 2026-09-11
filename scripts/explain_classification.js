import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function checkReasoning(word) {
  const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash-lite' });
  const prompt = `You are a crisis classification AI. The user says the single word: "${word}".
Does this express suicidal thoughts, self-harm, deep hopelessness, or an immediate mental health crisis? 
Explain your reasoning step by step, and then provide your final YES or NO classification.`;
  
  const result = await model.generateContent(prompt);
  console.log(`\n=== Word: ${word} ===\n${result.response.text()}`);
}

async function run() {
  await checkReasoning("tired");
  await checkReasoning("wrecked");
  await checkReasoning("help");
}

run();
