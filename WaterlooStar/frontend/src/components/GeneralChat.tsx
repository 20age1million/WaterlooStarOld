import React, { useState, useEffect, useRef } from "react";
import { useDraggable } from "../Reusable_hook/useDraggable";

interface ChatMessage {
  id: number;
  author: string;
  message: string;
  timestamp: Date;
}

const GeneralChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      author: "Alex",
      message: "Hey everyone! How's everyone doing today?",
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
    },
    {
      id: 2,
      author: "Sarah",
      message: "Good! Just finished my midterm 😅",
      timestamp: new Date(Date.now() - 120000), // 2 minutes ago
    },
    {
      id: 3,
      author: "Mike",
      message: "Anyone know if the library is open late tonight?",
      timestamp: new Date(Date.now() - 60000), // 1 minute ago
    },
  ]);

  const [newMessage, setNewMessage] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const panelRef = useRef<HTMLDivElement | null>(null);

  useDraggable(panelRef, ".chat-header", "pos:general-chat");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const message: ChatMessage = {
        id: messages.length + 1,
        author: "You", // This would be the logged-in user's name
        message: newMessage.trim(),
        timestamp: new Date(),
      };
      setMessages([...messages, message]);
      setNewMessage("");
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div
      ref={panelRef}
      className={`general-chat ${isMinimized ? "minimized" : ""}`}
    >
      <div className="chat-header" onClick={() => setIsMinimized(!isMinimized)}>
        <h3>💬 General Chat</h3>
        <button className="minimize-btn">{isMinimized ? "▲" : "▼"}</button>
      </div>

      {!isMinimized && (
        <>
          <div className="chat-messages">
            {messages.map((msg) => (
              <div key={msg.id} className="chat-message">
                <div className="message-header">
                  <span className="author">{msg.author}</span>
                  <span className="timestamp">{formatTime(msg.timestamp)}</span>
                </div>
                <div className="message-content">{msg.message}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="chat-input-form">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="chat-input"
              maxLength={200}
            />
            <button
              type="submit"
              className="send-btn"
              disabled={!newMessage.trim()}
            >
              Send
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default GeneralChat;
