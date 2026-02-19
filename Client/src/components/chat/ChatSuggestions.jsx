import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SendHorizontal,
  Lightbulb,
  Calendar,
  Code,
  TrendingUp,
  Users,
  MessageCircle,
  Zap,
  Database,
  Settings,
  Target,
  BarChart3,
  FileText,
  CheckCircle,
  AlertCircle,
  Brain,
  Rocket,
  Search,
  Clock,
  Star,
} from "lucide-react";

// Enhanced icon mapping for different categories
const categoryIcons = {
  // Business Icons
  business_greeting: TrendingUp,
  project_management: Target,
  sales_business: BarChart3,
  strategy_planning: Brain,
  financial_analysis: BarChart3,
  team_collaboration: Users,
  client_communication: MessageCircle,

  // Technical Icons
  coding_discussion: Code,
  technical_architecture: Database,
  devops_operations: Settings,
  debugging_troubleshooting: AlertCircle,
  data_analysis: BarChart3,
  quality_testing: CheckCircle,

  // Growth & Learning
  innovation_research: Rocket,
  learning_development: Star,

  // General
  greeting: MessageCircle,
  agreement: CheckCircle,
  question: Search,
  clarification: Lightbulb,
  scheduling: Calendar,
  task: Target,
  meeting_schedule: Calendar,
  meeting_followup: FileText,
  deadline: Clock,

  // Fallback
  default: SendHorizontal,
};

const suggestionTypeIcons = {
  quick_response: SendHorizontal,
  smart_suggestion: Lightbulb,
  followup_question: Search,
  action_suggestion: Zap,
  action: Calendar,
};

const categoryColors = {
  // Business categories - Blue/Cyan tones
  business_greeting: "from-cyan-500/20 to-blue-500/20 border-cyan-500/30",
  project_management: "from-blue-500/20 to-indigo-500/20 border-blue-500/30",
  sales_business: "from-green-500/20 to-emerald-500/20 border-green-500/30",
  strategy_planning: "from-purple-500/20 to-violet-500/20 border-purple-500/30",
  financial_analysis:
    "from-emerald-500/20 to-green-500/20 border-emerald-500/30",
  team_collaboration: "from-orange-500/20 to-amber-500/20 border-orange-500/30",
  client_communication: "from-pink-500/20 to-rose-500/20 border-pink-500/30",

  // Technical categories - Purple/Indigo tones
  coding_discussion: "from-indigo-500/20 to-purple-500/20 border-indigo-500/30",
  technical_architecture:
    "from-violet-500/20 to-purple-500/20 border-violet-500/30",
  devops_operations: "from-slate-500/20 to-gray-500/20 border-slate-500/30",
  debugging_troubleshooting:
    "from-red-500/20 to-orange-500/20 border-red-500/30",
  data_analysis: "from-teal-500/20 to-cyan-500/20 border-teal-500/30",
  quality_testing: "from-lime-500/20 to-green-500/20 border-lime-500/30",

  // Growth categories - Gold/Yellow tones
  innovation_research:
    "from-yellow-500/20 to-orange-500/20 border-yellow-500/30",
  learning_development:
    "from-amber-500/20 to-yellow-500/20 border-amber-500/30",

  // General categories - Default gradient
  default: "from-gray-700/20 to-gray-600/20 border-gray-500/30",
};

