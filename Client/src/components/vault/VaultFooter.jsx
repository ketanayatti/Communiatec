import React from "react";
import { motion } from "framer-motion";
import { Shield, Database, Zap } from "lucide-react";

const VaultFooter = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8, duration: 0.6 }}
      className="flex flex-wrap items-center justify-center gap-4 mt-10 text-xs sm:text-sm px-2"
    >
      {[
        {
          icon: <Shield className="w-3.5 h-3.5" />,
          text: "End-to-End Encrypted",
          color: "text-cyan-400",
          bg: "from-cyan-500/10 to-blue-500/10",
          border: "border-cyan-500/30",
        },
        {
          icon: <Database className="w-3.5 h-3.5" />,
          text: "Secure Cloud Storage",
          color: "text-blue-400",
          bg: "from-blue-500/10 to-indigo-500/10",
          border: "border-blue-500/30",
        },
        {
          icon: <Zap className="w-3.5 h-3.5" />,
          text: "Lightning Fast Access",
          color: "text-indigo-400",
          bg: "from-indigo-500/10 to-purple-500/10",
          border: "border-indigo-500/30",
        },
      ].map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 + index * 0.08, duration: 0.4 }}
          className={`flex items-center gap-2 px-4 py-3 bg-gradient-to-r ${stat.bg} backdrop-blur rounded-lg border ${stat.border}`}
        >
          <div className={stat.color}>{stat.icon}</div>
          <span className="text-slate-300">{stat.text}</span>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default VaultFooter;
