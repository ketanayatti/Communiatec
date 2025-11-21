import { useEffect, useRef, useState } from "react";
import { Smile, Send, Code, Zap, Bot } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import { useStore } from "@/store/store";
import { useSocket } from "@/context/SocketContext";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSuggestions } from "@/pages/chat-components/chat-container/components/message-suggestions";
import apiClient from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";

const MessageBar = ({ showAIChat, setShowAIChat }) => {
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isCodeMode, setIsCodeMode] = useState(false);
  const [language, setLanguage] = useState("javascript");
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const suggestionsTimeoutRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const editorContainerRef = useRef(null);
  const { selectedChatType, selectedChatData, userInfo } = useStore();
  const socket = useSocket();
  const fileInputRef = useRef();

  const handleEmojiClick = (emojiData) => {
    setMessage((prevMessage) => prevMessage + emojiData.emoji);
    handleTypingStatus(true);
  };

  const handleClickOutside = (e) => {
    if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
      setEmojiPickerOpen(false);
    }
  };

  // Handle typing status
  const handleTypingStatus = (isCurrentlyTyping) => {
    if (!socket || !selectedChatData) return;

    // Clear any existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Only emit if typing status changed
    if (isCurrentlyTyping !== isTyping) {
      setIsTyping(isCurrentlyTyping);

      if (selectedChatType === "group") {
        socket.emit("groupTyping", {
          groupId: selectedChatData._id,
          userId: userInfo._id,
          isTyping: isCurrentlyTyping,
        });
      } else {
        socket.emit("typingStatus", {
          sender: userInfo._id,
          chatId: selectedChatData._id,
          isTyping: isCurrentlyTyping,
        });
      }
    }

    // Set timeout to stop typing after 2 seconds of inactivity
    if (isCurrentlyTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        if (selectedChatType === "group") {
          socket.emit("groupTyping", {
            groupId: selectedChatData._id,
            userId: userInfo._id,
            isTyping: false,
          });
        } else {
          socket.emit("typingStatus", {
            sender: userInfo._id,
            chatId: selectedChatData._id,
            isTyping: false,
          });
        }
      }, 2000);
    }
  };

  // Handle input change with typing indicator
  // Fetch message suggestions
  const fetchSuggestions = async (text) => {
    if (!text.trim() || isCodeMode) {
      setSuggestions([]);
      return;
    }

    try {
      setIsSuggestionsLoading(true);
      const response = await apiClient.post(
        "/api/message-suggestions/generate",
        {
          currentMessage: text,
          chatId: selectedChatData._id,
          isGroup: selectedChatType === "group",
        }
      );

      if (response.data.success) {
        setSuggestions(response.data.suggestions);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setIsSuggestionsLoading(false);
    }
  };

  const handleSuggestionClick = async (suggestion) => {
    setMessage(suggestion.suggestion);

    try {
      await apiClient.post("/api/message-suggestions/mark-used", {
        suggestionId: suggestion._id,
      });
    } catch (error) {
      console.error("Error marking suggestion as used:", error);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessage(value);

    // Trigger typing indicator
    if (value.trim().length > 0) {
      handleTypingStatus(true);
    } else {
      handleTypingStatus(false);
    }

    // Debounce suggestions
    if (suggestionsTimeoutRef.current) {
      clearTimeout(suggestionsTimeoutRef.current);
    }

    suggestionsTimeoutRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 500);
  };

  const handleSendMessage = () => {
    if (socket && message.trim() !== "") {
      const messageData = {
        sender: userInfo._id,
        content: message.trim(),
        messageType: isCodeMode ? "code" : "text",
        language: isCodeMode ? language : undefined,
      };

      // Add recipient or group based on chat type
      if (selectedChatType === "group") {
        messageData.group = selectedChatData._id;
      } else {
        messageData.recipient = selectedChatData._id;
      }

      if (selectedChatType === "group") {
        socket.emit("groupMessage", {
          groupId: selectedChatData._id,
          content: message.trim(),
          sender: userInfo._id,
          messageType: isCodeMode ? "code" : "text",
          language: isCodeMode ? language : undefined,
        });
      } else {
        socket.emit("sendMessage", messageData);
      }
      setMessage("");
      setIsCodeMode(false);
      handleTypingStatus(false);
    }
  };

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (socket && selectedChatData && userInfo) {
      console.log("Marking messages as read for chat:", selectedChatData._id);
      // Add a small delay to ensure the socket connection is established
      const timer = setTimeout(() => {
        console.log(
          `Emitting markMessagesAsRead - sender: ${selectedChatData._id}, recipient: ${userInfo._id}`
        );
        socket.emit("markMessagesAsRead", {
          reader: userInfo._id,
          chatId: selectedChatData._id,
          chatType: selectedChatType,
        });
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [selectedChatData, userInfo, socket]);

  const toggleCodeMode = () => {
    setIsCodeMode(!isCodeMode);
    if (!isCodeMode) {
      setMessage("");
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isCodeMode && editorContainerRef.current) {
      editorContainerRef.current.scrollTop =
        editorContainerRef.current.scrollHeight;
    }
  }, [message, isCodeMode]);

  return (
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="relative p-3 backdrop-blur-xl bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 border-t border-slate-700/30 z-20"
    >
      {/* Futuristic background pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-indigo-500/5 pointer-events-none" />

      {/* Tech grid overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)`,
          backgroundSize: "15px 15px",
        }}
      />

      <div className="relative">
        <div className="flex items-center gap-2 bg-slate-800/60 backdrop-blur-xl rounded-2xl p-2 border border-slate-600/40 hover:border-cyan-500/40 transition-all duration-300">
          {/* Control buttons */}
          <div className="flex items-center gap-1">
            {/* AI Chat Button */}
            <Button
              variant="ghost"
              size="sm"
              className={`text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/15 w-8 h-8 rounded-lg transition-all duration-300 hidden sm:flex backdrop-blur-sm border p-0 relative group ${
                showAIChat
                  ? "bg-gradient-to-r from-emerald-500/30 via-teal-500/30 to-cyan-500/30 border-emerald-400/50 text-emerald-300"
                  : "border-transparent hover:border-emerald-500/30"
              }`}
              onClick={() => setShowAIChat(!showAIChat)}
            >
              <motion.div whileHover={{ scale: 1.1 }} className="relative">
                <Bot size={16} />
                <motion.div
                  className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.8, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                />
              </motion.div>
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-emerald-400 text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                {showAIChat ? "Back to Chat" : "AI Chat"}
              </div>
            </Button>

            {/* Emoji Picker Button */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/15 w-8 h-8 rounded-lg transition-all duration-300 hidden sm:flex backdrop-blur-sm border border-transparent hover:border-cyan-500/30 p-0"
                onClick={() => setEmojiPickerOpen(!emojiPickerOpen)}
              >
                <motion.div
                  animate={{ rotate: emojiPickerOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Smile size={16} />
                </motion.div>
              </Button>

              <div
                className="absolute bottom-10 left-0 z-50"
                ref={emojiPickerRef}
              >
                <AnimatePresence>
                  {emojiPickerOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="shadow-2xl ring-1 ring-slate-700/50 rounded-2xl overflow-hidden"
                    >
                      <EmojiPicker
                        theme="dark"
                        onEmojiClick={handleEmojiClick}
                        autoFocusSearch={false}
                        skinTonesDisabled
                        searchDisabled
                        previewConfig={{ showPreview: false }}
                        width={280}
                        height={350}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Code Mode Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className={`w-8 h-8 rounded-lg transition-all duration-300 backdrop-blur-md border p-0 ${
                isCodeMode
                  ? "bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-pink-500/30 border-indigo-400/50 text-indigo-300"
                  : "text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/15 border-transparent hover:border-indigo-500/30"
              }`}
              onClick={toggleCodeMode}
            >
              <Code size={16} />
              {isCodeMode && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full"
                />
              )}
            </Button>
          </div>

          {/* Input Area */}
          <div className="flex-1 relative">
            {isCodeMode ? (
              <div
                ref={editorContainerRef}
                className="w-full bg-slate-900/80 backdrop-blur-md rounded-lg border border-slate-600/50 hover:border-indigo-500/40 focus-within:border-indigo-500/60 transition-all duration-300"
                style={{
                  overflowY: "auto",
                  maxHeight: "120px",
                  minHeight: "50px",
                }}
              >
                <Editor
                  value={message}
                  onValueChange={setMessage}
                  highlight={(code) => highlight(code, languages[language])}
                  padding={12}
                  style={{
                    fontFamily:
                      '"JetBrains Mono", "SF Mono", "Consolas", monospace',
                    fontSize: "12px",
                    lineHeight: "1.5",
                    color: "#f1f5f9",
                  }}
                  preClassName={`language-${language} custom-scrollbar`}
                  onKeyDown={(e) =>
                    e.key === "Enter" && !e.shiftKey && handleSendMessage()
                  }
                  placeholder="Write your code here..."
                  className="bg-transparent border-0 text-white placeholder:text-slate-400 focus-visible:ring-0 rounded-lg"
                />
              </div>
            ) : (
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Type your message..."
                  className="w-full bg-slate-900/80 backdrop-blur-md border border-slate-600/50 text-white placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-cyan-500/40 focus-visible:border-cyan-500/60 rounded-lg py-2.5 px-4 text-sm transition-all duration-300 hover:border-slate-500/60 h-10"
                  onChange={handleInputChange}
                  value={message}
                  onKeyDown={(e) =>
                    e.key === "Enter" && !e.shiftKey && handleSendMessage()
                  }
                  autoFocus
                />

                {/* Futuristic input glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-lg opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            )}
          </div>

          {/* Send Button */}
          <Button
            variant="ghost"
            size="sm"
            className={`w-8 h-8 rounded-lg transition-all duration-300 backdrop-blur-md border relative overflow-hidden p-0 ${
              message.trim()
                ? "bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 border-cyan-400/60 text-white hover:from-cyan-600 hover:via-blue-600 hover:to-indigo-700 shadow-cyan-500/40 hover:shadow-cyan-500/60"
                : "text-slate-400 hover:text-white hover:bg-slate-700/60 border-slate-600/40 hover:border-slate-500/60"
            }`}
            onClick={handleSendMessage}
            disabled={!message.trim()}
          >
            {message.trim() && (
              <>
                <motion.div
                  animate={{
                    backgroundPosition: ["0% 0%", "100% 100%"],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-blue-400/20 to-indigo-400/20 opacity-60"
                  style={{ backgroundSize: "200% 200%" }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/30 to-indigo-400/30 rounded-lg animate-ping opacity-20" />
              </>
            )}

            <motion.div
              animate={{
                x: message.trim() ? [0, 1, 0] : 0,
                scale: message.trim() ? [1, 1.05, 1] : 1,
              }}
              transition={{
                duration: message.trim() ? 1.5 : 0.3,
                repeat: message.trim() ? Infinity : 0,
                repeatType: "loop",
              }}
              className="relative z-10"
            >
              {message.trim() ? (
                <Zap size={16} className="rotate-12" />
              ) : (
                <Send size={16} />
              )}
            </motion.div>
          </Button>
        </div>

        {/* Message Suggestions */}
        {!isCodeMode && (suggestions.length > 0 || isSuggestionsLoading) && (
          <div className="absolute bottom-full left-0 right-0 mb-2 px-3">
            <div className="relative">
              <MessageSuggestions
                suggestions={suggestions}
                onSuggestionClick={handleSuggestionClick}
                isLoading={isSuggestionsLoading}
              />
              {/* Add a gradient fade at the bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none" />
            </div>
          </div>
        )}

        {/* Status indicators */}
        {(isCodeMode || message.trim()) && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between px-2 mt-1"
          ></motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default MessageBar;