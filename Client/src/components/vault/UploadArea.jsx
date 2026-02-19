import React from "react";
import { motion } from "framer-motion";
import { Upload, Sparkles } from "lucide-react";

const UploadArea = ({
  dragActive,
  uploading,
  onDrop,
  onDragOver,
  onDragLeave,
  onFileInputChange,
  fileInputRef,
  onUploadClick,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.6 }}
      className={`relative group overflow-hidden transition-all duration-500 ${
        dragActive ? "scale-[1.03]" : "hover:scale-[1.01]"
      }`}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      <div
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 transition-all duration-500 backdrop-blur-xl ${
          dragActive
            ? "border-cyan-400 bg-slate-800/70 shadow-xl shadow-cyan-500/20"
            : "border-slate-700/50 hover:border-cyan-500/50 bg-slate-800/40 hover:bg-slate-800/60"
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-2xl" />

        {/* Corner accents */}
        <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-slate-600/40 group-hover:border-cyan-400/70 transition-colors duration-500" />
        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-slate-600/40 group-hover:border-indigo-400/70 transition-colors duration-500" />

        <div className="text-center relative z-10">
          <motion.div
            whileHover={{ rotate: 10, scale: 1.1 }}
            className="mx-auto w-20 h-20 bg-gradient-to-br from-slate-800/80 to-slate-700/80 rounded-2xl flex items-center justify-center mb-6 border border-slate-600/40 group-hover:border-cyan-400/50 transition-all duration-500 shadow-lg group-hover:shadow-cyan-500/30 backdrop-blur-sm"
          >
            <Upload className="w-10 h-10 text-cyan-400" />
          </motion.div>

          <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Upload Files
          </h3>
          <p className="text-slate-300 mb-6 text-sm sm:text-base max-w-md mx-auto">
            {dragActive
              ? "Drop files here to upload"
              : "Drag & drop your files, or click to browse"}
          </p>

          <input
            type="file"
            multiple
            onChange={onFileInputChange}
            ref={fileInputRef}
            className="hidden"
            aria-label="Choose files to upload"
          />

          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={onUploadClick}
            disabled={uploading}
            className="group/btn relative inline-flex items-center gap-2.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-700 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-600 text-white px-7 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 text-base sm:text-lg overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-indigo-400/20 rounded-xl blur-md opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />

            {/* Shine effect */}
            <motion.div
              animate={{ x: uploading ? [0, 0] : [-100, 250] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 group-hover/btn:opacity-100"
            />

            {uploading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-cyan-300" />
                <span>Choose Files</span>
              </>
            )}
          </motion.button>

          <div className="flex items-center justify-center gap-5 mt-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full relative">
                <span className="absolute inset-0 rounded-full bg-cyan-400 animate-ping opacity-20" />
              </div>
              <span>Instant Upload</span>
            </div>
            <div className="w-px h-3 bg-slate-700" />
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full relative">
                <span className="absolute inset-0 rounded-full bg-indigo-400 animate-ping opacity-20 delay-500" />
              </div>
              <span>End-to-End Encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default UploadArea;
