import React from "react";
import { motion } from "framer-motion";
import { Search, Grid, List } from "lucide-react";

const VaultControls = ({
  searchTerm,
  onSearchChange,
  filterType,
  onFilterChange,
  viewMode,
  onViewModeChange,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      className="flex flex-col sm:flex-row gap-4 mb-8"
    >
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search your vault..."
          value={searchTerm}
          onChange={onSearchChange}
          className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/60 shadow-lg text-white placeholder-slate-400 transition-all duration-300 hover:bg-slate-800/70 focus:bg-slate-800/80"
          aria-label="Search files"
        />
      </div>

      <div className="flex items-center gap-3">
        <motion.select
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          value={filterType}
          onChange={onFilterChange}
          className="px-4 py-3.5 bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/60 shadow-lg text-white cursor-pointer hover:bg-slate-800/70 transition-all duration-300 appearance-none pr-9 min-w-[120px]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='rgb(148 163 184)'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 0.75rem center",
            backgroundSize: "1rem",
          }}
          aria-label="Filter files by type"
        >
          <option value="all">All Files</option>
          <option value="images">Images</option>
          <option value="documents">Documents</option>
          <option value="archives">Archives</option>
        </motion.select>

        <div className="flex bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 shadow-lg overflow-hidden">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onViewModeChange("grid")}
            className={`p-3.5 transition-all duration-300 ${
              viewMode === "grid"
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg"
                : "text-slate-400 hover:text-white hover:bg-slate-700/50"
            }`}
            aria-label="Grid view"
            aria-pressed={viewMode === "grid"}
          >
            <Grid className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onViewModeChange("list")}
            className={`p-3.5 transition-all duration-300 ${
              viewMode === "list"
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg"
                : "text-slate-400 hover:text-white hover:bg-slate-700/50"
            }`}
            aria-label="List view"
            aria-pressed={viewMode === "list"}
          >
            <List className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default VaultControls;
