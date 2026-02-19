import React from "react";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LogOut, Settings, UserCircle2, Code } from "lucide-react";
import apiClient from "@/lib/apiClient";

import { useStore } from "@/store/store";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const ProfileInfo = () => {

  const { userInfo, setUserInfo } = useStore();

  const handleLogOut = async () => {
    try {
      const request = await apiClient.post(
        "/api/auth/logout",
        {},
        { withCredentials: true }
      );
      if (request.status === 200) {
        // Clear local state and storage
        setUserInfo(null);
        localStorage.removeItem("authToken");
        localStorage.removeItem("userInfo");
        
        // Force reload to clear any cached state
        window.location.href = "/auth";
      }
    } catch (err) {
      console.log(err);
      // Even if logout fails, clear local state
      setUserInfo(null);
      localStorage.removeItem("authToken");
      localStorage.removeItem("userInfo");
      window.location.href = "/auth";
    }
  };

  const imageUrl = userInfo?.image ? userInfo.image : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="border-t border-slate-700/30 bg-gradient-to-r from-slate-900/60 to-slate-800/50 backdrop-blur-sm p-4 relative"
    >
      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-blue-500/5 pointer-events-none" />

      <div className="flex items-center gap-4 relative z-10 top-1/2 -translate-y-1/2">
        <motion.div whileHover={{ scale: 1.05 }} className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-lg opacity-0 hover:opacity-100 transition-opacity duration-300 " />
          <Avatar className="relative h-12 w-13 ring-2 ring-cyan-500/30 hover:ring-cyan-500/50 transition-all duration-300 shadow-lg shadow-cyan-500/10">
            {imageUrl ? (
              <AvatarImage
                src={imageUrl}
                alt="Profile"
                className="object-cover"
              />
            ) : (
              <UserCircle2 className="text-slate-400 w-8 h-8" />
            )}
          </Avatar>
        </motion.div>

        <div className="flex-1 min-w-0">
          <motion.h4
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="font-semibold text-slate-200 truncate bg-gradient-to-r from-cyan-400 to-blue-400 text-transparent bg-clip-text hover:from-cyan-300 hover:to-blue-300 transition-all duration-300"
          >
            {userInfo?.firstName && userInfo?.lastName
              ? `${userInfo.firstName} ${userInfo.lastName}`
              : userInfo?.email}
          </motion.h4>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-slate-300 truncate flex items-center gap-2"
          >
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
            Online
          </motion.div>
        </div>

        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all duration-300 rounded-xl backdrop-blur-sm border border-transparent hover:border-cyan-500/20"
                  onClick={() => window.location.href = "/code-editor"}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300" />
                  <Code size={18} className="relative z-10" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-slate-800/95 backdrop-blur-md border border-slate-700/50 text-white">
                <p>Code Editor</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all duration-300 rounded-xl backdrop-blur-sm border border-transparent hover:border-blue-500/20"
                  onClick={() => window.location.href = "/profile"}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300" />
                  <Settings size={18} className="relative z-10" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-slate-800/95 backdrop-blur-md border border-slate-700/50 text-white">
                <p>Settings</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 rounded-xl backdrop-blur-sm border border-transparent hover:border-red-500/20"
                  onClick={handleLogOut}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-red-600/5 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300" />
                  <LogOut size={18} className="relative z-10" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-slate-800/95 backdrop-blur-md border border-slate-700/50 text-white">
                <p>Log Out</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileInfo;