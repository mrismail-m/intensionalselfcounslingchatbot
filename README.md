# Intentional Self AI Assistant & Crisis Safety Net

A production-ready AI counseling and scheduling assistant built with a **three-layer, fail-closed safety architecture** designed to detect and intercept mental health crises in real-time.

This project was developed as a highly robust, HIPAA-conscious prototype for a clinical therapy practice to handle lead capture and FAQ routing, with an uncompromising focus on clinical safety and edge-case handling.

## 🛠 Tech Stack
* **Frontend:** Next.js (App Router), React, Tailwind CSS
* **Backend:** Next.js Route Handlers (Edge/Serverless), Node.js
* **AI & NLP:** Google Gemini API (`gemini-3.5-flash` and `gemini-3.5-flash-lite`)
* **Validation:** Zod (for function calling and schema enforcement)

## 🚨 The Challenge: Safe Healthcare AI
Deploying LLMs in a clinical or mental health context presents a massive liability: an AI attempting to "counsel" a user in active distress, or failing to recognize an obscure cry for help. 

Standard zero-shot classification (e.g., asking an LLM "is this a crisis?") is notoriously noisy, prone to false positives on everyday colloquialisms ("I feel wrecked from finals"), and introduces latency bottlenecks. 

## 🛡️ The Solution: A 3-Layer Safety Net
To solve this, the backend routes every user message through a concurrent, three-layered interception system before a standard chat response is ever returned to the user:

### Layer 1: Deterministic Keyword Filter (O(1))
A strict regex-based evaluation runs instantly on the server. If explicit, high-risk language (e.g., "suicide", "overdose") is detected, the request is immediately short-circuited, and the user receives a hardcoded crisis hotline block.

### Layer 2: Parallel Semantic Classifier (`flash-lite`)
If Layer 1 passes, the backend kicks off two concurrent HTTP requests:
1. The standard conversational generation (`gemini-3.5-flash`).
2. A lightweight, high-speed binary classification call (`gemini-3.5-flash-lite`).

The classifier runs a Chain-of-Thought prompt strictly analyzing for indirect distress, hopelessness, or code-switched/foreign language cries for help. If the classifier returns `YES`, the server discards the ongoing chat generation and immediately returns the crisis block. 

### Layer 3: System Prompt Interception
As a final fallback, the main conversational model is heavily prompted to output a specific hidden token (`[CRISIS_TRIGGERED]`) if it organically detects a crisis during its own generation. The backend intercepts this token via string-matching before it ever hits the UI, preventing token leaks and seamlessly swapping it for the crisis block.

### Fail-Closed Fallback Architecture
If the API goes offline, times out, or hits a rate limit (`429 Too Many Requests`), the backend catches the HTTP exception and throws a standard `500 Internal Server Error`. The React frontend is specifically wired to catch this 500 status and **fail closed**, rendering the 988 Suicide & Crisis Lifeline block rather than failing silently or showing a generic "Try again later" error.

## ⚙️ Core Features
* **Stateless Edge API:** The `/api/chat` route is entirely stateless, passing conversation history securely on every request.
* **Native Tool Calling / Lead Capture:** The AI utilizes Gemini Function Calling to capture prospective patient emails. When an email is detected, the model halts generation, invokes the `capture_lead` tool, the backend validates the payload via `Zod`, writes the lead to the system, and seamlessly continues the chat.
* **Clinical Reporting UI:** The root page serves as an interactive executive report, allowing non-technical clinical directors to test the widget while reviewing documented tradeoffs (e.g., the "Graceful Resumption" vs "Strict Lock" bypass tradeoff).

## 🧪 Automated Stress Testing
Because "vibes" aren't a testing strategy in healthcare, this repository includes a dedicated stress-testing script (`scripts/crisis-stress-test.mjs`). 

The suite blasts the stateless API with dozens of edge-case scenarios, measuring latency and verifying safety thresholds across:
* **Direct explicit language** (caught by Layer 1)
* **Indirect/ambiguous distress** (caught by Layer 2)
* **Surface word false-positive checks** (e.g., "this intake form is killing me" -> safely ignored)
* **Code-switched/Non-English phrasing** (e.g., "Ya no quiero vivir" -> caught by Layer 2)
* **Multi-turn escalation** (subtle distress built up across memory context)

## 🚀 Running Locally

1. Clone the repository
2. Install dependencies: `npm install`
3. Add your Gemini API key to `.env.local`:
   ```bash
   GEMINI_API_KEY=your_key_here
   ```
4. Start the dev server: `npm run dev`
5. Navigate to `http://localhost:3000` to view the interactive Technical Report and live chat widget.
