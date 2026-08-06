import { useState } from "react";
import api from "../services/api";
import "./AILegalAssistant.css";

function AILegalAssistant({ onConsultAdvocate }) {
  const initialWelcomeMessage = {
    id: 1,
    sender: "ai",
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    category: "LegalConnect AI Advisor",
    summary: "Welcome! I am your LegalConnect AI Assistant. Ask me any question regarding the LegalConnect platform or Indian Legal matters (Consumer Rights, Property Disputes, Matrimonial Matters, Cyber Fraud, Cheque Bounce, Criminal Procedure, etc.).",
    keyPoints: [
      "I am strictly configured to answer queries regarding LegalConnect platform features and Indian Law.",
      "Select a quick prompt suggestion below or type your legal question.",
      "Get applicable legal statutes, procedural steps, and necessary documents checklist.",
      "Directly connect with and book verified advocates on LegalConnect for court representation."
    ],
    disclaimer: "LegalConnect AI provides general legal information and platform guidance. It does not replace formal legal counsel by a licensed advocate.",
  };

  const [aiChatMessages, setAiChatMessages] = useState([initialWelcomeMessage]);
  const [aiQuestionInput, setAiQuestionInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const handleAskAI = async (questionText = null) => {
    const textToSend = questionText || aiQuestionInput;
    if (!textToSend || !textToSend.trim() || aiLoading) return;

    const userMsg = {
      id: Date.now(),
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      text: textToSend.trim()
    };

    setAiChatMessages((prev) => [...prev, userMsg]);
    if (!questionText) setAiQuestionInput("");
    setAiLoading(true);

    try {
      const res = await api.post("/ai/chat", {
        question: textToSend.trim(),
        conversationHistory: aiChatMessages
      });

      if (res.data && res.data.success) {
        setAiChatMessages((prev) => [...prev, res.data.data]);
      } else {
        throw new Error(res.data?.message || "Failed to get AI answer");
      }
    } catch (err) {
      console.error("AI Assistant Error:", err);
      setAiChatMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "ai",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          category: "System Notice",
          summary: "Sorry, I encountered an issue retrieving the answer. Please ensure your query is related to LegalConnect features or Indian Law and try again.",
          disclaimer: "You can also consult verified advocates directly on LegalConnect.",
        }
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  const copyAIText = (msg, id) => {
    const text = `${msg.category || 'Legal AI Answer'}\n\nSummary:\n${msg.summary || ''}\n\nKey Points:\n${msg.keyPoints?.join('\n') || ''}\n\nProcedure:\n${msg.procedureSteps?.join('\n') || ''}`;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="ai-assistant-container">
      <div className="ai-chat-card">
        {/* Header */}
        <div className="ai-chat-header">
          <div className="ai-chat-title">
            <div className="ai-avatar-badge">🤖</div>
            <div>
              <h3>LegalConnect AI Assistant</h3>
              <p>Specialized exclusively in LegalConnect Platform &amp; Indian Legal Intelligence</p>
            </div>
          </div>
          <button
            className="ai-clear-btn"
            onClick={() => setAiChatMessages([initialWelcomeMessage])}
            title="Clear Conversation"
          >
            🗑️ Clear Chat
          </button>
        </div>

        {/* Quick Suggested Prompts */}
        <div className="ai-prompts-banner">
          <span className="prompts-label">💡 Suggested Project &amp; Legal Questions:</span>
          <div className="prompts-chips">
            <button onClick={() => handleAskAI("How do I book an advocate and register a case on LegalConnect?")}>
              ℹ️ LegalConnect Platform Guide
            </button>
            <button onClick={() => handleAskAI("How do I file a consumer complaint for a defective product or service?")}>
              🛒 Consumer Refund &amp; Complaint
            </button>
            <button onClick={() => handleAskAI("What is the legal procedure for landlord & tenant dispute resolution?")}>
              🏠 Tenant &amp; Rent Rights
            </button>
            <button onClick={() => handleAskAI("What immediate steps should I take if I face online bank fraud?")}>
              💻 Online Cyber / Bank Fraud
            </button>
            <button onClick={() => handleAskAI("What are the legal requirements for mutual consent divorce in India?")}>
              👨‍👩‍👧 Mutual Divorce Procedure
            </button>
            <button onClick={() => handleAskAI("What is the step-by-step process for a Section 138 Cheque Bounce notice?")}>
              📜 Cheque Bounce Legal Notice
            </button>
            <button onClick={() => handleAskAI("How to register an FIR when police refuse to file a criminal complaint?")}>
              👮 Police FIR Procedure
            </button>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="ai-chat-stream">
          {aiChatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`ai-message-row ${msg.sender === "user" ? "user-row" : "ai-row"}`}
            >
              <div className="message-avatar">
                {msg.sender === "user" ? "👤" : "🤖"}
              </div>

              <div className="message-bubble">
                <div className="message-meta">
                  <span className="message-sender-name">
                    {msg.sender === "user" ? "You" : "LegalConnect AI"}
                  </span>
                  <span className="message-time">{msg.timestamp}</span>
                </div>

                {msg.sender === "user" ? (
                  <p className="user-message-text">{msg.text}</p>
                ) : (
                  <div className="ai-response-body">
                    {msg.category && (
                      <div className={`ai-category-pill ${msg.isOffTopic ? "off-topic" : ""}`}>
                        {msg.isOffTopic ? "⚠️ " : "⚖️ "}{msg.category}
                      </div>
                    )}

                    <p className="ai-summary">{msg.summary}</p>

                    {/* Relevant Legal Sections */}
                    {msg.legalSections && msg.legalSections.length > 0 && (
                      <div className="ai-section-box">
                        <strong>Relevant Statutes &amp; Sections:</strong>
                        <ul>
                          {msg.legalSections.map((sec, i) => (
                            <li key={i}><code>{sec}</code></li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Key Points */}
                    {msg.keyPoints && msg.keyPoints.length > 0 && (
                      <div className={`ai-section-box ${msg.isOffTopic ? "off-topic-box" : ""}`}>
                        <strong>{msg.isOffTopic ? "Scope Policy & Recommendations:" : "Key Legal Rights & Guidance:"}</strong>
                        <ul>
                          {msg.keyPoints.map((pt, i) => (
                            <li key={i}>{pt}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Procedure Steps */}
                    {msg.procedureSteps && msg.procedureSteps.length > 0 && (
                      <div className="ai-section-box">
                        <strong>Recommended Next Steps:</strong>
                        <ol>
                          {msg.procedureSteps.map((step, i) => (
                            <li key={i}>{step}</li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {/* Document Checklist */}
                    {msg.documentList && msg.documentList.length > 0 && (
                      <div className="ai-section-box">
                        <strong>Required Documents Checklist:</strong>
                        <div className="ai-docs-list">
                          {msg.documentList.map((doc, i) => (
                            <span key={i} className="ai-doc-chip">📁 {doc}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {msg.disclaimer && (
                      <div className="ai-disclaimer">
                        {msg.disclaimer}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="ai-card-actions">
                      <button
                        className="ai-action-btn"
                        onClick={() => copyAIText(msg, msg.id)}
                      >
                        {copiedId === msg.id ? "✓ Copied!" : "📋 Copy Response"}
                      </button>

                      {msg.recommendedSpecialization && onConsultAdvocate && (
                        <button
                          className="ai-action-btn advocate-recommend-btn"
                          onClick={() => onConsultAdvocate(msg.recommendedSpecialization)}
                        >
                          👨‍⚖️ Book {msg.recommendedSpecialization} Advocate →
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {aiLoading && (
            <div className="ai-message-row ai-row">
              <div className="message-avatar">🤖</div>
              <div className="message-bubble loading-bubble">
                <div className="ai-typing-indicator">
                  <span></span><span></span><span></span>
                </div>
                <p>Analyzing LegalConnect Platform &amp; Indian Legal Codes...</p>
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form
          className="ai-chat-input-bar"
          onSubmit={(e) => {
            e.preventDefault();
            handleAskAI();
          }}
        >
          <input
            type="text"
            placeholder="Ask any question about LegalConnect or Indian Law..."
            value={aiQuestionInput}
            onChange={(e) => setAiQuestionInput(e.target.value)}
            disabled={aiLoading}
          />
          <button
            type="submit"
            className="ai-send-btn"
            disabled={aiLoading || !aiQuestionInput.trim()}
          >
            {aiLoading ? "Thinking..." : "Ask AI ➔"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AILegalAssistant;
