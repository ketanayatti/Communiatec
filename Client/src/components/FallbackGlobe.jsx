import React from "react";
import { motion } from "framer-motion";

const FallbackGlobe = ({
  onBrandClick,
  onPrivacyClick,
  showAuth,
}) => {
  const [showBrandText, setShowBrandText] = React.useState(true);

  const handleBrandClick = () => {
    setShowBrandText(false);
    setTimeout(() => {
      onBrandClick();
    }, 500);
  };

  if (showAuth) return null;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-black"
        animate={{
          background: [
            "linear-gradient(45deg, #0f172a, #1e40af, #000000)",
            "linear-gradient(45deg, #1e40af, #7c3aed, #0f172a)",
            "linear-gradient(45deg, #7c3aed, #0f172a, #1e40af)",
            "linear-gradient(45deg, #0f172a, #1e40af, #000000)",
          ],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0.3, 1, 0.3],
              scale: [0.5, 1.5, 0.5],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* 2D Globe representation */}
      <motion.div
        className="relative z-10 flex flex-col items-center justify-center"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
      >
        {showBrandText && (
          <>
            {/* Animated Globe Circle */}
            <motion.div
              className="relative w-64 h-64 mb-8 cursor-pointer"
              onClick={handleBrandClick}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Outer rings */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className={`absolute inset-0 rounded-full border-2 border-cyan-400/30`}
                  style={{
                    width: `${100 + i * 20}%`,
                    height: `${100 + i * 20}%`,
                    left: `${-i * 10}%`,
                    top: `${-i * 10}%`,
                  }}
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 10 + i * 5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              ))}

              {/* Main globe */}
              <motion.div
                className="w-full h-full bg-gradient-to-br from-cyan-500/20 via-blue-600/30 to-purple-700/20 rounded-full backdrop-blur-sm border-2 border-cyan-400/50 flex items-center justify-center relative overflow-hidden"
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(6, 182, 212, 0.3)",
                    "0 0 40px rgba(6, 182, 212, 0.6)",
                    "0 0 20px rgba(6, 182, 212, 0.3)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {/* Grid pattern */}
                <div className="absolute inset-0 opacity-30">
                  <div
                    className="w-full h-full"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3cpattern id='grid' width='40' height='40' patternUnits='userSpaceOnUse'%3e%3cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='cyan' stroke-width='1'/%3e%3c/pattern%3e%3c/defs%3e%3crect width='100%25' height='100%25' fill='url(%23grid)' /%3e%3c/svg%3e")`,
                    }}
                  />
                </div>

                {/* Center glow */}
                <motion.div
                  className="w-8 h-8 bg-cyan-400 rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.6, 1, 0.6],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
            </motion.div>

            {/* Brand Text */}
            <motion.h1
              className="text-6xl md:text-8xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent tracking-wider text-center mb-8 cursor-pointer"
              onClick={handleBrandClick}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              animate={{
                textShadow: [
                  "0 0 20px rgba(6, 182, 212, 0.5)",
                  "0 0 40px rgba(6, 182, 212, 0.8)",
                  "0 0 20px rgba(6, 182, 212, 0.5)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              COMMUNIATEC
            </motion.h1>

            {/* Navigation buttons */}
            <div className="flex gap-6">
              <motion.button
                onClick={onPrivacyClick}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-cyan-400/50 hover:border-cyan-400 rounded-full backdrop-blur-sm transition-all duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-white font-bold text-lg tracking-wide">
                  Privacy
                </span>
              </motion.button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default FallbackGlobe;
