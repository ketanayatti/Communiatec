import { useState, useEffect } from "react";
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Trash2,
  Share,
  User,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import apiClient from "@/lib/apiClient";
import { useSocket } from "@/context/SocketContext";

const NotificationPanel = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const { socket } = useSocket();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/api/zoro/notifications?limit=20");
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    if (socket) {
      // Listen for new vault notifications
      const handleVaultNotification = () => {
        if (isOpen) {
          fetchNotifications();
        } else {
          setUnreadCount((prev) => prev + 1);
        }
      };

      socket.on("vaultFileShared", handleVaultNotification);
      socket.on("vaultFileAccepted", handleVaultNotification);

      return () => {
        socket.off("vaultFileShared", handleVaultNotification);
        socket.off("vaultFileAccepted", handleVaultNotification);
      };
    }
  }, [socket, isOpen]);

  const markAsRead = async (notificationId) => {
    try {
      await apiClient.patch(`/api/zoro/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Failed to mark notification as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.patch("/api/zoro/notifications/mark-all-read");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast.error("Failed to mark all notifications as read");
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "vault_file_shared":
        return <Share className="w-5 h-5 text-cyan-400" />;
      case "vault_file_received":
        return <Check className="w-5 h-5 text-green-400" />;
      default:
        return <Bell className="w-5 h-5 text-slate-400" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-20"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ type: "spring", duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900/95 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl max-w-md w-full max-h-[70vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="relative p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-b border-slate-700/50 flex-shrink-0">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all duration-300"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Bell className="w-6 h-6 text-indigo-400" />
                    {unreadCount > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.1 }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center ring-2 ring-slate-900 shadow-lg shadow-red-500/60 z-20"
                      >
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </motion.div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      Notifications
                    </h2>
                    <p className="text-sm text-slate-400">
                      {unreadCount} unread
                    </p>
                  </div>
                </div>

                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 border border-indigo-500/30 rounded-lg transition-all duration-300"
                  >
                    <CheckCheck className="w-3 h-3" />
                    Mark all read
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <div className="w-8 h-8 border-4 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-sm text-slate-400">Loading...</p>
                  </div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <Bell className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-50" />
                    <p className="text-slate-400">No notifications yet</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {notifications.map((notification, index) => (
                    <motion.div
                      key={notification._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                        notification.read
                          ? "bg-slate-800/30 border-slate-700/30 hover:bg-slate-800/50"
                          : "bg-indigo-500/10 border-indigo-500/30 hover:bg-indigo-500/15"
                      }`}
                      onClick={() =>
                        !notification.read && markAsRead(notification._id)
                      }
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-xl ${
                            notification.read
                              ? "bg-slate-700/50"
                              : "bg-indigo-500/20"
                          }`}
                        >
                          {getNotificationIcon(notification.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3
                              className={`font-medium truncate ${
                                notification.read
                                  ? "text-slate-300"
                                  : "text-white"
                              }`}
                            >
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 mt-2" />
                            )}
                          </div>

                          <p
                            className={`text-sm mt-1 ${
                              notification.read
                                ? "text-slate-400"
                                : "text-slate-300"
                            }`}
                          >
                            {notification.message}
                          </p>

                          <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                            <Clock className="w-3 h-3" />
                            <span>{formatDate(notification.createdAt)}</span>
                            {notification.sender && (
                              <>
                                <span>•</span>
                                <User className="w-3 h-3" />
                                <span>
                                  {notification.sender.firstName &&
                                  notification.sender.lastName
                                    ? `${notification.sender.firstName} ${notification.sender.lastName}`
                                    : notification.sender.email}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const NotificationBadge = () => {
  const [showPanel, setShowPanel] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { socket } = useSocket();

  useEffect(() => {
    // Fetch initial notification count
    const fetchNotificationCount = async () => {
      try {
        const response = await apiClient.get(
          "/api/zoro/notifications?unreadOnly=true&limit=1"
        );
        setUnreadCount(response.data.unreadCount || 0);
      } catch (error) {
        console.error("Error fetching notification count:", error);
      }
    };

    fetchNotificationCount();
  }, []);

  useEffect(() => {
    if (socket) {
      const handleVaultNotification = () => {
        setUnreadCount((prev) => prev + 1);
      };

      socket.on("vaultFileShared", handleVaultNotification);
      socket.on("vaultFileAccepted", handleVaultNotification);

      // Request current notification count on connect
      socket.emit("requestVaultNotifications");

      return () => {
        socket.off("vaultFileShared", handleVaultNotification);
        socket.off("vaultFileAccepted", handleVaultNotification);
      };
    }
  }, [socket]);

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowPanel(true)}
        className="relative p-3 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all duration-300"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.2 }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center ring-2 ring-slate-900 shadow-lg shadow-red-500/60 z-20"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.div>
        )}
      </motion.button>

      <NotificationPanel
        isOpen={showPanel}
        onClose={() => {
          setShowPanel(false);
          // Refresh count when closing
          setTimeout(async () => {
            try {
              const response = await apiClient.get(
                "/api/zoro/notifications?unreadOnly=true&limit=1"
              );
              setUnreadCount(response.data.unreadCount || 0);
            } catch (error) {
              console.error("Error refreshing notification count:", error);
            }
          }, 100);
        }}
      />
    </>
  );
};

export default NotificationBadge;
