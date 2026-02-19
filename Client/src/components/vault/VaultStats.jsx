import React from "react";
import { motion } from "framer-motion";
import { Database, Shield, Inbox } from "lucide-react";

const VaultStats = ({ filesCount, sharedFilesCount, onOpenSharedPanel }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
      <div className="relative">
        <div className="absolute -top-3 left-0 w-24 h-px bg-gradient-to-r from-cyan-400 via-blue-500 to-transparent opacity-70" />

        <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 text-transparent bg-clip-text">
            ZoRo Vault
          </span>
        </h1>
        <p className="text-slate-400 mt-1.5">
          Advanced{" "}
          <span className="text-cyan-400 font-medium">secure storage</span> for
          your digital assets
        </p>

        <div className="absolute -bottom-2 left-0 w-32 h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent opacity-70" />
      </div>

      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="bg-slate-800/50 backdrop-blur-xl rounded-xl px-5 py-3 border border-slate-700/50 shadow-lg min-w-[140px]"
        >
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-cyan-400" />
            <div>
              <span className="text-xs text-slate-400 block">Total Files</span>
              <div className="font-bold text-lg bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                {filesCount}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="bg-slate-800/50 backdrop-blur-xl rounded-xl px-5 py-3 border border-slate-700/50 shadow-lg min-w-[140px]"
        >
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-indigo-400" />
            <div>
              <span className="text-xs text-slate-400 block">Storage</span>
              <div className="font-bold text-lg bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
                Secure
              </div>
            </div>
          </div>
        </motion.div>

        <motion.button
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.98 }}
          onClick={onOpenSharedPanel}
          className={`relative bg-slate-800/50 backdrop-blur-xl rounded-xl px-5 py-3 border shadow-lg transition-all duration-300 group ${
            sharedFilesCount > 0
              ? "border-purple-500/60 hover:border-purple-400 shadow-purple-500/20"
              : "border-slate-700/50 hover:border-purple-500/50"
          }`}
          aria-label={`Shared files: ${sharedFilesCount} new`}
        >
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Inbox
                className={`w-5 h-5 transition-colors duration-300 ${
                  sharedFilesCount > 0
                    ? "text-purple-400"
                    : "text-purple-400/70"
                }`}
              />
              {sharedFilesCount > 0 && (
                <motion.span
                  key={sharedFilesCount}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-slate-900 shadow-lg"
                >
                  {sharedFilesCount > 99 ? "99+" : sharedFilesCount}
                </motion.span>
              )}
              {sharedFilesCount > 0 && (
                <motion.div
                  animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -inset-1 bg-purple-500/30 rounded-full"
                />
              )}
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Shared Files</span>
              <div className="font-bold text-lg bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                {sharedFilesCount}
              </div>
            </div>
          </div>
          <div
            className={`absolute inset-0 rounded-xl transition-opacity duration-300 ${
              sharedFilesCount > 0
                ? "bg-gradient-to-r from-purple-500/15 to-pink-500/15 opacity-60 group-hover:opacity-80"
                : "bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-50"
            }`}
          />
        </motion.button>
      </div>
    </div>
  );
};

export default VaultStats;
