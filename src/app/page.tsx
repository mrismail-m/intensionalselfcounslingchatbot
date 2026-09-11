import ChatWidget from '@/components/ChatWidget';

export default function Home() {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <main className="min-h-screen bg-[#DFD5CB] text-[#4E473F] font-sans py-12 px-4 sm:px-8 relative pb-40">
      
      {/* The Report Document (Paper) */}
      <div className="max-w-4xl mx-auto bg-[#ECE7E4] shadow-2xl border border-[#4E473F]/20 p-8 sm:p-16 md:p-20 relative">
        
        {/* Header */}
        <header className="border-b-2 border-[#4E473F] pb-8 mb-10 text-center">
          <p className="text-sm uppercase tracking-widest font-semibold mb-6 text-[#4E473F]">Confidential Internal Report</p>
          <h1 className="text-4xl md:text-5xl font-light mb-6 text-[#000000]" style={{ fontFamily: 'ivypresto-display, sans-serif' }}>
            Intentional Self AI Assistant
            <span className="block text-2xl md:text-3xl mt-4 text-[#4E473F]">Demo & Safety Validation Report</span>
          </h1>
          <p className="text-sm tracking-wider">{today}</p>
        </header>

        {/* Content */}
        <div className="space-y-12">
          
          <section>
            <h2 className="text-2xl font-light mb-4 text-[#000000]" style={{ fontFamily: 'ivypresto-display, sans-serif' }}>1. Executive Summary</h2>
            <p className="leading-relaxed mb-4">
              This document serves as both a validation report for the AI safety protocols and a live working demonstration of the Intentional Self AI Assistant. The chat widget in the bottom right corner is fully functional for your review.
            </p>
            <p className="leading-relaxed font-bold text-[#000000]">
              Bottom Line: The AI assistant successfully handles standard inquiries and accurately intercepts mental health crises using a multi-layered safety net. One final clinical policy decision is required prior to deployment.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light mb-4 text-[#000000]" style={{ fontFamily: 'ivypresto-display, sans-serif' }}>2. How the Safety Net Works</h2>
            <p className="leading-relaxed mb-4">
              To ensure client safety without compromising the speed of normal conversation, every message sent to the assistant is simultaneously evaluated by three independent layers of security before a response is ever generated:
            </p>
            <ul className="list-decimal pl-6 space-y-4 leading-relaxed">
              <li>
                <strong className="text-[#000000]">The Keyword Filter:</strong> An immediate, automatic check that scans for obvious, high-risk words (e.g., "suicide," "overdose") to guarantee instant interception.
              </li>
              <li>
                <strong className="text-[#000000]">The Context Analyzer:</strong> A dedicated, specialized secondary AI that runs silently in the background. It doesn't write responses; its only job is to "read between the lines" and detect subtle, indirect signs of deep hopelessness or emotional distress that a simple keyword filter might miss.
              </li>
              <li>
                <strong className="text-[#000000]">The Primary Assistant:</strong> Even if the first two layers miss something, the main conversational AI itself is trained with strict instructions to immediately stop its normal operations and trigger the safety protocol if it senses a crisis.
              </li>
            </ul>
            <p className="mt-4 leading-relaxed">
              If <em>any</em> of these three layers detect a potential emergency, the system immediately halts the standard conversation and displays the clinically approved crisis resources.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light mb-4 text-[#000000]" style={{ fontFamily: 'ivypresto-display, sans-serif' }}>3. Critical Clinical Decision: The "Bypass" Problem</h2>
            <div className="border-l-4 border-[#4E473F] pl-6 py-2 my-6">
              <p className="mb-4 leading-relaxed font-medium">
                When the AI detects a crisis, it halts normal conversation and provides crisis hotline resources. However, if the user immediately responds with <em>"I'm fine"</em> or <em>"Just kidding,"</em> the AI currently treats this reassurance as safe and resumes normal chat. 
              </p>
              <p className="mb-4 leading-relaxed">
                The clinical team must decide between two architectural paths:
              </p>
              <ul className="space-y-6">
                <li>
                  <strong className="text-[#000000]">Option A: Strict Lock</strong><br/>
                  Once crisis resources are triggered, the chat permanently locks for that session. It refuses to resume normal conversation.<br/>
                  <em>Tradeoff:</em> Much safer, but risks frustrating users who trigger it by accident (e.g., saying "I feel wrecked" when they just mean tired).
                </li>
                <li>
                  <strong className="text-[#000000]">Option B: Graceful Resumption (Current Demo Behavior)</strong><br/>
                  Allow the user to self-report safety and resume normal conversation.<br/>
                  <em>Tradeoff:</em> Better user experience and handles misunderstandings well, but risks allowing a genuinely distressed person to mask their intent and slip past the safety net.
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-light mb-4 text-[#000000]" style={{ fontFamily: 'ivypresto-display, sans-serif' }}>4. Safety Testing Validation</h2>
            <p className="leading-relaxed mb-4">Rigorous stress-testing of the AI's crisis detection system across simulated scenarios yielded the following results:</p>
            <ul className="list-disc pl-6 space-y-3 leading-relaxed">
              <li><strong className="text-[#000000]">Clear Crisis Language:</strong> Explicit statements of self-harm or suicidal ideation were caught instantly.</li>
              <li><strong className="text-[#000000]">Indirect Distress:</strong> Ambiguous phrases (e.g., <em>"everyone would be better off without me"</em>) were correctly identified.</li>
              <li><strong className="text-[#000000]">Everyday Exaggeration:</strong> Casual phrases (e.g., <em>"this form is killing me"</em>) were correctly ignored, passing without false positives.</li>
              <li><strong className="text-[#000000]">Code-Switching:</strong> Crisis phrases in Spanish and French were successfully caught.</li>
              <li><strong className="text-[#000000]">Multi-turn Escalation:</strong> Distress evolving over several messages was caught successfully on the final turn.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-light mb-4 text-[#000000]" style={{ fontFamily: 'ivypresto-display, sans-serif' }}>5. Known Limitations</h2>
            <p className="leading-relaxed">
              If a user sends a single, isolated word with no context (e.g., <em>"help"</em> or <em>"wrecked"</em>), the system occasionally triggers the safety response unnecessarily. We have tuned the system to err toward extreme caution rather than risk ignoring a subtle cry for help.
            </p>
          </section>

          <section className="border-t border-[#4E473F]/20 pt-8 mt-12">
            <h2 className="text-2xl font-light mb-4 text-[#000000]" style={{ fontFamily: 'ivypresto-display, sans-serif' }}>6. Action Items for Launch</h2>
            <ul className="list-decimal pl-6 space-y-3 leading-relaxed font-semibold">
              <li>Review Options A and B regarding the "Bypass" problem and inform the development team of the required behavior.</li>
              <li>Provide the exact, clinically approved wording and hotline numbers for the automated crisis response block.</li>
            </ul>
          </section>

        </div>
      </div>

      <ChatWidget />
    </main>
  );
}
