import { useState, useRef, useEffect } from "react";
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
      "Select a quick prompt suggestion below, type your question, or click the 🎙️ microphone to ask with your voice.",
      "Get applicable legal statutes, procedural steps, and necessary documents checklist.",
      "Directly connect with and book verified advocates on LegalConnect for court representation."
    ],
    disclaimer: "LegalConnect AI provides general legal information and platform guidance. It does not replace formal legal counsel by a licensed advocate.",
  };

  const [aiChatMessages, setAiChatMessages] = useState([initialWelcomeMessage]);
  const [aiQuestionInput, setAiQuestionInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // --- Voice / Speech-to-Text State ---
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [voiceStatus, setVoiceStatus] = useState("");
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState("en-IN");
  const [speakingId, setSpeakingId] = useState(null);

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const transcriptBufferRef = useRef("");
  const isListeningRef = useRef(false);

  // Check Web Speech API support on mount & clean up
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }

    return () => {
      // Cleanup voice recognition on unmount
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Update ref to avoid stale state in recognition callbacks
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // --- Start Voice Recognition ---
  const startListening = (langToUse = selectedLanguage) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceStatus("Voice recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    // Stop ongoing speech synthesis if any
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
    }

    // Abort existing instance if active
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = langToUse;

      transcriptBufferRef.current = "";
      setRecordingDuration(0);
      setIsListening(true);
      setVoiceStatus("Listening... Speak your legal query clearly.");

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      recognition.onresult = (event) => {
        let interimText = "";
        let finalText = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalText += result[0].transcript + " ";
          } else {
            interimText += result[0].transcript;
          }
        }

        if (finalText) {
          transcriptBufferRef.current = (transcriptBufferRef.current + " " + finalText).trim();
        }

        const fullConverted = (transcriptBufferRef.current + " " + interimText).trim();
        if (fullConverted) {
          setAiQuestionInput(fullConverted);
        }
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          setVoiceStatus("Microphone access was denied. Please allow microphone permissions in your browser address bar.");
        } else if (event.error === "no-speech") {
          setVoiceStatus("No speech detected. Please speak closer to your microphone or try again.");
        } else if (event.error === "network") {
          setVoiceStatus("Network error occurred with speech recognition service.");
        } else if (event.error !== "aborted") {
          setVoiceStatus(`Voice input issue: ${event.error}`);
        }
        cleanupListeningState();
      };

      recognition.onend = () => {
        // If it ended unexpectedly while user thought it was still listening
        if (isListeningRef.current) {
          cleanupListeningState();
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.error("Speech recognition startup error:", err);
      setVoiceStatus("Could not activate microphone. Please check browser permissions and refresh.");
      cleanupListeningState();
    }
  };

  const cleanupListeningState = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsListening(false);
  };

  // --- Stop Voice Recognition & Optionally Send ---
  const stopListening = (shouldSend = false) => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    cleanupListeningState();

    const queryToSend = (transcriptBufferRef.current || aiQuestionInput).trim();

    if (shouldSend) {
      if (queryToSend) {
        setVoiceStatus("Voice converted to text! Sending query to AI...");
        handleAskAI(queryToSend, true);
        transcriptBufferRef.current = "";
        setTimeout(() => setVoiceStatus(""), 3500);
      } else {
        setVoiceStatus("No speech detected to send. Click the mic to try again.");
        setTimeout(() => setVoiceStatus(""), 3500);
      }
    } else {
      if (queryToSend) {
        setVoiceStatus("Voice transcribed to text! You can review or edit before sending.");
        setTimeout(() => setVoiceStatus(""), 3500);
      }
    }
  };

  const cancelListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }
    cleanupListeningState();
    transcriptBufferRef.current = "";
    setVoiceStatus("Voice recording cancelled.");
    setTimeout(() => setVoiceStatus(""), 2500);
  };

  // Toggle mic button on input bar
  const handleToggleListening = () => {
    if (!speechSupported) {
      setVoiceStatus("Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.");
      setTimeout(() => setVoiceStatus(""), 4000);
      return;
    }

    if (isListening) {
      // When user clicks the active mic, stop and immediately send the converted text!
      stopListening(true);
    } else {
      startListening();
    }
  };

  // --- Ask AI Logic ---
  const handleAskAI = async (questionText = null, isVoice = false) => {
    // If voice recognition is currently running, stop it
    if (isListeningRef.current) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
        recognitionRef.current = null;
      }
      cleanupListeningState();
    }

    const textToSend = questionText || aiQuestionInput;
    if (!textToSend || !textToSend.trim() || aiLoading) return;

    const userMsg = {
      id: Date.now(),
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      text: textToSend.trim(),
      isVoice: isVoice
    };

    setAiChatMessages((prev) => [...prev, userMsg]);
    if (!questionText) setAiQuestionInput("");
    transcriptBufferRef.current = "";
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

  // Copy AI response
  const copyAIText = (msg, id) => {
    const text = `${msg.category || 'Legal AI Answer'}\n\nSummary:\n${msg.summary || ''}\n\nKey Points:\n${msg.keyPoints?.join('\n') || ''}\n\nProcedure:\n${msg.procedureSteps?.join('\n') || ''}`;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Read aloud AI response using Text-to-Speech
  const toggleSpeak = (msg) => {
    if (!("speechSynthesis" in window)) {
      alert("Text-to-speech audio playback is not supported in this browser.");
      return;
    }

    if (speakingId === msg.id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();

    let fullSpeech = `${msg.category || "Legal Advice"}. ${msg.summary || ""}. `;
    if (msg.keyPoints && msg.keyPoints.length) {
      fullSpeech += `Key points: ${msg.keyPoints.join(". ")}. `;
    }
    if (msg.procedureSteps && msg.procedureSteps.length) {
      fullSpeech += `Next procedural steps: ${msg.procedureSteps.join(". ")}. `;
    }

    const utterance = new SpeechSynthesisUtterance(fullSpeech);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.lang = selectedLanguage.startsWith("hi") ? "hi-IN" : "en-IN";

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(msg.id);
    window.speechSynthesis.speak(utterance);
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
              <p>Specialized in LegalConnect Platform &amp; Indian Legal Intelligence • Voice Enabled 🎙️</p>
            </div>
          </div>
          <div className="ai-header-controls">
            <button
              className="ai-clear-btn"
              onClick={() => {
                if ("speechSynthesis" in window) window.speechSynthesis.cancel();
                setSpeakingId(null);
                setAiChatMessages([initialWelcomeMessage]);
              }}
              title="Clear Conversation"
            >
              🗑️ Clear Chat
            </button>
          </div>
        </div>

        {/* Quick Suggested Prompts */}
        <div className="ai-prompts-banner">
          <span className="prompts-label">💡 Suggested Questions (Click or Speak):</span>
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
                  <div className="message-meta-right">
                    {msg.isVoice && (
                      <span className="voice-tag" title="Query converted from voice to text">
                        🎙️ Voice to Text
                      </span>
                    )}
                    <span className="message-time">{msg.timestamp}</span>
                  </div>
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

                      <button
                        className={`ai-action-btn ${speakingId === msg.id ? "speaking-btn" : ""}`}
                        onClick={() => toggleSpeak(msg)}
                        title={speakingId === msg.id ? "Stop voice reading" : "Listen to answer via voice"}
                      >
                        {speakingId === msg.id ? "⏹ Stop Voice" : "🔊 Listen to Answer"}
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

        {/* Voice Status Notification Banner */}
        {voiceStatus && (
          <div className={`ai-voice-status-alert ${voiceStatus.includes("denied") || voiceStatus.includes("issue") || voiceStatus.includes("error") ? "status-error" : "status-info"}`}>
            <span className="status-icon">
              {voiceStatus.includes("denied") || voiceStatus.includes("error") ? "⚠️" : "🎙️"}
            </span>
            <span className="status-text">{voiceStatus}</span>
            <button className="status-close-btn" onClick={() => setVoiceStatus("")}>✕</button>
          </div>
        )}

        {/* ACTIVE VOICE RECORDING & LIVE CONVERSION PANEL */}
        {isListening && (
          <div className="voice-active-panel">
            <div className="voice-panel-header">
              <div className="voice-rec-indicator">
                <span className="rec-pulse-dot"></span>
                <span className="rec-text">RECORDING VOICE</span>
                <span className="voice-timer">
                  {Math.floor(recordingDuration / 60).toString().padStart(2, "0")}:
                  {(recordingDuration % 60).toString().padStart(2, "0")}
                </span>
              </div>

              {/* Animated Sound Waveform Bars */}
              <div className="voice-equalizer" title="Listening to voice">
                <span className="eq-bar bar-1"></span>
                <span className="eq-bar bar-2"></span>
                <span className="eq-bar bar-3"></span>
                <span className="eq-bar bar-4"></span>
                <span className="eq-bar bar-5"></span>
                <span className="eq-bar bar-6"></span>
              </div>

              {/* Language Selector */}
              <div className="voice-lang-box">
                <label htmlFor="voice-lang-select">Language:</label>
                <select
                  id="voice-lang-select"
                  value={selectedLanguage}
                  onChange={(e) => {
                    const newLang = e.target.value;
                    setSelectedLanguage(newLang);
                    stopListening(false);
                    setTimeout(() => startListening(newLang), 200);
                  }}
                >
                  <option value="en-IN">English (India)</option>
                  <option value="hi-IN">हिन्दी (Hindi)</option>
                  <option value="en-US">English (US)</option>
                  <option value="ta-IN">தமிழ் (Tamil)</option>
                  <option value="te-IN">తెలుగు (Telugu)</option>
                  <option value="bn-IN">বাংলা (Bengali)</option>
                </select>
              </div>
            </div>

            {/* Live Converted Text Preview */}
            <div className="voice-converted-preview">
              {aiQuestionInput ? (
                <p className="preview-converted-text">
                  <span className="preview-label">Live Converted Text:</span>
                  &ldquo;{aiQuestionInput}&rdquo;
                </p>
              ) : (
                <p className="preview-placeholder-text">
                  🎙️ Speak your question now... (e.g. &ldquo;How do I file a consumer complaint for a defective mobile phone?&rdquo;)
                </p>
              )}
            </div>

            {/* Controls to Send or Review */}
            <div className="voice-controls-bar">
              <button
                type="button"
                className="voice-action-btn voice-send-btn"
                onClick={() => stopListening(true)}
                disabled={!aiQuestionInput.trim()}
              >
                🚀 Send Voice Query Now
              </button>
              <button
                type="button"
                className="voice-action-btn voice-edit-btn"
                onClick={() => stopListening(false)}
              >
                ⏸ Stop &amp; Review Text
              </button>
              <button
                type="button"
                className="voice-action-btn voice-cancel-btn"
                onClick={cancelListening}
              >
                ✕ Cancel
              </button>
            </div>
          </div>
        )}

        {/* Input Form with Microphone Button */}
        <form
          className="ai-chat-input-bar"
          onSubmit={(e) => {
            e.preventDefault();
            handleAskAI();
          }}
        >
          <div className="ai-input-wrapper">
            <input
              type="text"
              placeholder={
                isListening
                  ? "Converting voice to text in real-time... Speak now"
                  : "Ask about LegalConnect or Indian Law, or click 🎙️ to speak..."
              }
              value={aiQuestionInput}
              onChange={(e) => setAiQuestionInput(e.target.value)}
              disabled={aiLoading}
            />

            {/* Microphone Button */}
            <button
              type="button"
              className={`ai-mic-btn ${isListening ? "mic-recording" : ""} ${!speechSupported ? "mic-unsupported" : ""}`}
              onClick={handleToggleListening}
              disabled={aiLoading}
              title={
                !speechSupported
                  ? "Speech recognition is not supported in this browser (Try Chrome/Edge)"
                  : isListening
                  ? "Click to finish voice input & send query immediately"
                  : "Click microphone to ask your legal query by voice (Voice to Text)"
              }
            >
              <svg
                className="mic-svg-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="22"></line>
                <line x1="8" y1="22" x2="16" y2="22"></line>
              </svg>
              {isListening && <span className="mic-pulse-ring"></span>}
            </button>
          </div>

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
