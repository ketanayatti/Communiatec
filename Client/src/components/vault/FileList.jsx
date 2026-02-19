import React from "react";
import { motion } from "framer-motion";
import { File, Database, Zap, Download, Share, Trash2 } from "lucide-react";
import { getFileIcon, formatFileSize } from "@/lib/vaultUtils";

const FileList = ({ files, onDownload, onShare, onDelete }) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-800/70 backdrop-blur-xl">
            <tr>
              <th className="text-left py-4 px-5 font-semibold text-slate-300 text-sm sm:text-base">
                <div className="flex items-center gap-2.5">
                  <File className="w-4 h-4 text-cyan-400" />
                  File
                </div>
              </th>
              <th className="text-left py-4 px-5 font-semibold text-slate-300 text-sm sm:text-base">
                <div className="flex items-center gap-2.5">
                  <Database className="w-4 h-4 text-indigo-400" />
                  Size
                </div>
              </th>
              <th className="text-left py-4 px-5 font-semibold text-slate-300 text-sm sm:text-base">
                <div className="flex items-center gap-2.5">
                  <Zap className="w-4 h-4 text-purple-400" />
                  Uploaded
                </div>
              </th>
              <th className="text-left py-4 px-5 font-semibold text-slate-300 text-sm sm:text-base">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/40">
            {files.map((file, index) => (
              <motion.tr
                key={file._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03, duration: 0.3 }}
                className="hover:bg-slate-700/30 transition-colors duration-200 group"
              >
                <td className="py-4 px-5">
                  <div className="flex items-center gap-3">
                    <motion.div
                      whileHover={{ rotate: 5, scale: 1.05 }}
                      className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-600/40 group-hover:border-cyan-400/40 transition-all duration-300"
                    >
                      {getFileIcon(file.mimeType)}
                    </motion.div>
                    <div>
                      <div
                        className="font-medium text-white text-sm sm:text-base truncate max-w-[200px] sm:max-w-none group-hover:text-cyan-300 transition-colors"
                        title={file.filename}
                      >
                        {file.filename}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 capitalize">
                        {file.mimeType.split("/")[1]}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-5">
                  <span className="font-medium text-cyan-400">
                    {formatFileSize(file.size)}
                  </span>
                </td>
                <td className="py-4 px-5 text-slate-300 text-sm">
                  {new Date(file.createdAt).toLocaleDateString()}
                  <br />
                  <span className="text-slate-500 text-xs">
                    {new Date(file.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </td>
                <td className="py-4 px-5">
                  <div className="flex flex-wrap gap-2">
                    {[
                      {
                        label: "Download",
                        icon: <Download className="w-3.5 h-3.5" />,
                        onClick: () => onDownload(file._id),
                        bg: "from-cyan-500/20 to-blue-500/20",
                        text: "text-cyan-400",
                        border: "border-cyan-500/40",
                        hover: "hover:border-cyan-400",
                      },
                      {
                        label: "Share",
                        icon: <Share className="w-3.5 h-3.5" />,
                        onClick: () => onShare(file._id, file.filename),
                        bg: "from-indigo-500/20 to-purple-500/20",
                        text: "text-indigo-400",
                        border: "border-indigo-500/40",
                        hover: "hover:border-indigo-400",
                      },
                      {
                        label: "Delete",
                        icon: <Trash2 className="w-3.5 h-3.5" />,
                        onClick: () => onDelete(file._id, file.filename),
                        bg: "from-red-500/20 to-pink-500/20",
                        text: "text-red-400",
                        border: "border-red-500/40",
                        hover: "hover:border-red-400",
                      },
                    ].map((btn, i) => (
                      <motion.button
                        key={i}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={btn.onClick}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-gradient-to-r ${btn.bg} ${btn.text} border ${btn.border} ${btn.hover} rounded-lg transition-all duration-200 backdrop-blur-sm`}
                        aria-label={`${btn.label} ${file.filename}`}
                      >
                        {btn.icon}
                        <span className="hidden sm:inline">{btn.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FileList;
