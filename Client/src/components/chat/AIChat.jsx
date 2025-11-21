import { useState, useRef, useEffect } from "react";
import { Avatar } from "../ui/avatar";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Bot, Send, Loader2, X, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import apiClient from "../../lib/apiClient";
import { useStore } from "../../store/store";
import { toast } from "sonner";

export function AIChat({ onClose }) {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  // Removed suggestions state
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const userInfo = useStore((state) => state.userInfo);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  };

  // Force scroll to bottom whenever chat history changes
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timer);
  }, [chatHistory]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    try {
      setIsLoading(true);
      const trimmedMessage = message.trim();
      setMessage("");

      // Add user message to chat history
      const userMessage = {
        content: trimmedMessage,
        sender: "user",
        timestamp: new Date().toISOString(),
        id: Date.now() + Math.random(),
      };
      setChatHistory((prev) => [...prev, userMessage]);

      // Add loading AI message
      const loadingAiMessage = {
        content: "",
        sender: "ai",
        timestamp: new Date().toISOString(),
        isLoading: true,
        id: Date.now() + Math.random() + 1,
      };
      setChatHistory((prev) => [...prev, loadingAiMessage]);

      // Get AI response
      const response = await apiClient.post("/api/gemini/chat", {
        message: trimmedMessage,
      });

      if (response.data.success) {
        // Replace loading message with actual response
        setChatHistory((prev) => {
          const newHistory = [...prev];
          const lastMessageIndex = newHistory.length - 1;

          if (newHistory[lastMessageIndex]?.isLoading) {
            newHistory[lastMessageIndex] = {
              content: response.data.response,
              sender: "ai",
              timestamp: new Date().toISOString(),
              isLoading: false,
              id: newHistory[lastMessageIndex].id,
            };
          }
          return newHistory;
        });
      }
    } catch (error) {
      console.error("Error getting AI response:", error);
      toast.error(
        error.response?.data?.error?.message || "Failed to get AI response"
      );

      // Remove the loading message on error
      setChatHistory((prev) => prev.filter((msg) => !msg.isLoading));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Removed suggestion-related functions

  return (
    <Card className="flex flex-col h-screen bg-dark-primary text-white border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Avatar className="border-2 border-cyan-500 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Bot className="text-white w-5 h-5" />
            </div>
          </Avatar>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="font-bold text-lg text-white">AI Assistant</h2>
            <p className="text-xs text-gray-400">Powered by Gemini</p>
          </motion.div>
        </div>

        {/* Exit Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative group"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="w-9 h-9 rounded-lg transition-all duration-300 backdrop-blur-md border border-transparent hover:border-red-500/30 text-slate-400 hover:text-red-400 hover:bg-red-500/15 p-0 relative overflow-hidden"
          >
            <motion.div
              whileHover={{ rotate: 90 }}
              transition={{ duration: 0.3 }}
              className="relative z-10"
            >
              <X size={18} />
            </motion.div>

            <motion.div
              initial={{ scale: 0 }}
              whileHover={{ scale: 1 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-pink-500/20 to-red-500/20 rounded-lg"
            />
          </Button>

          <div className="absolute -top-8 right-0 transform bg-slate-800 text-red-400 text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50">
            <div className="flex items-center gap-1">
              <MessageCircle size={12} />
              Back to Chat
            </div>
          </div>
        </motion.div>
      </div>

      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 p-4 overflow-y-auto space-y-4 scroll-smooth"
        style={{
          scrollBehavior: "smooth",
        }}
      >
        {chatHistory.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center py-8"
          >
            <Bot className="w-16 h-16 text-cyan-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Welcome to AI Assistant
            </h3>
            <p className="text-gray-400 max-w-md">
              I'm here to help you with any questions or tasks. Feel free to ask
              me anything!
            </p>
          </motion.div>
        )}

        <AnimatePresence mode="popLayout">
          {chatHistory.map((chat) => (
            <motion.div
              key={chat.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className={`flex items-end gap-3 ${
                chat.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {chat.sender === "ai" && (
                <Avatar className="w-8 h-8 border-2 border-cyan-500 flex-shrink-0">
                  <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <Bot className="text-white w-4 h-4" />
                  </div>
                </Avatar>
              )}

              <motion.div
                layout
                className={`max-w-[80%] p-3 rounded-2xl shadow-lg ${
                  chat.sender === "user"
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-lg"
                    : "bg-gray-800 text-gray-100 border border-gray-700 rounded-bl-lg"
                } ${chat.isLoading ? "animate-pulse" : ""}`}
              >
                {chat.isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                    <span className="text-gray-300">Thinking...</span>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {chat.content}
                  </div>
                )}
              </motion.div>

              {chat.sender === "user" && (
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <img
                    src={userInfo?.image}
                    alt={userInfo?.firstName}
                    className="w-full h-full object-cover rounded-full"
                  />
                </Avatar>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add CSS to hide scrollbar */}
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div>
        <div ref={messagesEndRef} className="h-1" />

        {/* Input Form - Reduced padding */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="p-3 pt-4  border-t border-gray-800 bg-gray-900/50 backdrop-blur-sm"
        >
          <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                disabled={isLoading}
                className="bg-gray-800/80 border-gray-700 text-white placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-cyan-500/40 focus-visible:border-cyan-500/60 rounded-xl py-0 px-4 text-sm transition-all duration-300 hover:bg-gray-800 resize-none min-h-[40px] max-h-32"
                autoFocus
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading || !message.trim()}
              className={`px-3 py-2.5 rounded-xl transition-all duration-300 min-h-[40px] ${
                message.trim() && !isLoading
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40"
                  : "bg-gray-700 text-gray-400"
              }`}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </Card>
  );
}
