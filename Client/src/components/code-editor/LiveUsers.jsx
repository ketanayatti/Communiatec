// Client/src/components/code-editor/LiveUsers.jsx
import React from "react";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";

const LiveUsers = ({ participants, typingUsers = new Set() }) => {
  return (
    <div className="bg-slate-900/80 backdrop-blur-md rounded-xl p-4 border border-cyan-500/20 shadow-lg shadow-cyan-500/5 overflow-hidden relative">
      {/* Ambient background glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-10 -top-10 w-20 h-20 bg-cyan-500/10 rounded-full blur-xl"></div>
        <div className="absolute -left-4 -bottom-8 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-4">
        <h3 className="text-white font-medium flex items-center gap-2">
          <div className="flex space-x-1">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  opacity: [0.5, 1, 0.5],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="w-1.5 h-1.5 bg-cyan-400 rounded-full"
              />
            ))}
          </div>
          <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent font-bold">
            Live Users
          </span>
        </h3>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-2 py-1 bg-slate-800/60 backdrop-blur-sm rounded-full text-xs font-medium text-white border border-slate-700/50"
        >
          {participants.length} {participants.length === 1 ? "user" : "users"}
        </motion.div>
      </div>

      {/* Users list */}
      <div className="space-y-2.5 relative z-10">
        <AnimatePresence>
          {participants.map((participant) => (
            <motion.div
              key={participant.userId}
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="group relative flex items-center p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800/80 border border-slate-700/50 hover:border-cyan-500/30 transition-all duration-300 backdrop-blur-sm overflow-hidden"
            >
              {/* User background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 to-cyan-500/0 group-hover:from-emerald-500/5 group-hover:to-cyan-500/5 transition-all duration-300"></div>

              {/* User avatar */}
              <div className="relative mr-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-semibold"
                  style={{
                    backgroundColor: `${participant.color}30`,
                    boxShadow: `0 0 15px ${participant.color}40`,
                  }}
                >
                  <span style={{ color: participant.color }}>
                    {participant.username.charAt(0).toUpperCase()}
                  </span>

                  {/* Status indicator */}
                  <motion.div
                    className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-900"
                    animate={{
                      boxShadow: [
                        "0 0 0px #10b981",
                        "0 0 8px #10b981",
                        "0 0 0px #10b981",
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  />
                </div>
              </div>

              {/* User info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-medium truncate">
                    {participant.username}
                  </span>

                  {/* Typing indicator */}
                  <AnimatePresence>
                    {typingUsers.has(participant.userId) && (
                      <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="flex items-center bg-cyan-500/10 rounded-full pl-1.5 pr-2 py-0.5 border border-cyan-500/30"
                      >
                        <div className="flex space-x-0.5 mr-1.5">
                          {[...Array(3)].map((_, i) => (
                            <motion.div
                              key={i}
                              animate={{ y: [0, -3, 0] }}
                              transition={{
                                duration: 0.6,
                                repeat: Infinity,
                                repeatType: "loop",
                                delay: i * 0.1,
                              }}
                              className="w-1 h-1 bg-cyan-400 rounded-full"
                            />
                          ))}
                        </div>
                        <span className="text-cyan-400 text-xs font-medium whitespace-nowrap">
                          typing
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex items-center mt-0.5 text-slate-400 text-xs">
                  <div className="flex items-center space-x-1">
                    <span>Line {participant.cursor?.line || 1}</span>
                    <span>•</span>
                    <span>Col {participant.cursor?.column || 1}</span>
                    <span
                      className="w-1.5 h-1.5 rounded-full ml-1.5 animate-pulse"
                      style={{ backgroundColor: participant.color }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty state */}
      {participants.length === 0 && (
        <motion.div
          className="text-center py-6 px-4 rounded-lg bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.3 }}
            className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-700/50 flex items-center justify-center"
          >
            <UserCircleIcon className="w-7 h-7 text-slate-500" />
          </motion.div>
          <p className="text-slate-300 text-sm font-medium">
            No other users online
          </p>
          <p className="text-slate-500 text-xs mt-1.5">
            Share the session link to invite others
          </p>
        </motion.div>
      )}

      {/* Session stats */}
      {participants.length > 0 && (
        <motion.div
          className="mt-4 pt-3 border-t border-slate-700/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Active collaborators</span>
            <span className="text-cyan-400 font-medium">
              {participants.length}
            </span>
          </div>
          {typingUsers.size > 0 && (
            <div className="flex justify-between items-center text-xs mt-1.5">
              <span className="text-slate-400">Currently typing</span>
              <span className="text-emerald-400 font-medium">
                {typingUsers.size}
              </span>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default LiveUsers;
