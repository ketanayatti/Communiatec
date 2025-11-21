import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, Clock, Shield, RefreshCw, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const MaintenanceScreen = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleRetry = () => {
    window.location.reload();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const pulseVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center p-4">
      {/* Background animated elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-20 bg-gradient-to-b from-cyan-500/10 to-transparent"
            style={{
              left: `${10 + i * 12}%`,
              top: `${5 + (i % 3) * 30}%`,
            }}
            animate={{
              scaleY: [0, 1, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.4,
            }}
          />
        ))}
      </div>

      <motion.div
        className="relative z-10 text-center max-w-2xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo and Brand */}
        <motion.div variants={itemVariants} className="mb-8">
          <motion.div 
            className="inline-flex items-center gap-4 mb-6"
            variants={pulseVariants}
            animate="pulse"
          >
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-500/30">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              {/* Animated ring */}
              <motion.div
                className="absolute inset-0 border-2 border-cyan-400/30 rounded-2xl"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-black bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent">
                TeckTalke
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                <span className="text-sm text-cyan-300 font-mono">Maintenance Mode</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Main maintenance icon */}
        <motion.div variants={itemVariants} className="mb-8">
          <motion.div
            className="w-24 h-24 bg-gradient-to-br from-orange-500/20 to-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-orange-500/30"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Settings className="w-12 h-12 text-orange-400" />
          </motion.div>
        </motion.div>

        {/* Main message */}
        <motion.div variants={itemVariants} className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            We're Making Things Better
          </h2>
          <p className="text-xl text-gray-300 mb-6 leading-relaxed">
            TeckTalke is currently undergoing scheduled maintenance to improve your experience.
            We'll be back online shortly.
          </p>
        </motion.div>

        {/* Status cards */}
        <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-6 h-6 text-cyan-400" />
              <h3 className="font-semibold text-white">Expected Duration</h3>
            </div>
            <p className="text-gray-300">Usually 15-30 minutes</p>
          </div>
          
          <div className="p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-6 h-6 text-green-400" />
              <h3 className="font-semibold text-white">Your Data</h3>
            </div>
            <p className="text-gray-300">Safe and secure</p>
          </div>
        </motion.div>

        {/* Current time */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-full backdrop-blur-sm border border-slate-700">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-gray-300 font-mono">
              Current time: {currentTime.toLocaleTimeString()}
            </span>
          </div>
        </motion.div>

        {/* Action buttons */}
        <motion.div variants={itemVariants} className="space-y-4">
          <Button
            onClick={handleRetry}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-semibold shadow-xl shadow-cyan-500/25 transition-all duration-300"
            size="lg"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Check Again
          </Button>
          
          <p className="text-sm text-gray-400">
            Follow us on social media for real-time updates
          </p>
        </motion.div>

        {/* Footer message */}
        <motion.div variants={itemVariants} className="mt-12 pt-8 border-t border-white/10">
          <p className="text-gray-400 text-sm">
            Thank you for your patience. We're working hard to get back online as quickly as possible.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default MaintenanceScreen;