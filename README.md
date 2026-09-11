# Intentional Self AI Assistant

An AI-powered scheduling assistant and FAQ routing tool built for a clinical therapy practice. The primary technical focus of this project is a three-layer, fail-closed safety architecture designed to detect and intercept mental health crises in real-time.

## Technology Stack
- **Frontend:** Next.js (App Router), React, Tailwind CSS
- **Backend:** Next.js Route Handlers, Node.js
- **AI/LLM:** Google Gemini API (gemini-3.5-flash, gemini-3.5-flash-lite)
- **Validation:** Zod

## Architecture: Crisis Safety Net

Deploying language models in mental health contexts requires strict safety guarantees. Standard zero-shot classification is noisy and prone to false positives on everyday colloquialisms (e.g., "I feel wrecked from finals"), while sequential API calls introduce unacceptable latency.

To address this, every user message is routed through a concurrent, three-layer interception system before the standard chat response is returned.

### Layer 1: Deterministic Keyword Filter (O(1))
A regex-based evaluation runs locally on the server. If explicit high-risk language is detected, the request short-circuits and immediately returns a hardcoded crisis hotline block.

### Layer 2: Parallel Semantic Classifier
If Layer 1 passes, the backend executes two concurrent HTTP requests:
1. The standard conversational generation (`gemini-3.5-flash`).
2. A lightweight binary classification call (`gemini-3.5-flash-lite`).

The classifier uses a Chain-of-Thought prompt to analyze for indirect distress, hopelessness, or code-switched cries for help. If the classifier returns a positive flag, the server discards the ongoing chat generation and returns the crisis block.

### Layer 3: System Prompt Interception
As a final fallback, the conversational model is prompted to output a specific hidden token (`[CRISIS_TRIGGERED]`) if it detects a crisis during generation. The backend intercepts this token via string-matching before it reaches the client, swapping it for the crisis block.

### Fail-Closed Fallback
If the external API goes offline, times out, or hits rate limits (`429 Too Many Requests`), the backend catches the exception and returns a `500 Internal Server Error`. The frontend explicitly catches this 500 status to fail closed, rendering the 988 Suicide & Crisis Lifeline block rather than failing silently or displaying a generic error.

## Core Features

- **Stateless Edge API:** The `/api/chat` route is stateless, relying on the client to pass conversation history.
- **Tool Calling / Lead Capture:** The model utilizes function calling to capture patient emails. Upon detecting an email, the model invokes the `capture_lead` tool. The backend validates the payload via Zod, writes the lead to the system, and continues the chat.
- **Clinical Reporting UI:** The root page functions as an interactive executive report for clinical directors to test the widget while reviewing documented safety tradeoffs.

## Automated Stress Testing

The repository includes a dedicated stress-testing script (`scripts/crisis-stress-test.mjs`) to validate the safety thresholds. 

The suite tests the API against edge-case scenarios, measuring latency and verifying behavior across:
- Direct explicit language (Layer 1)
- Indirect/ambiguous distress (Layer 2)
- Surface word false-positive checks (e.g., "this intake form is killing me")
- Code-switched/Non-English phrasing (e.g., "Ya no quiero vivir")
- Multi-turn escalation (subtle distress built up across conversation history)

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Add your Gemini API key to `.env.local`:
   ```bash
   GEMINI_API_KEY=your_key_here
   ```
4. Start the development server: `npm run dev`
5. Navigate to `http://localhost:3000`
