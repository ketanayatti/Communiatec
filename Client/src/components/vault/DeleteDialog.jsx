import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, File, Trash2, X } from "lucide-react";

const DeleteDialog = ({ isOpen, onClose, onConfirm, fileName }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-desc"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900/95 backdrop-blur-3xl rounded-2xl border border-red-500/20 shadow-2xl max-w-md w-full overflow-hidden"
          >
            {/* Header */}
            <div className="relative p-6 pb-4 bg-gradient-to-br from-red-500/10 to-pink-500/10 border-b border-slate-700/50">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
                  className="w-16 h-16 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-xl flex items-center justify-center mb-4 border border-red-500/30"
                >
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </motion.div>

                <h2
                  id="delete-dialog-title"
                  className="text-2xl font-bold text-white text-center"
                >
                  Delete Permanently?
                </h2>
                <p
                  id="delete-dialog-desc"
                  className="text-slate-400 text-center text-sm mt-2"
                >
                  This action cannot be undone
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 pt-5">
              <div className="text-center mb-6">
                <p className="text-slate-300 text-sm mb-4">
                  Are you sure you want to delete this file?
                </p>
                <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-3.5 border border-slate-700/40 inline-flex items-center gap-3">
                  <File className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  <span
                    className="font-medium text-white truncate max-w-[200px]"
                    title={fileName}
                  >
                    {fileName}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 px-5 py-3.5 bg-slate-800/70 hover:bg-slate-700/60 text-slate-300 hover:text-white rounded-xl font-medium transition-all duration-200 border border-slate-700/50 hover:border-slate-600/50"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onConfirm}
                  className="flex-1 px-5 py-3.5 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-400 hover:to-pink-500 text-white rounded-xl font-medium transition-all duration-200 shadow-lg shadow-red-500/20 hover:shadow-red-500/30 relative overflow-hidden group"
                >
                  <motion.div
                    animate={{ x: [-100, 250] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100"
                  />
                  <span className="relative z-10 flex items-center justify-center gap-1.5">
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DeleteDialog;
