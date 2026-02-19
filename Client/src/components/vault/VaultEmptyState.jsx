import React from "react";
import { motion } from "framer-motion";
import { File, Upload } from "lucide-react";

const VaultEmptyState = ({ searchTerm, filterType, onUploadClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-20 bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-lg"
    >
      <motion.div
        animate={{
          rotate: 360,
          scale: [1, 1.05, 1],
        }}
        transition={{
          rotate: { duration: 30, repeat: Infinity, ease: "linear" },
          scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
        }}
        className="relative w-24 h-24 mx-auto mb-6"
      >
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-700/80 border border-slate-600/40 flex items-center justify-center">
          <File className="w-12 h-12 text-slate-400" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 to-indigo-400/5 rounded-2xl blur-xl" />
      </motion.div>

      <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
        Your Vault is Empty
      </h3>
      <p className="text-slate-300 max-w-md mx-auto px-4 mb-6">
        {searchTerm || filterType !== "all"
          ? "No files match your search criteria."
          : "Upload your first file to secure your digital assets."}
      </p>
      <motion.button
        whileHover={{ scale: 1.03, y: -2 }}
        whileTap={{ scale: 0.97 }}
        onClick={onUploadClick}
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-medium shadow-lg hover:shadow-cyan-500/30 transition-all"
      >
        <Upload className="w-4 h-4" />
        Upload Now
      </motion.button>
    </motion.div>
  );
};

export default VaultEmptyState;
