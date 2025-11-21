import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/store/store";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { UserCircle2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import apiClient from "@/lib/apiClient";

const ContactList = () => {
  const {
    selectedChatData,
    setSelectedChatData,
    dmContacts,
    setDmContacts,
    groupContacts,
    setGroupContacts,
    setSelectedChatMessages,
    setSelectedChatType,
    unreadMessages,
    onlineUsers,
  } = useStore();

  useEffect(() => {
    const getContacts = async () => {
      try {
        const [dmResponse, groupResponse] = await Promise.all([
          apiClient.get("/api/contact/get-dm-list"),
          apiClient.get("/api/groups"),
        ]);
        setDmContacts(dmResponse.data.contacts || []);
        setGroupContacts(groupResponse.data || []);
      } catch (error) {
        console.error("Failed to fetch contacts", error);
        setDmContacts([]);
        setGroupContacts([]);
      }
    };
    getContacts();
  }, [setDmContacts, setGroupContacts]);

  const allContacts = useMemo(() => {
    const validDmContacts = Array.isArray(dmContacts) ? dmContacts : [];
    const validGroupContacts = Array.isArray(groupContacts)
      ? groupContacts
      : [];
    const combined = [...validDmContacts, ...validGroupContacts];
    return combined.sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
    );
  }, [dmContacts, groupContacts]);

  const handleClick = (contact) => {
    const isGroup = !!contact.members;
    setSelectedChatData(contact);
    setSelectedChatType(isGroup ? "group" : "dm");
    if (selectedChatData && selectedChatData._id !== contact._id) {
      setSelectedChatMessages([]);
    }
  };

  console.log("Unread Messages:", unreadMessages);

  return (
    <div className="space-y-2">
      {allContacts.map((contact, index) => {
        const isGroup = !!contact.members;
        const imageUrl = !isGroup ? contact.image : contact.photoURL;
        const isSelected = selectedChatData?._id === contact._id;
        const isOnline = !isGroup && onlineUsers.includes(contact._id);
        const unreadCount = unreadMessages[contact._id] || 0;
        const hasUnread = unreadCount > 0;

        return (
          <motion.div
            key={contact._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              "flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all relative group backdrop-blur-sm border",
              isSelected
                ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-500/30 shadow-lg shadow-cyan-500/10"
                : hasUnread
                ? "bg-gradient-to-r from-red-500/15 to-orange-500/10 border-red-500/40 hover:border-red-500/60"
                : "bg-slate-800/30 hover:bg-slate-700/40 border-slate-700/30 hover:border-slate-600/40"
            )}
            onClick={() => handleClick(contact)}
          >
            {/* Unread indicator on left side */}
            {hasUnread && !isSelected && (
              <motion.div
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 600, damping: 20 }}
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-gradient-to-b from-red-400 to-red-600 rounded-r-full shadow-lg shadow-red-500/70 animate-pulse"
              />
            )}

            {/* Selection indicator */}
            {isSelected && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-cyan-400 to-blue-400 rounded-r-full shadow-lg shadow-cyan-400/50" />
            )}

            <div className="relative flex-shrink-0">
              {/* Glow effect for unread */}
              {hasUnread && (
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/30 to-orange-500/20 rounded-full blur-lg scale-120 opacity-70 animate-pulse" />
              )}

              {/* Glow effect for online users */}
              {isOnline && !isGroup && (
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full blur-md scale-110 opacity-60" />
              )}

              <Avatar
                className={cn(
                  "h-14 w-14 ring-2 transition-transform group-hover:scale-105 relative shadow-lg",
                  hasUnread
                    ? "ring-red-500/70 scale-105"
                    : isSelected
                    ? "ring-cyan-500/50"
                    : "ring-dark-accent/30"
                )}
              >
                {imageUrl ? (
                  <AvatarImage src={imageUrl} alt="Contact" />
                ) : isGroup ? (
                  <Users className="text-dark-muted w-full h-full p-2" />
                ) : (
                  <UserCircle2 className="text-dark-muted w-full h-full p-1" />
                )}
              </Avatar>

              {/* Online status indicator */}
              {isOnline && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-dark-primary shadow-glow" />
              )}

              {/* Unread badge on avatar corner */}
              {hasUnread && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 700, damping: 25 }}
                  className="absolute -top-2 -right-2 min-w-[36px] h-8 px-2 bg-gradient-to-br from-red-500 via-red-600 to-red-700 text-white text-xs font-black rounded-full flex items-center justify-center shadow-xl shadow-red-500/90 ring-3 ring-red-300/50 animate-pulse border border-red-300/30"
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </motion.div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4
                  className={cn(
                    "font-semibold truncate transition-colors",
                    hasUnread
                      ? "text-white font-bold"
                      : "text-dark-text group-hover:text-blue-400"
                  )}
                >
                  {isGroup
                    ? contact.name
                    : `${contact.firstName} ${contact.lastName}`}
                </h4>

                {/* Pulsing dot for unread */}
                {hasUnread && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="flex-shrink-0 w-3 h-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-full shadow-lg shadow-red-500/70"
                  />
                )}
              </div>

              <p
                className={cn(
                  "text-sm truncate transition-colors",
                  hasUnread ? "text-red-300 font-medium" : "text-dark-muted"
                )}
              >
                {hasUnread && <span className="inline-block mr-1">🔴</span>}
                {isGroup
                  ? `${contact.members.length} members`
                  : isOnline
                  ? "Online"
                  : "Offline"}
              </p>
            </div>

            {/* Large badge at right end */}
            {hasUnread && (
              <motion.div
                initial={{ scale: 0, x: 20, opacity: 0 }}
                animate={{ scale: 1, x: 0, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 20,
                  delay: 0.1,
                }}
                whileHover={{ scale: 1.15 }}
                className="ml-2 flex-shrink-0 min-w-[44px] h-9 px-3 bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white text-sm font-black rounded-full flex items-center justify-center ring-3 ring-red-300/40 shadow-xl shadow-red-600/80 z-20 border border-red-200/40 relative"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full"
                  animate={{ x: [-100, 100] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <span className="relative">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default ContactList;
