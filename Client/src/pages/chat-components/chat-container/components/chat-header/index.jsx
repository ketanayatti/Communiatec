import { useState, useEffect } from "react";
import { useStore } from "@/store/store";
import { UserCircle2, Search, X } from "lucide-react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import ProfileView from "@/pages/chat-components/contacts-container/components/profile-view";
import GroupProfileView from "@/pages/chat-components/contacts-container/components/group-profile-view";
import { motion, AnimatePresence } from "framer-motion";
import { MdCancel } from "react-icons/md";

const ChatHeader = () => {
  const {
    selectedChatData,
    selectedChatMessages,
    setSelectedChatMessages,
    userInfo,
    selectedChatType,
    onlineUsers,
  } = useStore();

  const [showProfile, setShowProfile] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isUserAlone, setIsUserAlone] = useState(true);
  const [originalMessages, setOriginalMessages] = useState([]);

  // Store original messages when search starts
  useEffect(() => {
    if (!isSearching && selectedChatMessages.length > 0) {
      setOriginalMessages(selectedChatMessages);
    }
  }, [selectedChatMessages, isSearching]);

  // Check if user is alone (you can implement your own logic here)
  useEffect(() => {
    const checkUserStatus = () => {
      const isDocumentVisible = !document.hidden;
      const hasRecentActivity =
        Date.now() - (localStorage.getItem("lastActivity") || 0) < 300000; // 5 minutes

      setIsUserAlone(isDocumentVisible && hasRecentActivity);
    };

    const updateActivity = () => {
      localStorage.setItem("lastActivity", Date.now().toString());
      checkUserStatus();
    };

    document.addEventListener("mousemove", updateActivity);
    document.addEventListener("keypress", updateActivity);
    document.addEventListener("visibilitychange", checkUserStatus);

    checkUserStatus();
    const interval = setInterval(checkUserStatus, 60000);

    return () => {
      document.removeEventListener("mousemove", updateActivity);
      document.removeEventListener("keypress", updateActivity);
      document.removeEventListener("visibilitychange", checkUserStatus);
      clearInterval(interval);
    };
  }, []);

  // Handle search functionality
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setIsSearching(query.length > 0);

    if (query.length > 0) {
      // Filter messages based on search query
      const filteredMessages = originalMessages.filter((message) =>
        message.content?.toLowerCase().includes(query.toLowerCase())
      );
      setSelectedChatMessages(filteredMessages);
    } else {
      // Restore original messages when search is cleared
      setSelectedChatMessages(originalMessages);
    }
  };

  const handleSearchToggle = () => {
    if (showSearch && searchQuery) {
      // Clear search and restore original messages
      setSearchQuery("");
      setIsSearching(false);
      setSelectedChatMessages(originalMessages);
    }
    setShowSearch(!showSearch);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setIsSearching(false);
    setSelectedChatMessages(originalMessages);
  };

  // Get filtered message count for display
  const filteredCount = searchQuery ? selectedChatMessages.length : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative border-b border-slate-700/40 backdrop-blur-xl bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95"
    >
      {/* Futuristic glowing background */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-indigo-500/5 pointer-events-none" />

      {/* Subtle tech grid pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(99 102 241) 1px, transparent 0)`,
          backgroundSize: "15px 15px",
        }}
      />

      {/* Close button with modern styling */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        className="absolute top-2 right-2 z-20 p-1.5 rounded-lg bg-transparent border border-transparent text-transparent hover:bg-slate-800/80 hover:border-slate-600/30 hover:text-slate-400 group-hover:text-red-400 group-hover:bg-red-500/10 group-hover:border-red-500/30 transition-all duration-300 backdrop-blur-md opacity-0 hover:opacity-100"
        onClick={() => (window.location.href = "/chat")}
      >
        <MdCancel className="text-lg" />
      </motion.button>
      {/* Header Content */}
      <div className="relative p-4">
        <div className="flex items-center justify-between gap-3 pr-10 ">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowProfile(true)}
            className="flex items-center gap-3 hover:bg-slate-800/40 p-2 rounded-xl transition-all duration-300 group backdrop-blur-sm border border-transparent hover:border-slate-600/40 flex-1"
          >
            <motion.div whileHover={{ rotate: 2 }} className="relative">
              {/* Glowing avatar ring */}
              <div className="relative inset-0 bg-gradient-to-r from-cyan-400/30 via-blue-500/30 to-indigo-500/30 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <Avatar className="relative h-12 w-12 ring-3 ring-slate-600/50 group-hover:ring-cyan-400/60 transition-all duration-300 shadow-xl">
                {selectedChatData?.image || selectedChatData?.avatar ? (
                  <AvatarImage
                    src={selectedChatData.image || selectedChatData.avatar}
                    alt="Profile"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <UserCircle2 className="text-white w-5 h-5" />
                  </div>
                )}
              </Avatar>

              {/* Advanced online status */}
              {selectedChatType === "dm" &&
                selectedChatData &&
                onlineUsers.includes(selectedChatData._id) && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -bottom-0.5 -right-0.5"
                  ></motion.div>
                )}
            </motion.div>

            <div className="flex-1 text-left min-w-0">
              <motion.h2 className="font-bold text-lg text-white mb-0.5 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:via-blue-400 group-hover:to-indigo-400 group-hover:bg-clip-text transition-all duration-300 truncate">
                {selectedChatType === "group"
                  ? selectedChatData?.name
                  : selectedChatData?.firstName && selectedChatData?.lastName
                  ? `${selectedChatData.firstName} ${selectedChatData.lastName}`
                  : selectedChatData?.email}
              </motion.h2>

              <div className="flex items-center gap-2">
                {selectedChatType === "group" ? (
                  <div className="flex items-center gap-2">
                    {/* Member Avatars Preview */}
                    <div className="flex items-center -space-x-1">
                      {selectedChatData?.members
                        ?.slice(0, 3)
                        .map((member, index) => (
                          <motion.div
                            key={member._id || index}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative"
                          >
                            <Avatar className="h-5 w-5 ring-1 ring-slate-600 hover:ring-cyan-400/60 transition-all duration-200">
                              {member.avatar ? (
                                <AvatarImage
                                  src={member.avatar}
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
                                  <UserCircle2 className="w-2.5 h-2.5 text-gray-300" />
                                </div>
                              )}
                            </Avatar>
                          </motion.div>
                        ))}
                      {selectedChatData?.members?.length > 3 && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 }}
                          className="h-5 w-5 bg-slate-700 rounded-full flex items-center justify-center text-xs text-slate-300 font-medium ring-1 ring-slate-600"
                        >
                          +{selectedChatData.members.length - 3}
                        </motion.div>
                      )}
                    </div>

                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-slate-300 font-medium"
                    >
                      {selectedChatData?.members?.length || 0} members
                    </motion.p>
                  </div>
                ) : (
                  <>
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [1, 0.8, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "loop",
                      }}
                      className={`w-2 h-2 rounded-full ${
                        selectedChatType === "dm" &&
                        selectedChatData &&
                        onlineUsers.includes(selectedChatData._id)
                          ? "bg-gradient-to-r from-emerald-400 to-green-500 shadow-lg shadow-emerald-400/60"
                          : "bg-gradient-to-r from-slate-500 to-slate-600"
                      }`}
                    />
                    <p className="text-xs text-slate-300 font-medium">
                      {selectedChatType === "dm" &&
                      selectedChatData &&
                      onlineUsers.includes(selectedChatData._id)
                        ? "Online"
                        : "Offline"}
                    </p>
                  </>
                )}
              </div>
            </div>
          </motion.button>

          {/* Modern Search Toggle Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSearchToggle}
            className={`relative p-2.5 rounded-xl transition-all duration-300 shadow-lg backdrop-blur-md border ${
              showSearch
                ? "bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-indigo-500/20 border-cyan-400/40 text-cyan-300 shadow-cyan-500/25"
                : "bg-slate-800/50 hover:bg-slate-700/60 border-slate-600/40 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40"
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300" />
            <motion.div
              animate={{ rotate: showSearch ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {showSearch ? (
                <X className="w-5 h-5 relative z-10" />
              ) : (
                <Search className="w-5 h-5 relative z-10" />
              )}
            </motion.div>
          </motion.button>
        </div>
      </div>

      {/* Modern Expandable Search Section */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="overflow-hidden border-t border-slate-700/30"
          >
            <div className="p-4 bg-gradient-to-r from-slate-900/60 to-slate-800/60 backdrop-blur-md">
              <div className="relative group">
                {/* Futuristic search container */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10 rounded-2xl blur-xl opacity-60" />
                <div className="relative bg-slate-800/60 backdrop-blur-md border border-slate-600/50 rounded-2xl overflow-hidden shadow-2xl">
                  <div className="relative">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2"
                    >
                      <Search className="text-cyan-400 w-4 h-4" />
                    </motion.div>
                    <input
                      type="text"
                      placeholder="Search through messages..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      autoFocus={showSearch}
                      className="w-full bg-transparent text-white pl-12 pr-12 py-3 focus:outline-none placeholder:text-slate-400 text-sm focus:ring-2 focus:ring-cyan-500/30 transition-all duration-300"
                    />
                    {searchQuery && (
                      <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleClearSearch}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-red-400 transition-colors duration-200 p-1 rounded-full hover:bg-red-500/10 border border-transparent hover:border-red-500/30"
                      >
                        <X className="w-3 h-3" />
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>

              {/* Enhanced Search Results Counter */}
              {searchQuery && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 text-center"
                >
                  <motion.span
                    animate={{
                      boxShadow: [
                        "0 0 20px rgba(6, 182, 212, 0.3)",
                        "0 0 30px rgba(59, 130, 246, 0.4)",
                        "0 0 20px rgba(6, 182, 212, 0.3)",
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold backdrop-blur-md border transition-all duration-300 ${
                      filteredCount > 0
                        ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-400/40"
                        : "bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-300 border-red-400/40"
                    }`}
                  >
                    {filteredCount > 0
                      ? `✨ ${filteredCount} message${
                          filteredCount !== 1 ? "s" : ""
                        } found`
                      : "❌ No messages found"}
                  </motion.span>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedChatType === "group" ? (
        <GroupProfileView
          group={selectedChatData}
          open={showProfile}
          onOpenChange={setShowProfile}
        />
      ) : (
        <ProfileView
          user={selectedChatData}
          open={showProfile}
          onOpenChange={setShowProfile}
        />
      )}
    </motion.div>
  );
};

export default ChatHeader;