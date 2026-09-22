import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const CHAT_API_URL =
  import.meta.env.VITE_CHAT_API_URL || `${API_BASE_URL}/api/chat`;

const SUGGESTED_QUESTIONS = [
  "Why did you recommend my #1 college?",
  "Show colleges under my budget",
  "Which colleges have campus hostel?",
  "Which colleges have good coding culture?",
  "Compare top 2 colleges",
  "Colleges in Pune",
  "Explain my recommendation results",
];

function AIChatAssistant({ recommendedColleges = [], studentProfile = {} }) {
  const initialWelcome = {
    id: "welcome",
    sender: "ai",
    text: "Hi! I'm your Career Compass AI College Counsellor 🎓\n\nI've analyzed your academic profile and matched you with real Maharashtra engineering colleges. Ask me about specific colleges, fees, hostels, branch availability, or placements!",
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };

  const [messages, setMessages] = useState([initialWelcome]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleResetChat = () => {
    setMessages([
      {
        ...initialWelcome,
        id: "welcome-" + Date.now(),
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
    setInput("");
    inputRef.current?.focus();
  };

  const handleSend = async (questionText) => {
    const textToSend = questionText || input;
    if (!textToSend || textToSend.trim() === "") return;

    const userMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: textToSend,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!questionText) setInput("");
    setLoading(true);

    try {
      const response = await axios.post(CHAT_API_URL, {
        question: textToSend,
        recommendedColleges,
        studentProfile,
      });

      const aiReply =
        response.data?.reply ||
        "I don't have enough data to answer that question.";

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: aiReply,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error("AI Assistant request error:", err);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: "Sorry, I couldn't reach the college database right now. Please ensure the backend server is running and try again.",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Markdown-like text formatter for bold and bullet points
  const formatText = (content) => {
    return content.split("\n").map((line, idx) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const renderedParts = parts.map((part, pIdx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={pIdx}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (line.startsWith("• ") || line.startsWith("- ")) {
        return (
          <div key={idx} className="chat-bullet-line">
            <span className="bullet-dot">•</span>
            <span>{renderedParts}</span>
          </div>
        );
      }
      return (
        <p key={idx} className="chat-paragraph">
          {renderedParts}
        </p>
      );
    });
  };

  return (
    <div className="ai-chat-card">
      <div className="chat-header">
        <div className="chat-header-title">
          <span className="counsellor-avatar">🎓</span>
          <div>
            <h4>AI College Counsellor</h4>
            <span className="online-indicator">
              <span className="pulse-dot"></span> Grounded in Maharashtra DB
            </span>
          </div>
        </div>
        <button
          className="chat-reset-btn"
          onClick={handleResetChat}
          title="Reset conversation"
          type="button"
        >
          🔄 New Chat
        </button>
      </div>

      {/* Suggested Questions */}
      <div className="suggested-questions-tray">
        <span className="suggested-label">Suggested Questions:</span>
        <div className="suggested-scroll">
          {SUGGESTED_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              className="suggestion-pill"
              onClick={() => handleSend(q)}
              disabled={loading}
              type="button"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="chat-messages-container">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`chat-bubble-wrap ${m.sender === "user" ? "user-wrap" : "ai-wrap"}`}
          >
            <div className={`chat-bubble ${m.sender}`}>
              <div className="bubble-content">{formatText(m.text)}</div>
              <span className="bubble-time">{m.time}</span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="chat-bubble-wrap ai-wrap">
            <div className="chat-bubble ai typing">
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
              <span className="typing-label">
                Analyzing college database...
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="chat-input-row">
        <input
          ref={inputRef}
          type="text"
          placeholder="Ask e.g. 'Compare COEP and VJTI', 'PICT fees'..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={loading}
          className="chat-input"
        />
        <button
          className="chat-send-btn"
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          type="button"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default AIChatAssistant;