export function ChatSuggestions({
  suggestions = [],
  onSuggestionClick,
  isLoading = false,
  showCategories = true,
  maxVisible = 6,
}) {
  const [expandedView, setExpandedView] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [displayedSuggestions, setDisplayedSuggestions] = useState([]);

  useEffect(() => {
    if (suggestions.length === 0) return;

    // Filter suggestions by category if needed
    let filtered =
      selectedCategory === "all"
        ? suggestions
        : suggestions.filter((s) => s.category === selectedCategory);

    // Limit suggestions shown
    const limit = expandedView ? maxVisible : 3;
    setDisplayedSuggestions(filtered.slice(0, limit));
  }, [suggestions, selectedCategory, expandedView, maxVisible]);

  // Get unique categories from suggestions
  const categories = [...new Set(suggestions.map((s) => s.category))];

  if (!suggestions?.length && !isLoading) return null;

  const getSuggestionIcon = (suggestion) => {
    return (
      categoryIcons[suggestion.category] ||
      suggestionTypeIcons[suggestion.suggestionType] ||
      categoryIcons.default
    );
  };

  const getSuggestionColor = (category) => {
    return categoryColors[category] || categoryColors.default;
  };

  const formatSuggestionText = (text, maxLength = 50) => {
    if (!expandedView && text.length > maxLength) {
      return text.substring(0, maxLength) + "...";
    }
    return text;
  };

  const getCategoryDisplayName = (category) => {
    return category.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="px-3 py-3 border-t border-gray-800 bg-gray-950/50"
    >
      {/* Header with category filter */}
      {showCategories && categories.length > 1 && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedCategory === "all"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              All
            </motion.button>
            {categories.slice(0, 4).map((category) => (
              <motion.button
                key={category}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                {getCategoryDisplayName(category)}
              </motion.button>
            ))}
          </div>

          {suggestions.length > 3 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setExpandedView(!expandedView)}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
            >
              {expandedView ? "Show Less" : `+${suggestions.length - 3} More`}
            </motion.button>
          )}
        </div>
      )}

      {/* Suggestions Grid */}
      <div
        className={`grid gap-2 ${
          expandedView
            ? "grid-cols-1 sm:grid-cols-2"
            : "flex overflow-x-auto scrollbar-hide"
        } pb-2`}
      >
        <AnimatePresence mode="popLayout">
          {isLoading
            ? // Enhanced loading placeholders
              Array(3)
                .fill(0)
                .map((_, i) => (
                  <motion.div
                    key={`loading-${i}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex items-center gap-3 p-3 bg-gray-800/60 rounded-xl border border-gray-700 animate-pulse"
                    style={{ minWidth: expandedView ? "auto" : "280px" }}
                  >
                    <div className="w-5 h-5 bg-gray-600 rounded-full" />
                    <div className="flex-1">
                      <div
                        className="h-4 bg-gray-600 rounded mb-1"
                        style={{ width: `${Math.random() * 60 + 40}%` }}
                      />
                      <div
                        className="h-3 bg-gray-700 rounded"
                        style={{ width: `${Math.random() * 40 + 30}%` }}
                      />
                    </div>
                  </motion.div>
                ))
            : // Actual suggestions with enhanced styling
              displayedSuggestions.map((suggestion, index) => {
                const Icon = getSuggestionIcon(suggestion);
                const colorClass = getSuggestionColor(suggestion.category);

                return (
                  <motion.div
                    key={`${suggestion.suggestion}-${index}`}
                    layout
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -20 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    style={{ minWidth: expandedView ? "auto" : "280px" }}
                  >
                    <button
                      onClick={() => onSuggestionClick(suggestion)}
                      className={`group relative w-full text-left p-3 rounded-xl border transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 bg-gradient-to-br ${colorClass}`}
                    >
                      {/* Content */}
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                          <Icon
                            size={16}
                            className="text-cyan-400 group-hover:text-cyan-300"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-200 group-hover:text-white leading-relaxed">
                            {formatSuggestionText(
                              suggestion.suggestion,
                              expandedView ? 100 : 50
                            )}
                          </p>

                          {showCategories && (
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800/50 text-gray-400 border border-gray-700">
                                {getCategoryDisplayName(suggestion.category)}
                              </span>
                              <span className="text-xs text-gray-500">
                                {suggestion.suggestionType.replace("_", " ")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Hover effect overlay */}
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </button>
                  </motion.div>
                );
              })}
        </AnimatePresence>
      </div>

      {/* Footer info */}
      {!isLoading && suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 flex items-center justify-between text-xs text-gray-500"
        >
          <span>{suggestions.length} suggestions available</span>
          <span className="flex items-center gap-1">
            <Zap size={12} />
            AI-powered
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
