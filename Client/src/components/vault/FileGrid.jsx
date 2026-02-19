import React from "react";
import { motion } from "framer-motion";
import { Download, Share, Trash2 } from "lucide-react";
import { getFileIcon, formatFileSize } from "@/lib/vaultUtils";

const FileGrid = ({ files, onDownload, onShare, onDelete }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {files.map((file, index) => (
        <motion.div
          key={file._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.4 }}
          whileHover={{ y: -8, transition: { duration: 0.2 } }}
          className="group relative bg-slate-800/50 backdrop-blur-xl p-5 rounded-2xl border border-slate-700/50 hover:border-cyan-500/60 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-cyan-500/10 overflow-hidden"
        >
          {/* Hover gradient effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-2xl" />

          <div className="relative z-10 space-y-4">
            <div className="flex items-start justify-between">
              <motion.div
                whileHover={{ rotate: 10, scale: 1.1 }}
                className="p-3.5 bg-gradient-to-br from-slate-800/80 to-slate-700/80 rounded-xl border border-slate-600/40 group-hover:border-cyan-400/50 transition-all duration-300 shadow-md backdrop-blur-sm"
              >
                {getFileIcon(file.mimeType)}
              </motion.div>

              <div className="flex -space-x-1">
                {[
                  {
                    icon: <Download className="w-4 h-4" />,
                    onClick: () => onDownload(file._id),
                    color: "hover:text-cyan-400",
                    label: "Download",
                  },
                  {
                    icon: <Share className="w-4 h-4" />,
                    onClick: () => onShare(file._id, file.filename),
                    color: "hover:text-indigo-400",
                    label: "Share",
                  },
                  {
                    icon: <Trash2 className="w-4 h-4" />,
                    onClick: () => onDelete(file._id, file.filename),
                    color: "hover:text-red-400",
                    label: "Delete",
                  },
                ].map((btn, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={btn.onClick}
                    className={`p-2.5 text-slate-400 ${btn.color} hover:bg-slate-700/60 rounded-lg transition-all duration-200 group/btn`}
                    aria-label={btn.label}
                  >
                    {btn.icon}
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <h3
                className="font-semibold text-white truncate text-base group-hover:text-cyan-300 transition-colors"
                title={file.filename}
              >
                {file.filename}
              </h3>
              <div className="mt-2 flex justify-between text-xs text-slate-400">
                <span>{formatFileSize(file.size)}</span>
                <span>{new Date(file.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="w-full h-1.5 bg-slate-700/40 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{
                  delay: index * 0.05 + 0.3,
                  duration: 1,
                  ease: "easeOut",
                }}
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
              />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default FileGrid;
