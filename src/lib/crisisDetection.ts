// This is a lightweight interceptor for crisis keywords.
// In a production system, this could be more sophisticated (e.g., using a smaller, faster model specifically for intent classification),
// but for the demo, keyword matching is sufficient.

const CRISIS_KEYWORDS = [
  "suicide", "suicidal", "kill myself", "end my life", "want to die",
  "self harm", "cut myself", "hurt myself", "don't want to live",
  "emergency", "overdose"
];

export const CRISIS_RESPONSE_BLOCK = `It sounds like things feel very heavy right now. 

Because I am an AI, I cannot provide crisis support. If you are in immediate danger or experiencing a medical emergency, please call **911** or go to the nearest emergency room. If you are experiencing a mental health crisis or suicidal thoughts, please call or text **988** immediately to reach the Suicide & Crisis Lifeline (available 24/7).

Your safety is the most important thing. If you are safe and just looking for counseling options, please let me know and we can continue exploring how our team can support you.`;

export function detectCrisis(message: string): boolean {
  const normalizedMessage = message.toLowerCase();
  for (const keyword of CRISIS_KEYWORDS) {
    if (normalizedMessage.includes(keyword)) {
      return true;
    }
  }
  return false;
}
