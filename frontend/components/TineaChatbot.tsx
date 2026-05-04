"use client";

import { useState, useEffect, useRef } from "react";
import { Send, X, MessageCircle } from "lucide-react";

interface ChatMessage {
  id: string;
  text: string;
  sender: "bot" | "user";
  timestamp: Date;
}

interface TineaChatbotProps {
  tineaType?: string;
  confidence?: number;
}

export default function TineaChatbot({ tineaType, confidence }: TineaChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial greeting
  useEffect(() => {
    const greeting = `👋 Hi! I'm TineaGuard, your tinea disease assistant. I can answer questions about tinea (ringworm), symptoms, treatment, and prevention. What would you like to know?`;
    setMessages([
      {
        id: "welcome",
        text: greeting,
        sender: "bot",
        timestamp: new Date(),
      },
    ]);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateBotResponse = async (userInput: string): Promise<string> => {
    try {
      // Determine context based on current conversation
      const context = messages.length > 0 
        ? `Previous messages: ${messages.map(m => `${m.sender}: ${m.text}`).join(" | ")}`
        : "Starting a new conversation about Tinea disease";

      const response = await fetch("http://localhost:4000/api/gemini/tinea-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userInput,
          context: context,
          tineaType: tineaType,
          confidence: confidence,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from chatbot API");
      }

      const data = await response.json();
      return data.reply || "I couldn't generate a response. Please try again.";
    } catch (error) {
      console.error("Chatbot error:", error);
      return "Sorry, I'm having trouble connecting to the AI service. Please check your connection and try again. You can also ask questions without AI using the knowledge base.";
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Get bot response from Gemini API
    const botResponse = await generateBotResponse(input);
    const botMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: botResponse,
      sender: "bot",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, botMessage]);
    setIsLoading(false);
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 z-40"
          title="Open Tinea Chatbot"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg">TineaGuard 🦠</h3>
              <p className="text-xs opacity-90">Tinea Disease Assistant</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-teal-700 rounded-full p-1 transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs rounded-lg p-3 ${
                    msg.sender === "user"
                      ? "bg-teal-500 text-white rounded-br-none"
                      : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  <span className={`text-xs ${msg.sender === "user" ? "text-teal-100" : "text-gray-500"} mt-1 block`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 border border-gray-200 rounded-lg rounded-bl-none p-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask about tinea..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-500"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="bg-teal-500 text-white rounded-lg px-4 py-2 hover:bg-teal-600 disabled:opacity-50 transition"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
