import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MessageCircle, Send, Calendar, HelpCircle, Zap } from 'lucide-react';

// Add global styles to hide scrollbar
const style = document.createElement('style');
style.textContent = `
    .hide-scrollbar {
        -ms-overflow-style: none;  /* IE and Edge */
        scrollbar-width: none;     /* Firefox */
    }
    .hide-scrollbar::-webkit-scrollbar {
        display: none;            /* Chrome, Safari and Opera */
    }
`;
document.head.appendChild(style);

const suggestionTypeIcons = {
    quick_response: Send,
    followup_question: HelpCircle,
    action_suggestion: Calendar
};

const suggestionColors = {
    quick_response: 'from-cyan-500 to-blue-500',
    followup_question: 'from-violet-500 to-purple-500',
    action_suggestion: 'from-emerald-500 to-green-500'
};

export function MessageSuggestions({ suggestions, onSuggestionClick, isLoading }) {
    if (!suggestions?.length && !isLoading) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="py-2 bg-slate-900/95 backdrop-blur-lg rounded-xl border border-slate-700/50 shadow-lg"
        >
            <div className="flex gap-2 overflow-x-auto pb-1 max-h-24 hide-scrollbar">
                {isLoading ? (
                    // Loading placeholders
                    Array(3).fill(0).map((_, i) => (
                        <div
                            key={i}
                            className="flex-shrink-0 h-8 bg-slate-800/60 rounded-lg animate-pulse"
                            style ={{ width: `${Math.random() * 100 + 100}px` }}
                        />
                    ))
                ) : (
                    // Actual suggestions
                    suggestions.map((suggestion) => {
                        const Icon = suggestionTypeIcons[suggestion.suggestionType] || MessageCircle;
                        const gradientColor = suggestionColors[suggestion.suggestionType] || 'from-slate-500 to-slate-600';

                        return (
                            <motion.div
                                key={suggestion._id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onSuggestionClick(suggestion)}
                                    className="relative group px-3 py-1.5 rounded-lg border border-slate-600/50 transition-all duration-200 overflow-hidden"
                                >
                                    {/* Gradient background */}
                                    <div className={`absolute inset-0 bg-gradient-to-r ${gradientColor} opacity-10 group-hover:opacity-20 transition-opacity duration-200`} />
                                    
                                    {/* Shine effect on hover */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                                    
                                    {/* Content */}
                                    <div className="flex items-center gap-2 relative z-10">
                                        <Icon size={14} className={`text-${gradientColor.split('-')[1]}-400`} />
                                        <span className="text-sm whitespace-nowrap text-slate-300">
                                            {suggestion.suggestion.length > 30
                                                ? suggestion.suggestion.substring(0, 30) + '...'
                                                : suggestion.suggestion}
                                        </span>
                                    </div>

                                    {/* Tooltip */}
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-xs text-slate-300 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                                        {suggestion.category}
                                    </div>
                                </Button>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </motion.div>
    );
}
