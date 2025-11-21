import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { UserCircle2, Shield, ShieldOff, Mail, Calendar, User, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/store/store";
import apiClient from "@/lib/apiClient";
import { toast } from "sonner";
import { motion } from "framer-motion";

const ProfileView = ({ user, open, onOpenChange }) => {
  const { userInfo, setUserInfo } = useStore();
  // Prevent rendering if user data is not available
  if (!user) {
    return null;
  }
  const [isBlocked, setIsBlocked] = useState(() => {
    return userInfo?.blockedUsers?.includes(user?._id) || false;
  });

  const handleBlockUser = async () => {
    try {
      const response = await apiClient.post(`/api/contact/block-user/${user._id}`, {}, { withCredentials: true });
      if (response.status === 200) {
        const updatedBlockedUsers = isBlocked
          ? userInfo.blockedUsers.filter(id => id !== user._id)
          : [...(userInfo.blockedUsers || []), user._id];
        
        setUserInfo({
          ...userInfo,
          blockedUsers: updatedBlockedUsers
        });
        setIsBlocked(!isBlocked);
        toast.success(isBlocked ? 'User unblocked successfully' : 'User blocked successfully');
      }
    } catch (error) {
      console.error('Error blocking/unblocking user:', error);
      toast.error('Failed to block/unblock user');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900/95 backdrop-blur-3xl border border-slate-700/50 text-white max-w-md shadow-2xl rounded-3xl overflow-hidden p-0 relative fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 w-60 h-60 bg-gradient-to-r from-cyan-400/10 to-purple-500/10 rounded-full blur-3xl animate-spin" style={{ animationDuration: '20s' }}></div>
        </div>

        {/* Header with glassmorphism effect */}
        <div className="relative bg-gradient-to-br from-cyan-400/20 via-blue-500/20 to-indigo-600/20 backdrop-blur-xl border-b border-slate-700/30 px-6 pt-8 pb-20">
          {/* Floating particles */}
          <div className="absolute top-4 right-4 w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
          <div className="absolute top-8 left-6 w-1 h-1 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '500ms' }}></div>
          <div className="absolute top-12 right-12 w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '1000ms' }}></div>
          
          <DialogHeader className="relative z-10">
            <DialogTitle className="text-center text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Profile Overview
            </DialogTitle>
          </DialogHeader>

          {/* Profile Avatar with advanced styling */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute -bottom-14 left-1/2 transform -translate-x-1/2 z-20"
          >
            <div className="relative group">
              {/* Avatar container */}
              <div className="relative">
                <Avatar className="h-32 w-32 shadow-xl relative z-10">
                  {user?.image ? (
                    <AvatarImage
                      src={user.image}
                      alt="Profile"
                      className="object-cover"
                    />
                  ) : (
                    <div className="bg-gradient-to-br from-cyan-100/20 to-purple-100/20 flex items-center justify-center w-full h-full backdrop-blur-sm">
                      <UserCircle2 className="text-cyan-400 w-16 h-16" />
                    </div>
                  )}
                </Avatar>
                
                {/* Status indicator */}
                <div className="absolute -bottom-2 -right-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full border-4 border-slate-900 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Content Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative px-6 pt-16 pb-8 bg-slate-900/50"
        >
          {/* Name Section */}
          <div className="text-center mb-8">
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2"
            >
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : user?.email?.split('@')[0] || 'Unknown User'}
            </motion.h2>
          </div>

          {/* Enhanced Info Cards */}
          <div className="space-y-4 mb-8">
            {/* Email Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="group bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-xl rounded-2xl p-4 border border-slate-600/30 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-xl flex items-center justify-center border border-cyan-400/30 group-hover:scale-110 transition-transform duration-300">
                  <Mail className="w-6 h-6 text-cyan-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Email Address</p>
                  <p className="text-sm font-medium text-white truncate">{user?.email}</p>
                </div>
              </div>
            </motion.div>

            {/* Member Since Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="group bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-xl rounded-2xl p-4 border border-slate-600/30 hover:border-purple-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-purple-400/30 group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Member Since</p>
                  <p className="text-sm font-medium text-white">
                    {new Date(user?.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Action Button */}
          {userInfo._id !== user._id && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <Button
                variant="outline"
                className={`w-full h-14 rounded-2xl font-semibold transition-all duration-300 border-0 relative overflow-hidden group ${
                  isBlocked
                    ? "bg-gradient-to-r from-red-500/20 to-red-600/20 hover:from-red-500/30 hover:to-red-600/30 text-red-400 shadow-lg shadow-red-500/20"
                    : "bg-gradient-to-r from-slate-700/80 to-slate-600/80 hover:from-cyan-500/20 hover:to-blue-500/20 text-slate-300 hover:text-white shadow-lg shadow-slate-500/20"
                }`}
                onClick={handleBlockUser}
              >
                {/* Button background effect */}
                <div className={`absolute inset-0 bg-gradient-to-r transition-opacity duration-300 ${
                  isBlocked 
                    ? "from-red-500/10 to-red-600/10 opacity-0 group-hover:opacity-100"
                    : "from-cyan-400/10 to-blue-500/10 opacity-0 group-hover:opacity-100"
                }`}></div>
                
                <div className="flex items-center gap-4 relative z-10">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    isBlocked 
                      ? 'bg-red-500/20 border border-red-400/30' 
                      : 'bg-slate-600/50 border border-slate-500/30 group-hover:bg-cyan-500/20 group-hover:border-cyan-400/30'
                  }`}>
                    {isBlocked ? (
                      <ShieldOff className="w-5 h-5" />
                    ) : (
                      <Shield className="w-5 h-5" />
                    )}
                  </div>
                  <span className="text-base">
                    {isBlocked ? 'Unblock User' : 'Block User'}
                  </span>
                </div>
              </Button>
              
              {/* Status indicator */}
              {isBlocked && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/30 rounded-2xl p-4 text-center backdrop-blur-sm"
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                    <p className="text-sm text-red-400 font-semibold">User Blocked</p>
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                  </div>
                  <p className="text-xs text-red-300/80">This user is currently blocked and cannot contact you</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileView;