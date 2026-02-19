import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import moment from "moment";
import { useStore } from "@/store/store";
import { useSocket } from "@/context/SocketContext";
import apiClient from "@/lib/apiClient";
import { motion, AnimatePresence } from "framer-motion";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/themes/prism-tomorrow.css";
import { toast } from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  Copy,
  Check,
  AlertTriangle,
  Smile,
  ThumbsUp,
  Heart,
  Laugh,
  Plus,
  Zap,
  Clock,
} from "lucide-react";

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

const MessageContainer = () => {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const messageRefs = useRef({});
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const [showActionsFor, setShowActionsFor] = useState(null);
  const [actionDialogPosition, setActionDialogPosition] = useState({
    x: 0,
    y: 0,
  });
  const [actionDialogVisible, setActionDialogVisible] = useState(false);

  const {
    selectedChatData,
    userInfo,
    selectedChatType,
    selectedChatMessages,
    setSelectedChatMessages,
    typingUsers,
  } = useStore();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const socket = useSocket();

  // Check if device is mobile/touch
  useEffect(() => {
    const checkDevice = () => {
      const isTouchDevice =
        "ontouchstart" in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth < 768;
      setIsMobile(isTouchDevice || isSmallScreen);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  const scrollToBottom = () => {
    setIsScrolling(true);
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
    setTimeout(() => setIsScrolling(false), 1000);
  };

  const fetchMessages = async () => {
    try {
      const res = await apiClient.post(
        "/api/message/get-messages",
        { id: selectedChatData._id },
        { withCredentials: true }
      );
      if (res.data.chat) {
        setSelectedChatMessages(res.data.chat);

        // Mark messages as read after fetching
        if (socket && userInfo) {
          console.log("Marking messages as read after fetch");
          setTimeout(() => {
            console.log(
              `Emitting markMessagesAsRead after fetch - sender: ${selectedChatData._id}, recipient: ${userInfo._id}`
            );
            socket.emit("markMessagesAsRead", {
              sender: selectedChatData._id,
              recipient: userInfo._id,
            });
          }, 500);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedChatMessages]);

  const fetchGroupMessages = async () => {
    try {
      const res = await apiClient.get(
        `/api/groups/${selectedChatData._id}/messages`,
        { withCredentials: true }
      );
      if (res.data.success) {
        setSelectedChatMessages(res.data.messages);
      }
    } catch (err) {
      console.error("Error fetching group messages:", err);
      toast.error("Failed to load group messages");
    }
  };

  useEffect(() => {
    if (selectedChatData) {
      if (selectedChatType === "dm") {
        fetchMessages();
      } else if (selectedChatType === "group") {
        fetchGroupMessages();
      }
    }
  }, [selectedChatData, selectedChatType, setSelectedChatMessages]);

  // Join/leave group room to enable real-time message and deletion events
  useEffect(() => {
    if (!socket || typeof socket.emit !== "function") return;

    if (selectedChatType === "group" && selectedChatData) {
      socket.emit("joinGroup", selectedChatData._id);

      return () => {
        socket.emit("leaveGroup", selectedChatData._id);
      };
    }
  }, [socket, selectedChatType, selectedChatData]);

  // Copy message handler
  const handleCopyMessage = async (messageId, content) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setShowActionsFor(null);

      toast.success("Message copied!", {
        duration: 2000,
        style: {
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "#f1f5f9",
          border: "1px solid #06b6d4",
          borderRadius: "16px",
        },
      });

      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      toast.error("Failed to copy message", {
        duration: 2000,
        style: {
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "#f1f5f9",
          border: "1px solid #dc2626",
          borderRadius: "16px",
        },
      });
    }
  };

  const handleDeleteMessage = async () => {
    if (!selectedMessage) return;

    try {
      if (selectedChatType === "dm") {
        socket.emit("deleteMessage", {
          messageId: selectedMessage._id,
          sender: selectedMessage.sender._id,
          recipient: selectedMessage.recipient._id,
        });
      } else if (selectedChatType === "group") {
        socket.emit("groupMessageDelete", {
          messageId: selectedMessage._id,
          groupId: selectedChatData._id,
        });
      }

      setShowDeleteDialog(false);
      setShowActionsFor(null);

      toast.success("Message deleted successfully", {
        duration: 3000,
        style: {
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "#f1f5f9",
          border: "1px solid #374151",
          borderRadius: "16px",
        },
      });
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Failed to delete message", {
        duration: 3000,
        style: {
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "#f1f5f9",
          border: "1px solid #dc2626",
          borderRadius: "16px",
        },
      });
    }
  };

  const openDeleteDialog = (message) => {
    setSelectedMessage(message);
    setShowDeleteDialog(true);
  };

  // Toggle reaction handler - removes reaction if same emoji clicked
  const handleToggleReaction = (messageId, emoji) => {
    if (socket && userInfo) {
      // Check if user already reacted with this emoji
      const message = selectedChatMessages.find((msg) => msg._id === messageId);
      const userReaction = message?.reactions?.find((r) => {
        const userId = r.user?._id || r.user;
        const currentUserId = userInfo._id;
        return userId === currentUserId && r.emoji === emoji;
      });

      if (userReaction) {
        // Remove reaction by sending the same addReaction event (server will toggle)
        socket.emit("addReaction", {
          messageId,
          emoji,
          userId: userInfo._id,
        });
      } else {
        // Add reaction
        socket.emit("addReaction", {
          messageId,
          emoji,
          userId: userInfo._id,
        });
      }
      setShowActionsFor(null);
    }
  };

  // Get user's reactions for a message
  const getUserReactions = (reactions, userId) => {
    if (!reactions || reactions.length === 0) return [];
    return reactions.filter((r) => {
      const reactionUserId = r.user?._id || r.user;
      return reactionUserId === userId;
    });
  };

  // Get reaction counts
  const getReactionCounts = (reactions) => {
    if (!reactions || reactions.length === 0) return {};
    const counts = {};
    reactions.forEach((r) => {
      counts[r.emoji] = (counts[r.emoji] || 0) + 1;
    });
    return counts;
  };

  // Hide actions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        !e.target.closest(".message-actions") &&
        !e.target.closest(".message-bubble")
      ) {
        setShowActionsFor(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatMessagePreview = (content) => {
    if (!content) return "Empty message";
    return content.length > 100 ? content.substring(0, 100) + "..." : content;
  };

  const renderMessages = () => {
    let lastDate = null;
    return selectedChatMessages.map((message, index) => {
      const messageDate = moment(message.timeStamp).format("DD-MM-YYYY");
      const showDate = lastDate !== messageDate;
      lastDate = messageDate;

      const isSender =
        selectedChatType === "dm"
          ? typeof message.sender === "object"
            ? message.sender._id === userInfo._id
            : message.sender === userInfo._id
          : message.sender._id === userInfo._id;

      const isCopied = copiedMessageId === message._id;
      const showActions = showActionsFor === message._id;
      const userReactions = getUserReactions(message.reactions, userInfo._id);
      const reactionCounts = getReactionCounts(message.reactions);

      return (
        <motion.div
          key={message._id || index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          {showDate && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="sticky top-4 bg-gradient-to-r from-slate-800/90 via-slate-700/90 to-slate-800/90 backdrop-blur-xl text-slate-300 py-3 px-6 text-center text-sm rounded-full my-6 z-10 w-fit border border-slate-600/50 shadow-2xl font-medium"
            >
              {moment(messageDate, "DD-MM-YYYY").format("MMMM Do, YYYY")}
            </motion.div>
          )}

          <div
            className={`flex ${
              isSender ? "justify-end" : "justify-start"
            } w-full my-2 px-2 sm:px-4`}
          >
            <div
              ref={(el) => (messageRefs.current[message._id] = el)}
              className="relative max-w-[85%] sm:max-w-[70%] group message-container min-w-0"
              onMouseEnter={(e) => {
                if (!isMobile) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHoveredMessageId(message._id);
                  setActionDialogPosition({
                    x: isSender ? rect.right - 300 : rect.left,
                    y: rect.top - 80,
                  });
                  setActionDialogVisible(true);
                }
              }}
              onMouseLeave={() => {
                if (!isMobile) {
                  setHoveredMessageId(null);
                  setActionDialogVisible(false);
                }
              }}
              style={{
                wordWrap: "break-word",
                overflowWrap: "break-word",
                maxWidth: isMobile ? "85%" : "70%",
                overflow: "visible",
                zIndex: hoveredMessageId === message._id ? 100 : 1,
                position: "relative",
              }}
            >
              {/* FUTURISTIC ACTION BUTTONS ABOVE MESSAGE */}
              <AnimatePresence>
                {(showActions ||
                  (!isMobile && hoveredMessageId === message._id)) && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 10 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className={`absolute message-actions ${
                      isSender ? "right-0" : "left-0"
                    }`}
                    style={{
                      top: "-85px",
                      zIndex: 99999,
                      pointerEvents: "auto",
                      transform: "translateY(0)",
                      position: "absolute",
                      visibility: "visible",
                      opacity: 1,
                      willChange: "transform",
                      backfaceVisibility: "hidden",
                    }}
                  >
                    <div
                      className="bg-gradient-to-r from-slate-800/98 via-slate-700/98 to-slate-800/98 backdrop-blur-2xl rounded-3xl shadow-2xl border-2 border-cyan-500/50 p-3 flex items-center gap-3"
                      style={{
                        boxShadow:
                          "0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 0 2px rgba(6, 182, 212, 0.3), 0 0 20px rgba(6, 182, 212, 0.2)",
                        zIndex: 99999,
                        position: "relative",
                      }}
                    >
                      {/* Modern Emoji Reactions */}
                      <div className="flex gap-2 px-3 py-2 bg-slate-900/60 rounded-2xl border border-slate-600/40">
                        {REACTION_EMOJIS.map((emoji) => {
                          const hasReaction = userReactions.some(
                            (r) => r.emoji === emoji
                          );
                          return (
                            <motion.button
                              key={emoji}
                              whileHover={{ scale: 1.15, y: -2 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleReaction(message._id, emoji);
                              }}
                              className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 text-lg relative overflow-hidden ${
                                hasReaction
                                  ? "bg-gradient-to-r from-cyan-500/30 via-blue-500/30 to-indigo-500/30 border-2 border-cyan-400/60 shadow-lg shadow-cyan-500/25 scale-110"
                                  : "hover:bg-slate-700/60 hover:scale-105 border border-transparent hover:border-slate-500/50"
                              }`}
                              title={
                                hasReaction
                                  ? `Remove ${emoji} reaction`
                                  : `Add ${emoji} reaction`
                              }
                            >
                              {hasReaction && (
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-2xl animate-pulse" />
                              )}
                              <span className="relative z-10">{emoji}</span>
                            </motion.button>
                          );
                        })}
                      </div>

                      {/* Enhanced Copy Button */}
                      <motion.button
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyMessage(message._id, message.content);
                        }}
                        className="w-12 h-12 rounded-2xl bg-gradient-to-r from-emerald-500/25 to-teal-500/25 hover:from-emerald-500/35 hover:to-teal-500/35 border border-emerald-400/50 flex items-center justify-center transition-all duration-300 group/btn shadow-lg shadow-emerald-500/20 relative overflow-hidden"
                        title="Copy message"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 to-teal-400/10 rounded-2xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                        {isCopied ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Check
                              size={20}
                              className="text-emerald-400 relative z-10"
                            />
                          </motion.div>
                        ) : (
                          <Copy
                            size={20}
                            className="text-emerald-400 group-hover/btn:text-emerald-300 relative z-10"
                          />
                        )}
                      </motion.button>

                      {/* Enhanced Delete Button (only for sender) */}
                      {isSender && (
                        <motion.button
                          whileHover={{ scale: 1.05, rotate: -5 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteDialog(message);
                          }}
                          className="w-12 h-12 rounded-2xl bg-gradient-to-r from-red-500/25 to-pink-500/25 hover:from-red-500/35 hover:to-pink-500/35 border border-red-400/50 flex items-center justify-center transition-all duration-300 group/btn shadow-lg shadow-red-500/20 relative overflow-hidden"
                          title="Delete message"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-red-400/10 to-pink-400/10 rounded-2xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                          <Trash2
                            size={20}
                            className="text-red-400 group-hover/btn:text-red-300 relative z-10"
                          />
                        </motion.button>
                      )}
                    </div>

                    {/* Futuristic Arrow */}
                    <div
                      className={`absolute top-full ${
                        isSender ? "right-6" : "left-6"
                      }`}
                    >
                      <motion.div
                        animate={{ y: [0, 2, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-0 h-0 border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent border-t-slate-700/95"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Debug hover indicator */}
              {!isMobile && hoveredMessageId === message._id && (
                <div
                  className="absolute -top-2 -right-2 w-4 h-4 bg-cyan-400 rounded-full animate-pulse z-50"
                  style={{ zIndex: 99998 }}
                />
              )}

              {/* ENHANCED MESSAGE BUBBLE */}
              <motion.div
                className="message-bubble"
                whileHover={{ scale: 1.01, y: -1 }}
                transition={{ duration: 0.2 }}
                onClick={() => {
                  if (isMobile) {
                    setShowActionsFor(showActions ? null : message._id);
                  }
                }}
              >
                <div
                  className={`px-6 py-4 rounded-3xl relative overflow-hidden cursor-pointer select-none backdrop-blur-xl border-2 ${
                    isSender
                      ? message.messageType === "code"
                        ? "bg-gradient-to-br from-slate-800/90 via-slate-700/90 to-slate-800/90 text-white border-slate-600/60 shadow-2xl shadow-slate-800/30"
                        : "bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 text-white shadow-2xl shadow-cyan-500/30 border-cyan-400/30"
                      : message.messageType === "code"
                      ? "bg-gradient-to-br from-slate-700/90 via-slate-600/90 to-slate-700/90 text-white border-slate-500/60 shadow-2xl shadow-slate-700/30"
                      : "bg-gradient-to-br from-slate-600/90 via-slate-500/90 to-slate-600/90 text-white shadow-2xl shadow-slate-600/30 border-slate-400/30"
                  } ${
                    showActions
                      ? "ring-2 ring-cyan-400/60 shadow-3xl shadow-cyan-500/30"
                      : ""
                  } hover:shadow-3xl transition-all duration-300 break-words word-wrap`}
                >
                  {/* Animated shine effect */}
                  <motion.div
                    animate={{
                      x: ["-200%", "200%"],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "loop",
                      ease: "linear",
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform opacity-0 group-hover:opacity-100"
                  />

                  {/* Sender name for group chats */}
                  {selectedChatType === "group" && !isSender && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-slate-300 mb-3 font-semibold flex items-center gap-2"
                    >
                      <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" />
                      {message.sender.firstName} {message.sender.lastName}
                    </motion.div>
                  )}

                  {/* Enhanced Code message rendering */}
                  {message.messageType === "code" ? (
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between bg-slate-900/80 backdrop-blur-md px-4 py-3 rounded-2xl border border-slate-600/50">
                        <div className="flex items-center gap-3">
                          <Zap size={16} className="text-indigo-400" />
                          <span className="text-sm text-indigo-300 font-bold uppercase tracking-wider">
                            {message.language || "code"}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 font-mono">
                          CODE BLOCK
                        </div>
                      </div>
                      <pre
                        className="text-sm font-mono overflow-x-auto whitespace-pre-wrap break-words bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl max-w-full border border-slate-600/40 shadow-inner"
                        style={{
                          wordWrap: "break-word",
                          overflowWrap: "anywhere",
                          wordBreak: "break-word",
                          maxWidth: "100%",
                          overflowX: "auto",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        <code
                          className="break-all overflow-wrap-anywhere word-break-break-word"
                          style={{
                            wordWrap: "break-word",
                            overflowWrap: "anywhere",
                            wordBreak: "break-word",
                            whiteSpace: "pre-wrap",
                            maxWidth: "100%",
                          }}
                          dangerouslySetInnerHTML={{
                            __html: highlight(
                              message.content,
                              languages[message.language || "javascript"],
                              message.language || "javascript"
                            ),
                          }}
                        />
                      </pre>
                    </div>
                  ) : (
                    <div className="text-base leading-relaxed relative z-10 font-medium message-text-content overflow-hidden">
                      <p
                        className="break-all overflow-wrap-anywhere word-break-break-word whitespace-pre-wrap hyphens-auto max-w-full"
                        style={{
                          wordWrap: "break-word",
                          overflowWrap: "anywhere",
                          wordBreak: "break-word",
                          whiteSpace: "pre-wrap",
                          maxWidth: "100%",
                          overflowX: "hidden",
                          lineBreak: "anywhere",
                          hyphens: "auto",
                        }}
                      >
                        {message.content}
                      </p>
                    </div>
                  )}

                  {/* Enhanced timestamp and read receipt */}
                  <div className="flex items-center justify-end gap-3 mt-4">
                    <span className="text-sm text-white/80 font-medium flex items-center gap-2">
                      {moment(message.timeStamp).format("HH:mm")}
                    </span>
                    {isSender && (
                      <div className="flex items-center">
                        {message.isRead ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-sm text-cyan-300 flex items-center gap-1"
                            title={
                              message.readAt
                                ? `Read at ${moment(message.readAt).format(
                                    "HH:mm, DD MMM"
                                  )}`
                                : "Read"
                            }
                          >
                            <motion.svg
                              animate={{ pathLength: [0, 1] }}
                              transition={{ duration: 0.5 }}
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="ml-1"
                            >
                              <motion.path
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                d="M18 6 7 17l-5-5"
                              />
                              <motion.path
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                                d="m22 10-7.5 7.5L13 16"
                              />
                            </motion.svg>
                          </motion.div>
                        ) : (
                          <div
                            className="text-sm text-slate-400 flex items-center gap-1"
                            title={
                              message.deliveredAt
                                ? `Delivered at ${moment(
                                    message.deliveredAt
                                  ).format("HH:mm, DD MMM")}`
                                : "Delivered"
                            }
                          >
                            <motion.svg
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="ml-1"
                            >
                              <path d="m5 12 5 5L20 7" />
                            </motion.svg>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* ENHANCED REACTIONS DISPLAY */}
              {message.reactions && message.reactions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-wrap gap-2 mt-3 ml-4"
                >
                  {Object.entries(reactionCounts).map(([emoji, count]) => {
                    const hasUserReacted = getUserReactions(
                      message.reactions,
                      userInfo._id
                    ).some((r) => r.emoji === emoji);
                    return (
                      <motion.div
                        key={emoji}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-3 py-2 rounded-2xl text-sm flex items-center gap-2 border transition-all cursor-pointer backdrop-blur-md font-semibold ${
                          hasUserReacted
                            ? "bg-gradient-to-r from-cyan-500/25 to-blue-500/25 border-cyan-400/50 text-cyan-300 shadow-lg shadow-cyan-500/20"
                            : "bg-slate-700/60 border-slate-600/50 text-slate-300 hover:bg-slate-600/60 hover:border-slate-500/60"
                        }`}
                        onClick={() => {
                          console.log(
                            "Reaction chip clicked:",
                            emoji,
                            "hasUserReacted:",
                            hasUserReacted
                          );
                          handleToggleReaction(message._id, emoji);
                        }}
                        title={
                          hasUserReacted
                            ? `Remove your ${emoji} reaction`
                            : `React with ${emoji}`
                        }
                      >
                        <span className="text-base">{emoji}</span>
                        <motion.span
                          key={count}
                          initial={{ scale: 1.5 }}
                          animate={{ scale: 1 }}
                          className="text-sm font-bold"
                        >
                          {count}
                        </motion.span>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      );
    });
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col relative"
      style={{
        height: "100%",
        minHeight: 0,
        maxHeight: "100%",
        overflow: "visible",
      }}
    >
      {/* FUTURISTIC BACKGROUND ELEMENTS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated gradient orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse",
            delay: 2,
          }}
          className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl"
        />

        {/* Tech grid pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgb(6 182 212) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* MESSAGES SECTION */}
      <div
        className="flex-1 overflow-y-auto overflow-x-visible p-4 sm:p-6 relative z-10 scrollbar-thin scrollbar-track-slate-800/50 scrollbar-thumb-cyan-500/50 hover:scrollbar-thumb-cyan-400/70"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(6, 182, 212, 0.5) rgba(30, 41, 59, 0.3)",
          WebkitOverflowScrolling: "touch",
          overscrollBehavior: "contain",
          scrollBehavior: "smooth",
          overflowX: "visible",
        }}
      >
        <div
          className="flex flex-col space-y-4 min-h-full w-full max-w-full"
          style={{ overflow: "visible", position: "relative" }}
        >
          {renderMessages()}

          {/* ENHANCED TYPING INDICATOR */}
          {selectedChatData && typingUsers[selectedChatData._id] && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="flex items-center gap-3 p-2 mb-4"
            >
              <div className="flex items-center gap-4 bg-gradient-to-r from-slate-700/80 to-slate-600/80 backdrop-blur-xl px-6 py-4 rounded-3xl border border-slate-500/40 shadow-2xl">
                <div className="flex space-x-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{
                        y: [0, -8, 0],
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.2,
                        delay: i * 0.2,
                        ease: "easeInOut",
                      }}
                      className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full shadow-lg shadow-cyan-400/60"
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-cyan-400" />
                  <span className="text-sm text-slate-300 font-semibold">
                    {selectedChatData.firstName} is typing...
                  </span>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} className="h-6" />
        </div>
      </div>

      {/* Enhanced Message Text Overflow Styles + Action Dialog Fix */}
      <style>{`
        .message-text-content {
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
          word-break: break-word !important;
          hyphens: auto !important;
          white-space: pre-wrap !important;
          max-width: 100% !important;
          overflow-x: hidden !important;
          line-break: anywhere !important;
        }
        
        .message-text-content p {
          word-wrap: break-word !important;
          overflow-wrap: anywhere !important;
          word-break: break-word !important;
          white-space: pre-wrap !important;
          max-width: 100% !important;
          overflow-x: hidden !important;
          line-break: anywhere !important;
          hyphens: auto !important;
          margin: 0 !important;
        }
        
        .message-container {
          min-width: 0 !important;
          word-wrap: break-word !important;
          overflow: visible !important;
          position: relative !important;
        }
        
        /* Handle extremely long strings without spaces */
        .message-text-content p {
          /* Modern CSS approach */
          overflow-wrap: anywhere !important;
          word-break: break-word !important;
          
          /* Fallback for older browsers */
          -ms-word-break: break-all !important;
          word-break: break-all !important;
          word-break: break-word !important;
          
          /* Additional containment */
          contain: layout style !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
        }
        
        /* ACTION DIALOG VISIBILITY FIXES */
        .message-actions {
          z-index: 9999 !important;
          position: absolute !important;
          pointer-events: auto !important;
          visibility: visible !important;
          opacity: 1 !important;
          transform: translateZ(0) !important;
          will-change: transform !important;
        }
        
        .group:hover .message-actions {
          opacity: 1 !important;
          visibility: visible !important;
          display: block !important;
        }
        
        /* Ensure parent containers don't clip the actions */
        .message-container:hover {
          z-index: 100 !important;
          overflow: visible !important;
        }
        
        .message-container.group:hover {
          overflow: visible !important;
          z-index: 100 !important;
        }
        
        /* Fix for action buttons container */
        .message-actions > div {
          background: rgba(30, 41, 59, 0.98) !important;
          backdrop-filter: blur(20px) !important;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8), 
                      0 0 0 1px rgba(99, 102, 241, 0.3),
                      0 0 20px rgba(6, 182, 212, 0.2) !important;
          border: 2px solid rgba(99, 102, 241, 0.3) !important;
          transform: translateZ(0) !important;
        }
        
        /* Enhanced visibility on hover */
        .group:hover .message-actions > div {
          background: rgba(30, 41, 59, 0.99) !important;
          backdrop-filter: blur(25px) !important;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.9), 
                      0 0 0 2px rgba(6, 182, 212, 0.5),
                      0 0 30px rgba(6, 182, 212, 0.3) !important;
          border: 2px solid rgba(6, 182, 212, 0.5) !important;
        }
        
        /* Prevent clipping in scroll containers */
        .flex-1.overflow-y-auto {
          overflow-x: visible !important;
        }
        
        /* For mobile devices */
        @media (max-width: 640px) {
          .message-container {
            max-width: 85% !important;
          }
          
          .message-text-content {
            word-break: break-all !important;
            overflow-wrap: anywhere !important;
          }
          
          .message-actions {
            top: -70px !important;
            left: 50% !important;
            right: auto !important;
            transform: translateX(-50%) !important;
          }
        }
      `}</style>

      {/* ENHANCED DELETE DIALOG */}
      <AnimatePresence>
        {showDeleteDialog && (
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogContent
              className={`bg-gradient-to-br from-slate-900/98 via-slate-800/98 to-slate-900/98 backdrop-blur-2xl border-2 border-slate-600/60 text-white shadow-2xl rounded-3xl bg-slate-800 ${
                isMobile ? "w-[95vw] max-w-md mx-auto" : "max-w-2xl"
              }`}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <DialogHeader className="space-y-6">
                  <div className="flex items-center gap-4">
                    <motion.div
                      animate={{
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-16 h-16 rounded-3xl bg-gradient-to-r from-red-500/30 via-pink-500/30 to-red-600/30 flex items-center justify-center border-2 border-red-400/50 shadow-2xl shadow-red-500/20 backdrop-blur-md"
                    >
                      <AlertTriangle size={28} className="text-red-400" />
                    </motion.div>
                    <div>
                      <DialogTitle className="text-2xl font-bold text-white mb-2">
                        Delete Message
                      </DialogTitle>
                      <DialogDescription className="text-slate-400 text-base">
                        This action cannot be undone and will remove the message
                        permanently
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                <div className="py-8">
                  {selectedMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 rounded-3xl bg-gradient-to-r from-slate-800/70 to-slate-700/70 backdrop-blur-xl border-2 border-slate-600/50 space-y-6 shadow-2xl"
                    >
                      <div className="flex items-center gap-4">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-2xl shadow-cyan-500/30"
                        >
                          {selectedMessage.sender?.firstName?.charAt(0) ||
                            selectedMessage.sender?.email
                              ?.charAt(0)
                              ?.toUpperCase() ||
                            "?"}
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-lg text-white truncate">
                            {selectedMessage.sender?.firstName &&
                            selectedMessage.sender?.lastName
                              ? `${selectedMessage.sender.firstName} ${selectedMessage.sender.lastName}`
                              : selectedMessage.sender?.email?.split("@")[0] ||
                                "Unknown User"}
                          </div>
                          <div className="text-sm text-slate-400 flex items-center gap-2">
                            {new Date(
                              selectedMessage.timeStamp
                            ).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-600/50">
                        <p className="text-slate-300 text-base leading-relaxed">
                          {formatMessagePreview(selectedMessage.content)}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>

                <DialogFooter
                  className={`gap-4 ${isMobile ? "flex-col" : "flex-row"}`}
                >
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteDialog(false)}
                    className={`border-2 border-slate-600/60 bg-slate-800/70 backdrop-blur-md text-slate-200 hover:bg-slate-700/70 hover:border-slate-500/80 transition-all duration-200 rounded-2xl py-3 px-6 font-semibold ${
                      isMobile ? "w-full" : ""
                    }`}
                  >
                    Cancel
                  </Button>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={handleDeleteMessage}
                      className={`bg-gradient-to-r from-red-600 via-red-500 to-pink-600 hover:from-red-700 hover:via-red-600 hover:to-pink-700 text-white shadow-2xl hover:shadow-red-500/40 transition-all duration-200 rounded-2xl py-3 px-6 font-bold border-2 border-red-400/50 ${
                        isMobile ? "w-full" : ""
                      }`}
                    >
                      <Trash2 className="h-5 w-5 mr-3" />
                      Delete Message
                    </Button>
                  </motion.div>
                </DialogFooter>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MessageContainer;