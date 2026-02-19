import React from "react";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useStore } from "@/store/store";
import { useNavigate } from "react-router-dom";


const AdminLink = () => {
  const { userInfo } = useStore();
  const navigate = useNavigate();
  // Only render for admin users
  if (!userInfo || userInfo.role !== "admin") {
    return null;
  }

  return (
    <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="inline-block">
              <motion.button
                onClick={() => navigate("/admin/dashboard")}
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative p-2 rounded-xl bg-gradient-to-r from-red-500/20 to-red-600/20 hover:from-red-500/30 hover:to-red-600/30 border border-red-500/20 hover:border-red-500/30 transition-all duration-300 backdrop-blur-sm shadow-lg shadow-red-500/10 hover:shadow-red-500/20"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-400/10 to-red-500/10 rounded-xl blur-lg opacity-0 hover:opacity-100 transition-opacity duration-300" />
                  <Shield size={16} className="text-red-400 relative z-10" />
                </motion.button>
            </div>
          </TooltipTrigger>
          <TooltipContent className="bg-slate-800/95 backdrop-blur-md border border-slate-700/50 text-white">
            <p>Admin Menu</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
  );
};

export default AdminLink;