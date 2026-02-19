import { useState, useEffect, useMemo } from "react";
import NewDm from "./components/new-dm";
import ProfileInfo from "./components/profile-info";
import apiClient from "@/lib/apiClient";
import { useStore } from "@/store/store";

import AdminLink from "./components/admin-link";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Users,
  Menu,
  X,

  Vault,
  Sparkles,
  Trash2,
  Search,
  Hash,
  Radio,
} from "lucide-react";

import EnhancedCreateGroupModal from "./components/new-group/EnhancedCreateGroupModal";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { UserCircle2 } from "lucide-react";

const ContactsContainer = () => {
  const {
    dmContacts,
    setDmContacts,
    selectedChatType,
    setSelectedChatType,
    selectedChatData,
    setSelectedChatData,
    setSelectedChatMessages,
    groups,
    setGroups,
    removeGroup,
    userInfo,
    onlineUsers,
    unreadMessages,
  } = useStore((state) => ({
    dmContacts: state.dmContacts,
    setDmContacts: state.setDmContacts,
    selectedChatType: state.selectedChatType,
    setSelectedChatType: state.setSelectedChatType,
    selectedChatData: state.selectedChatData,
    setSelectedChatData: state.setSelectedChatData,
    setSelectedChatMessages: state.setSelectedChatMessages,
    groups: state.groups,
    setGroups: state.setGroups,
    removeGroup: state.removeGroup,
    userInfo: state.userInfo,
    onlineUsers: state.onlineUsers || [],
    unreadMessages: state.unreadMessages || {},
  }));

  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingGroupId, setDeletingGroupId] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  useEffect(() => {
    const getDMContacts = async () => {
      try {
        const response = await apiClient.get("/api/contact/get-dm-list", {
          withCredentials: true,
        });
        if (response.data.contacts) {
          setDmContacts(response.data.contacts);
        }
      } catch (error) {
        console.error("Error in getDMContacts:", error);
      }
    };

    const getGroups = async () => {
      try {
        const response = await apiClient.get("/api/groups/list", {
          withCredentials: true,
        });
        if (response.data.success) {
          setGroups(response.data.groups);
        }
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };

    getDMContacts();
    getGroups();
  }, [setDmContacts, setGroups]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleDeleteGroup = async (groupId) => {
    console.log("Attempting to delete group with ID:", groupId);

    if (
      !window.confirm(
        "Are you sure you want to delete this group? This action cannot be undone."
      )
    ) {
      console.log("Delete cancelled by user");
      return;
    }

    setDeletingGroupId(groupId);

    try {
      console.log("Making DELETE request to:", `/api/groups/${groupId}`);

      const response = await apiClient.delete(`/api/groups/${groupId}`, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Delete response:", response);
      toast.success("Group deleted successfully");

      removeGroup(groupId);

      if (selectedChatData && selectedChatData._id === groupId) {
        setSelectedChatData(null);
        setSelectedChatType(null);
        setSelectedChatMessages([]);
      }
    } catch (error) {
      console.error("Error deleting group:", error);
      console.error("Error response:", error.response);

      if (error.response?.status === 403) {
        toast.error("You don't have permission to delete this group");
      } else if (error.response?.status === 404) {
        toast.error("Group not found or already deleted");
        removeGroup(groupId);
      } else if (error.response?.status === 500) {
        toast.error("Server error occurred while deleting group");
      } else {
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Failed to delete group"
        );
      }
    } finally {
      setDeletingGroupId(null);
    }
  };

  const allContacts = useMemo(() => {
    const validDmContacts = Array.isArray(dmContacts) ? dmContacts : [];
    const validGroups = Array.isArray(groups) ? groups : [];

    const dmList = validDmContacts.map((contact) => ({
      ...contact,
      type: "dm",
      displayName:
        `${contact.firstName || ""} ${contact.lastName || ""}`.trim() ||
        contact.email,
      isOnline: onlineUsers.includes(contact._id),
      unreadCount: unreadMessages[contact._id] || 0,
    }));

    const groupList = validGroups.map((group) => ({
      ...group,
      type: "group",
      displayName: group.name,
      isOnline: false,
      unreadCount: unreadMessages[group._id] || 0,
    }));

    const combined = [...dmList, ...groupList];
    return combined
      .filter(
        (contact) =>
          searchQuery === "" ||
          contact.displayName.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }, [dmContacts, groups, onlineUsers, unreadMessages, searchQuery]);

  const handleContactClick = (contact) => {
    setSelectedChatData(contact);
    setSelectedChatType(contact.type);
    if (selectedChatData && selectedChatData._id !== contact._id) {
      setSelectedChatMessages([]);
    }
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Menu Toggle - Always visible on mobile */}
      {isMobile && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="fixed top-4 left-4 z-[70] p-3 bg-slate-900/95 backdrop-blur-2xl rounded-2xl border border-cyan-500/30 shadow-2xl hover:bg-slate-800/95 transition-all duration-150 hover:border-cyan-400/40 hover:shadow-cyan-500/20"
          onClick={toggleMobileMenu}
        >
          <AnimatePresence mode="wait">
            {isMobileMenuOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.1 }}
              >
                <X className="h-5 w-5 text-cyan-400" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.1 }}
              >
                <Menu className="h-5 w-5 text-cyan-400" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      )}

      {/* Sidebar - Responsive Design */}
      <motion.div
        initial={false}
        animate={
          isMobile
            ? {
                x: isMobileMenuOpen ? 0 : -400,
                opacity: isMobileMenuOpen ? 1 : 0,
              }
            : {
                x: 0,
                opacity: 1,
              }
        }
        transition={{
          type: "tween",
          stiffness: 300,
          damping: 30,
          duration: 0.3,
        }}
        className={`
          bg-gradient-to-br 
          h-screen border-r border-slate-700/40 backdrop-blur-2xl shadow-2xl 
          flex flex-col
          ${
            isMobile
              ? `fixed inset-y-0 left-0 z-[60] w-full max-w-sm ${
                  isMobileMenuOpen
                    ? "pointer-events-auto"
                    : "pointer-events-none"
                }`
              : "relative w-80 lg:w-[360px] z-10"
          }
        `}
      >
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.02] via-blue-500/[0.03] to-indigo-600/[0.02]" />

          <div className="absolute inset-0 opacity-[0.015]">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                linear-gradient(cyan 1px, transparent 1px),
                linear-gradient(90deg, cyan 1px, transparent 1px)
              `,
                backgroundSize: "60px 60px",
              }}
            />
          </div>

          <motion.div
            animate={{
              y: [0, -50, 20, -30, 0],
              x: [0, 30, -20, 40, 0],
              opacity: [0.1, 0.4, 0.2, 0.35, 0.1],
              scale: [1, 1.3, 0.8, 1.2, 1],
              rotate: 0,
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 right-8 w-40 h-40 bg-gradient-to-r from-cyan-500/15 to-blue-500/15 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              y: [0, 35, -25, 45, 0],
              x: [0, -40, 25, -30, 0],
              opacity: [0.05, 0.25, 0.1, 0.3, 0.05],
              scale: [1, 1.4, 0.7, 1.3, 1],
              rotate: 0,
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute bottom-1/3 left-6 w-32 h-32 bg-gradient-to-r from-indigo-500/12 to-purple-500/12 rounded-full blur-2xl"
          />
        </div>

        <div className="flex-1 overflow-hidden relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 200 }}
            className="flex items-center justify-center p-4 sm:p-6 border-b border-slate-700/40 bg-gradient-to-r from-slate-900/60 via-slate-800/60 to-slate-900/60 backdrop-blur-xl"
          >
            <motion.div
              className="flex items-center gap-3 sm:gap-4"
              whileHover={{ scale: 1.05, rotate: 1 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className="relative">
                <motion.div
                  animate={{
                    boxShadow: [
                      "0 0 20px rgba(6, 182, 212, 0.3)",
                      "0 0 40px rgba(6, 182, 212, 0.7)",
                      "0 0 60px rgba(6, 182, 212, 0.5)",
                      "0 0 30px rgba(6, 182, 212, 0.4)",
                      "0 0 20px rgba(6, 182, 212, 0.3)",
                    ],
                    scale: [1, 1.05, 1.1, 1.02, 1],
                    rotate: 0,
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="w-10 sm:w-12 h-10 sm:h-12 rounded-2xl bg-gradient-to-br from-cyan-500/30 via-blue-500/30 to-indigo-600/30 flex items-center justify-center border border-cyan-500/40 backdrop-blur-sm"
                >
                  <motion.div
                    animate={{ rotate: 0 }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <MessageSquare className="w-5 sm:w-6 h-5 sm:h-6 text-cyan-300" />
                  </motion.div>
                </motion.div>
                <motion.div
                  animate={{
                    scale: [1, 1.4, 0.8, 1.2, 1],
                    opacity: [0.5, 1, 0.3, 0.9, 0.5],
                    rotate: 0,
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute -top-1 -right-1 w-3 sm:w-4 h-3 sm:h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                />
              </div>
              <div>
                <motion.h1
                  className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300 text-transparent bg-clip-text"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  style={{ backgroundSize: "200% 200%" }}
                >
                  Communiatec
                </motion.h1>
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex items-center gap-1 mt-0.5"
                >
                  <motion.div>
                    <Radio className="w-2.5 sm:w-3 h-2.5 sm:h-3 text-green-400" />
                  </motion.div>
                  <span className="text-xs text-green-400 font-medium">
                    Live
                  </span>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: -25, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.6,
              delay: 0.2,
              type: "spring",
              stiffness: 300,
            }}
            className="flex items-center justify-center gap-5 p-2 bg-gradient-to-r from-slate-900/60 via-slate-700/40 to-slate-900/60 backdrop-blur-sm border-b border-slate-700/30"
          >


            {/* ZoRo Vault Button */}
            <motion.button
              className="relative p-3 rounded-xl bg-gradient-to-r from-yellow-500/25 to-amber-500/25 hover:from-yellow-500/45 hover:to-amber-500/45 border border-yellow-500/40 hover:border-yellow-400/70 transition-all duration-300 group overflow-hidden shadow-xl hover:shadow-yellow-500/30"
              onClick={() => (window.location.href = "/zoro-vault")}
              title="Open ZoRo Vault"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-400/20 to-yellow-400/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />

              <Vault
                size={18}
                className="text-yellow-300 group-hover:text-yellow-200 relative z-10 transition-colors duration-300 w-3.5 h-3.5"
              />
            </motion.button>

            {/* Create Group Button */}
            <motion.button
              whileTap={{ scale: 0.85, rotate: 5 }}
              onClick={() => setShowCreateGroup(true)}
              className="relative p-3 rounded-xl bg-gradient-to-r from-indigo-500/25 to-purple-600/25 hover:from-indigo-500/45 hover:to-purple-600/45 border border-indigo-500/40 hover:border-indigo-400/70 transition-all duration-300 group overflow-hidden shadow-xl hover:shadow-indigo-500/30"
              title="Create Group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/0 via-indigo-400/20 to-indigo-400/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Users
                  size={16}
                  className="text-cyan-400 relative z-10 w-3.5 h-3.5"
                />
              </motion.div>
            </motion.button>

            {/* New DM */}
            <motion.div
              className="flex"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 400 }}
              whileHover={{ scale: 1.05, y: -2 }}
            >
              <NewDm />
            </motion.div>

            {/* Admin Link */}
            <motion.div
              className="flex"
              initial={{ scale: 0, rotate: 90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.6, type: "spring", stiffness: 400 }}
              whileHover={{ scale: 1.05, y: -2 }}
            >
              <AdminLink />
            </motion.div>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            className="p-4"
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              delay: 0.3,
              duration: 0.5,
              type: "spring",
              stiffness: 300,
            }}
          >
            <div className="relative group">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-cyan-500/15 to-blue-500/15 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-500"
                animate={{
                  scale: [1, 1.05, 1],
                  rotate: 0,
                }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <motion.div
                whileFocus={{ scale: 1.03, y: -2 }}
                transition={{ duration: 0.3, type: "spring" }}
                className="relative"
              >
                <motion.div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Search className="w-5 h-5  text-slate-400 group-focus-within:text-cyan-400 transition-colors duration-300" />
                </motion.div>
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-800/60 border border-slate-600/40 text-slate-200 placeholder-slate-400 focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 rounded-2xl backdrop-blur-sm transition-all duration-300 focus:bg-slate-800/80"
                />
                <motion.div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Sparkles className="w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors " />
                </motion.div>
              </motion.div>
            </div>
          </motion.div>

          {/* Contacts List */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto overflow-x-hidden px-4 pb-4 custom-scrollbar">
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {allContacts.map((contact, index) => {
                    const isSelected = selectedChatData?._id === contact._id;
                    const isGroup = contact.type === "group";
                    const canDelete =
                      isGroup &&
                      userInfo &&
                      (contact.creator === userInfo._id ||
                        contact.admins?.includes(userInfo._id));
                    const isDeleting = deletingGroupId === contact._id;

                    return (
                      <motion.div
                        key={contact._id}
                        layout
                        initial={{
                          opacity: 0,
                          x: -80,
                          scale: 0.7,
                          rotate: -10,
                        }}
                        animate={{ opacity: 1, x: 0, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, x: -80, scale: 0.7, rotate: 10 }}
                        transition={{
                          delay: index * 0.05,
                          type: "spring",
                          damping: 20,
                          stiffness: 300,
                          duration: 0.6,
                        }}
                        className="group relative"
                      >
                        <motion.div
                          whileHover={{
                            scale: 1.01,
                            y: -1,
                            rotateY: 1,
                            transition: {
                              type: "spring",
                              damping: 20,
                              stiffness: 400,
                              duration: 0.3,
                            },
                          }}
                          whileTap={{
                            scale: 0.97,
                            x: 4,
                            transition: { duration: 0.15 },
                          }}
                          className={`relative flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-400 backdrop-blur-sm overflow-hidden transform-gpu ${
                            isSelected
                              ? "bg-gradient-to-r from-cyan-500/25 via-blue-500/25 to-indigo-500/25 border-2 border-cyan-500/50 shadow-2xl shadow-cyan-500/20"
                              : "bg-slate-800/40 hover:bg-slate-700/70 border border-slate-600/30 hover:border-slate-500/60 hover:shadow-xl hover:shadow-cyan-500/5"
                          }`}
                          onClick={() =>
                            !isDeleting && handleContactClick(contact)
                          }
                          style={{
                            pointerEvents: isDeleting ? "none" : "auto",
                          }}
                        >
                          {/* Enhanced background effects */}
                          <motion.div
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                            animate={{
                              background: [
                                "linear-gradient(45deg, transparent, rgba(6, 182, 212, 0.05), transparent)",
                                "linear-gradient(135deg, transparent, rgba(59, 130, 246, 0.05), transparent)",
                                "linear-gradient(225deg, transparent, rgba(6, 182, 212, 0.05), transparent)",
                              ],
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                          />

                          {/* Animated selection indicator */}
                          <AnimatePresence>
                            {isSelected && (
                              <motion.div
                                initial={{ scaleY: 0, x: -10, opacity: 0 }}
                                animate={{ scaleY: 1, x: 0, opacity: 1 }}
                                exit={{ scaleY: 0, x: -10, opacity: 0 }}
                                transition={{
                                  duration: 0.4,
                                  type: "spring",
                                  stiffness: 400,
                                }}
                                className="absolute left-0 top-1.8 -translate-y-1/2 w-2 h-16 bg-gradient-to-b from-cyan-400 via-blue-500 to-indigo-600 rounded-r-full shadow-xl shadow-cyan-400/50"
                              >
                                <motion.div
                                  animate={{
                                    boxShadow: [
                                      "0 0 10px rgba(6, 182, 212, 0.5)",
                                      "0 0 20px rgba(6, 182, 212, 0.8)",
                                      "0 0 10px rgba(6, 182, 212, 0.5)",
                                    ],
                                  }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                  className="w-full h-full rounded-r-full"
                                />
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Ultra-enhanced Avatar */}
                          <div className="relative overflow-hidden rounded-2xl">
                            <motion.div
                              whileHover={{
                                scale: 1.05,
                                rotate: 2,
                                y: -1,
                                transition: {
                                  duration: 0.3,
                                  type: "spring",
                                  stiffness: 400,
                                },
                              }}
                              className="relative"
                            >
                              {/* Multi-layer glow effect for online users */}
                              {contact.isOnline && (
                                <>
                                  <motion.div
                                    animate={{
                                      scale: [1, 1.4, 1],
                                      opacity: [0.3, 0.8, 0.3],
                                      rotate: 0,
                                    }}
                                    transition={{
                                      duration: 3,
                                      repeat: Infinity,
                                    }}
                                    className="absolute inset-0 bg-gradient-to-r from-green-400/40 to-emerald-500/40 rounded-2xl blur-xl"
                                  />
                                  <motion.div
                                    animate={{
                                      scale: [1, 1.2, 1],
                                      opacity: [0.5, 1, 0.5],
                                    }}
                                    transition={{
                                      duration: 2,
                                      repeat: Infinity,
                                      delay: 0.5,
                                    }}
                                    className="absolute inset-0 bg-gradient-to-r from-green-300/30 to-emerald-400/30 rounded-2xl blur-lg"
                                  />
                                </>
                              )}

                              <Avatar
                                className={`relative h-16 w-16 transition-all duration-400 transform-gpu ${
                                  isSelected
                                    ? "ring-4 ring-slate-500/30 shadow-2xl shadow-cyan-400/30"
                                    : "ring-2 ring-slate-500/30 group-hover:ring-slate-400/60 group-hover:shadow-lg"
                                }`}
                              >
                                {contact.image ? (
                                  <AvatarImage
                                    src={contact.image}
                                    alt={contact.displayName}
                                    className="object-cover w-full h-full"
                                  />
                                ) : isGroup ? (
                                  <motion.div
                                    className="w-full h-full bg-gradient-to-br from-indigo-500/40 to-purple-500/40 flex items-center justify-center rounded-2xl"
                                    animate={{
                                      background: [
                                        "linear-gradient(to bottom right, rgba(99, 102, 241, 0.4), rgba(168, 85, 247, 0.4))",
                                        "linear-gradient(to bottom right, rgba(168, 85, 247, 0.4), rgba(99, 102, 241, 0.4))",
                                      ],
                                    }}
                                    transition={{
                                      duration: 4,
                                      repeat: Infinity,
                                    }}
                                  >
                                    <motion.div
                                      animate={{ rotate: 0 }}
                                      transition={{
                                        duration: 8,
                                        repeat: Infinity,
                                        ease: "linear",
                                      }}
                                    >
                                      <Users className="w-7 h-7 text-indigo-300" />
                                    </motion.div>
                                  </motion.div>
                                ) : (
                                  <motion.div
                                    className="w-full h-full bg-gradient-to-br from-cyan-400/40 to-blue-500/40 flex items-center justify-center rounded-2xl"
                                    animate={{
                                      background: [
                                        "linear-gradient(to bottom right, rgba(6, 182, 212, 0.4), rgba(59, 130, 246, 0.4))",
                                        "linear-gradient(to bottom right, rgba(59, 130, 246, 0.4), rgba(6, 182, 212, 0.4))",
                                      ],
                                    }}
                                    transition={{
                                      duration: 3,
                                      repeat: Infinity,
                                    }}
                                  >
                                    <UserCircle2 className="text-slate-300 w-8 h-8" />
                                  </motion.div>
                                )}
                              </Avatar>

                              {/* Enhanced online status with multiple effects */}
                              {!isGroup && contact.isOnline && (
                                <motion.div
                                  initial={{ scale: 0, rotate: -180 }}
                                  animate={{ scale: 1, rotate: 0 }}
                                  transition={{ duration: 0.5, type: "spring" }}
                                  className="absolute -bottom-1 -right-1"
                                ></motion.div>
                              )}

                              {/* Ultra-enhanced unread count */}
                              {contact.unreadCount > 0 && (
                                <motion.div
                                  initial={{ scale: 0, rotate: -360, y: -20 }}
                                  animate={{ scale: 1, rotate: 0, y: 0 }}
                                  transition={{
                                    duration: 0.6,
                                    type: "spring",
                                    stiffness: 400,
                                  }}
                                  className="absolute -top-3 -right-3 "
                                >
                                  <motion.div
                                    animate={{
                                      scale: [1, 1.1, 1],
                                      rotate: 0,
                                      boxShadow: [
                                        "0 0 10px rgba(6, 182, 212, 0.5)",
                                        "0 0 20px rgba(59, 130, 246, 0.8)",
                                        "0 0 10px rgba(6, 182, 212, 0.5)",
                                      ],
                                    }}
                                    transition={{
                                      duration: 2,
                                      repeat: Infinity,
                                    }}
                                    className="min-w-[28px] h-7 bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-500 rounded-full flex items-center justify-center text-xs font-bold text-white ring-3 ring-slate-900 shadow-xl"
                                    style={{ backgroundSize: "200% 200%" }}
                                  >
                                    <motion.span
                                      animate={{
                                        backgroundPosition: [
                                          "0% 50%",
                                          "100% 50%",
                                          "0% 50%",
                                        ],
                                      }}
                                      transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                      }}
                                    >
                                      {contact.unreadCount > 99
                                        ? "99+"
                                        : contact.unreadCount}
                                    </motion.span>
                                  </motion.div>
                                </motion.div>
                              )}
                            </motion.div>
                          </div>
                          {/* Enhanced Contact Info */}
                          <div className="flex-1 min-w-0 relative z-10">
                            <div className="flex items-center justify-between mb-2">
                              <motion.h4
                                className={`font-semibold truncate transition-all duration-300 flex items-center gap-2 text-base ${
                                  isSelected
                                    ? "text-white"
                                    : "text-slate-100 group-hover:text-white"
                                }`}
                                animate={
                                  isSelected
                                    ? {
                                        x: [0, 3, -1, 2, 0],
                                        textShadow: [
                                          "0 0 0px rgba(6, 182, 212, 0)",
                                          "0 0 10px rgba(6, 182, 212, 0.5)",
                                          "0 0 0px rgba(6, 182, 212, 0)",
                                        ],
                                      }
                                    : {}
                                }
                                transition={{ duration: 2, repeat: Infinity }}
                              >
                                {isGroup && (
                                  <motion.div
                                    animate={{
                                      rotate: 0,
                                      scale: [1, 1.2, 1],
                                      color: [
                                        "#6366f1",
                                        "#8b5cf6",
                                        "#06b6d4",
                                        "#6366f1",
                                      ],
                                    }}
                                    transition={{
                                      duration: 4,
                                      repeat: Infinity,
                                      ease: "easeInOut",
                                    }}
                                  >
                                    <Hash className="w-4 h-4" />
                                  </motion.div>
                                )}
                                <motion.span
                                  animate={
                                    isSelected
                                      ? {
                                          backgroundPosition: [
                                            "0% 50%",
                                            "100% 50%",
                                            "0% 50%",
                                          ],
                                        }
                                      : {}
                                  }
                                  transition={{ duration: 3, repeat: Infinity }}
                                  className={
                                    isSelected
                                      ? "bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent"
                                      : ""
                                  }
                                  style={{ backgroundSize: "200% 200%" }}
                                >
                                  {contact.displayName}
                                </motion.span>
                              </motion.h4>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <motion.div
                                  animate={
                                    contact.isOnline
                                      ? {
                                          scale: [1, 1.3, 1],
                                          boxShadow: [
                                            "0 0 0 rgba(34, 197, 94, 0.5)",
                                            "0 0 15px rgba(34, 197, 94, 1)",
                                            "0 0 0 rgba(34, 197, 94, 0.5)",
                                          ],
                                          rotate: 0,
                                        }
                                      : {
                                          scale: [1, 1.1, 1],
                                          opacity: [0.5, 0.8, 0.5],
                                        }
                                  }
                                  transition={{
                                    duration: contact.isOnline ? 2 : 3,
                                    repeat: Infinity,
                                  }}
                                  className={`w-3 h-3 rounded-full ${
                                    contact.isOnline
                                      ? "bg-gradient-to-r from-green-400 to-emerald-500"
                                      : isGroup
                                      ? "bg-gradient-to-r from-indigo-400 to-purple-500"
                                      : "bg-slate-500"
                                  }`}
                                />
                                <motion.p
                                  className={`text-sm font-medium transition-colors duration-300 ${
                                    isSelected
                                      ? "text-slate-200"
                                      : "text-slate-400 group-hover:text-slate-300"
                                  }`}
                                  animate={
                                    contact.isOnline
                                      ? {
                                          color: [
                                            "rgb(34, 197, 94)",
                                            "rgb(16, 185, 129)",
                                            "rgb(34, 197, 94)",
                                          ],
                                        }
                                      : {}
                                  }
                                  transition={{ duration: 2, repeat: Infinity }}
                                >
                                  {isGroup
                                    ? `${contact.members?.length || 0} members`
                                    : contact.isOnline
                                    ? "Online"
                                    : "Offline"}
                                </motion.p>
                              </div>
                            </div>
                          </div>

                          {/* Ultra-enhanced delete button */}
                          {canDelete && (
                            <motion.button
                              initial={{ opacity: 0, x: 20, scale: 0 }}
                              animate={{ opacity: 1, x: 0, scale: 1 }}
                              transition={{ duration: 0.4, type: "spring" }}
                              whileHover={{
                                scale: 1.2,
                                rotate: 15,
                                y: -2,
                                boxShadow: "0 5px 15px rgba(239, 68, 68, 0.4)",
                                transition: { duration: 0.2 },
                              }}
                              whileTap={{
                                scale: 0.8,
                                rotate: -5,
                                transition: { duration: 0.1 },
                              }}
                              className={`relative z-20 p-2.5 rounded-xl transition-all duration-300 border shadow-lg transform-gpu ${
                                isDeleting
                                  ? "bg-red-500/50 border-red-400/70 text-red-200 cursor-not-allowed"
                                  : "bg-gradient-to-r from-red-500/25 to-pink-500/25 hover:from-red-500/50 hover:to-pink-500/50 text-red-400 hover:text-red-200 opacity-0 group-hover:opacity-100 border-red-500/40 hover:border-red-400/70"
                              }`}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (!isDeleting) {
                                  handleDeleteGroup(contact._id);
                                }
                              }}
                              disabled={isDeleting}
                              title={
                                isDeleting ? "Deleting..." : "Delete Group"
                              }
                            >
                              {/* Background pulse effect */}
                              <motion.div
                                animate={{
                                  scale: [1, 1.5, 1],
                                  opacity: [0, 0.3, 0],
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute inset-0 bg-red-500/20 rounded-xl"
                              />

                              {isDeleting ? (
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    ease: "linear",
                                  }}
                                  className="relative z-10"
                                >
                                  <motion.div
                                    className="w-4 h-4 border-2 border-red-300 border-t-transparent rounded-full"
                                    animate={{
                                      borderColor: [
                                        "#fca5a5",
                                        "#f87171",
                                        "#ef4444",
                                        "#fca5a5",
                                      ],
                                    }}
                                    transition={{
                                      duration: 1,
                                      repeat: Infinity,
                                    }}
                                  />
                                </motion.div>
                              ) : (
                                <motion.div
                                  animate={{
                                    rotate: 0,
                                    scale: [1, 1.1, 1],
                                  }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                  className="relative z-10"
                                >
                                  <Trash2 size={16} />
                                </motion.div>
                              )}

                              {/* Danger indicator */}
                              <motion.div
                                animate={{
                                  scale: [0, 1, 0],
                                  rotate: 0,
                                }}
                                transition={{
                                  duration: 3,
                                  repeat: Infinity,
                                  delay: 1,
                                }}
                                className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full opacity-60"
                              />
                            </motion.button>
                          )}
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {/* No conversations state */}
                {allContacts.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{
                      duration: 0.6,
                      type: "spring",
                      stiffness: 200,
                    }}
                    className="flex flex-col items-center justify-center py-16 text-center"
                  >
                    <motion.div
                      animate={{
                        rotate: 0,
                        scale: [1, 1.1, 0.9, 1.05, 1],
                        y: [0, -5, 5, -2, 0],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="w-24 h-24 rounded-3xl bg-gradient-to-br from-slate-700/50 via-slate-600/50 to-slate-700/50 flex items-center justify-center mb-6 border border-slate-600/40 relative overflow-hidden"
                    >
                      {/* Animated background pattern */}
                      <motion.div
                        animate={{
                          backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
                        }}
                        transition={{ duration: 8, repeat: Infinity }}
                        className="absolute inset-0 opacity-20"
                        style={{
                          backgroundImage: `
                            linear-gradient(45deg, #06B6D4 25%, transparent 25%),
                            linear-gradient(-45deg, #3B82F6 25%, transparent 25%),
                            linear-gradient(45deg, transparent 75%, #06B6D4 75%),
                            linear-gradient(-45deg, transparent 75%, #3B82F6 75%)
                          `,
                          backgroundSize: "8px 8px",
                        }}
                      />
                      <motion.div
                        animate={{
                          rotate: 0,
                          scale: [1, 1.2, 1],
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        <MessageSquare className="w-12 h-12 text-slate-400 relative z-10" />
                      </motion.div>
                      {/* Floating particles */}
                      <motion.div
                        animate={{
                          y: [0, -20, 0],
                          x: [0, 10, 0],
                          opacity: [0, 1, 0],
                          scale: [0, 1.5, 0],
                        }}
                        transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                        className="absolute top-2 right-2 w-1 h-1 bg-cyan-400 rounded-full"
                      />
                      <motion.div
                        animate={{
                          y: [0, -15, 0],
                          x: [0, -8, 0],
                          opacity: [0, 1, 0],
                          scale: [0, 1.2, 0],
                        }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          delay: 2,
                        }}
                        className="absolute bottom-3 left-3 w-0.5 h-0.5 bg-blue-400 rounded-full"
                      />
                    </motion.div>
                    <motion.p
                      className="text-slate-300 text-base font-medium mb-2"
                      animate={{
                        opacity: [0.7, 1, 0.7],
                        y: [0, -2, 0],
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      No conversations yet
                    </motion.p>
                    <motion.p
                      className="text-slate-500 text-sm"
                      animate={{
                        opacity: [0.5, 0.8, 0.5],
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                    >
                      Start a new chat to get connected!
                    </motion.p>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Profile Info */}
        <ProfileInfo />
      </motion.div>

      {/* Mobile Overlay - Better z-index management */}
      <AnimatePresence>
        {isMobile && isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40"
            onClick={toggleMobileMenu}
          />
        )}
      </AnimatePresence>

      {/* Create Group Modal */}
      <EnhancedCreateGroupModal
        open={showCreateGroup}
        onOpenChange={setShowCreateGroup}
      />

      {/* Enhanced Custom Scrollbar Styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #06b6d4 rgba(30, 41, 59, 0.3);
          }
          
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(30, 41, 59, 0.2);
            border-radius: 12px;
            margin: 4px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #06b6d4 0%, #3b82f6 50%, #6366f1 100%);
            border-radius: 12px;
            border: 2px solid rgba(30, 41, 59, 0.1);
            box-shadow: 0 0 10px rgba(6, 182, 212, 0.3);
            transition: all 0.15s ease;
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(180deg, #0891b2 0%, #2563eb 50%, #4f46e5 100%);
            box-shadow: 0 0 15px rgba(6, 182, 212, 0.5);
            transform: scale(1.1);
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb:active {
            background: linear-gradient(180deg, #0e7490 0%, #1d4ed8 50%, #3730a3 100%);
          }
          
          .custom-scrollbar::-webkit-scrollbar-corner {
            background: transparent;
          }
          
          /* Enhanced scrolling behavior */
          .custom-scrollbar {
            scroll-behavior: smooth;
            overscroll-behavior: contain;
          }
          
          /* Scroll animations */
          @keyframes scrollGlow {
            0% { box-shadow: 0 0 5px rgba(6, 182, 212, 0.3); }
            50% { box-shadow: 0 0 20px rgba(6, 182, 212, 0.6); }
            100% { box-shadow: 0 0 5px rgba(6, 182, 212, 0.3); }
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            animation: scrollGlow 1s ease-in-out infinite;
          }

          /* Ultra-enhanced transition animations */
          * {
            transition-duration: 0.3s !important;
          }
          
          .group:hover .group-hover\\:opacity-100 {
            transition-duration: 0.2s !important;
          }
          
          /* Prevent text selection on interactive elements */
          button, .cursor-pointer {
            user-select: none;
            -webkit-user-select: none;
          }
          
          /* Removed z-index override for fixed/relative to ensure proper stacking */

          /* Additional ultra-smooth animations */
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            33% { transform: translateY(-10px) rotate(2deg); }
            66% { transform: translateY(-5px) rotate(-1deg); }
          }
          
          @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 5px rgba(6, 182, 212, 0.3); }
            50% { box-shadow: 0 0 30px rgba(6, 182, 212, 0.8), 0 0 50px rgba(59, 130, 246, 0.4); }
          }
          
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
          
          .animate-pulse-glow {
            animation: pulse-glow 2s ease-in-out infinite;
          }
          
          .animate-shimmer::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
            animation: shimmer 2s infinite;
          }

          /* Enhanced hover effects */
          .group:hover .animate-on-hover {
            animation: float 3s ease-in-out infinite;
          }
          
          /* Smooth scaling for all interactive elements */
          button, .cursor-pointer {
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
          }
          
          /* Enhanced focus states */
          *:focus {
            outline: none;
            box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.3) !important;
          }
        `,
        }}
      />
    </>
  );
};

export default ContactsContainer;
