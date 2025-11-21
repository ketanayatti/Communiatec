import { useState } from 'react';
import { XMarkIcon, EyeIcon, EyeSlashIcon, CodeBracketIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const LoginModal = ({ isOpen, onClose, onLogin }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please enter both email and password");
      return;
    }

    setIsLoading(true);

    try {
      await onLogin(formData);
      toast.success("Logged in successfully");
      onClose();
    } catch (error) {
      toast.error(error.message || "Login failed");
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-br from-cyan-500/15 to-emerald-500/15 rounded-full blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, 40, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      <motion.div
        className="relative w-full max-w-md mx-4"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
      >
        {/* Main Card */}
        <div className="bg-gray-900/70 backdrop-blur-2xl rounded-3xl border border-emerald-500/20 shadow-2xl shadow-emerald-500/10 p-8 overflow-hidden relative">
          {/* Glass effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5 pointer-events-none rounded-3xl" />

          {/* Background Code Icon */}
          <div className="absolute -right-12 -top-12 opacity-5 pointer-events-none">
            <CodeBracketIcon className="w-48 h-48 text-emerald-400" />
          </div>

          {/* Animated corner accents */}
          <div className="absolute top-4 left-4 w-2 h-2 bg-slate-900 rounded-full animate-pulse" />
          <div
            className="absolute top-4 right-4 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"
            style={{ animationDelay: "0.5s" }}
          />
          <div
            className="absolute bottom-4 left-4 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          <div
            className="absolute bottom-4 right-4 w-2 h-2 bg-emerald-400 rounded-full animate-pulse"
            style={{ animationDelay: "1.5s" }}
          />

          {/* Close Button */}
          <motion.button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-gray-400 hover:text-white transition-colors z-20 rounded-lg hover:bg-gray-800/50"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <XMarkIcon className="w-5 h-5" />
          </motion.button>

          {/* Header */}
          <div className="text-center mb-8 relative z-10">
            <motion.div
              className="inline-block mb-4"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                delay: 0.1,
                type: "spring",
                stiffness: 200,
                damping: 15,
              }}
            >
              <div className="relative">
                {/* Rotating ring */}
                <div
                  className="absolute inset-0 w-16 h-16 border-2 border-emerald-500/30 rounded-full animate-spin"
                  style={{ animationDuration: "3s" }}
                />
                {/* Main icon */}
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-emerald-500/30">
                  <CodeBracketIcon className="w-8 h-8 text-emerald-400" />
                </div>
              </div>
            </motion.div>

            <motion.h2
              className="text-3xl font-bold mb-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Welcome to CodeSync
              </span>
            </motion.h2>
            <motion.p
              className="text-gray-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Sign in to start collaborating
            </motion.p>
          </div>

          {/* Login Form */}
          <div className="space-y-6 relative z-10">
            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="text-white font-medium mb-3 block">
                Email Address
              </label>
              <div className="relative group">
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-4 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 focus:bg-gray-800/80 transition-all duration-300 backdrop-blur-sm"
                  placeholder="Enter your email"
                />
                {/* Focus glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-xl blur-sm opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label className="text-white font-medium mb-3 block">
                Password
              </label>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-4 py-4 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 focus:bg-gray-800/80 transition-all duration-300 pr-12 backdrop-blur-sm"
                  placeholder="Enter your password"
                />
                <motion.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-emerald-400 transition-colors rounded-lg hover:bg-gray-700/50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </motion.button>
                {/* Focus glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-xl blur-sm opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            </motion.div>

            {/* Login Button */}
            <motion.button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`w-full py-4 px-6 rounded-xl font-medium transition-all duration-300 ${
                isLoading
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30"
              } text-white`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={!isLoading ? { scale: 1.02 } : {}}
              whileTap={!isLoading ? { scale: 0.98 } : {}}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <motion.div
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-3"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  Signing In...
                </div>
              ) : (
                "Sign In"
              )}
            </motion.button>
          </div>

          {/* Footer */}
          <motion.div
            className="text-center mt-8 relative z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <p className="text-gray-400 text-sm">
              Don't have an account?{" "}
              <motion.button
                className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                Sign up
              </motion.button>
            </p>
          </motion.div>

          {/* Additional decorative elements */}
          <div className="absolute top-1/2 left-0 w-px h-16 bg-gradient-to-b from-transparent via-emerald-500/30 to-transparent" />
          <div className="absolute top-1/2 right-0 w-px h-16 bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent" />
        </div>
      </motion.div>
    </div>
  );
};

export default LoginModal;