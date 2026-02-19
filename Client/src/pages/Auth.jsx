import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import apiClient from "@/lib/apiClient";
import { useStore } from "@/store/store";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Loader2, X } from "lucide-react";
import { FaLinkedin, FaGithub } from "react-icons/fa";
import { cn } from "@/lib/utils";
import ResetPassword from "./ResetPassword";
import Globe3D from "@/components/Globe3D";
import ThreeErrorBoundary from "@/components/ThreeErrorBoundary";

const Auth = () => {
  // All your existing state (unchanged)

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [resetUser, setResetUser] = useState(null);
  const { setUserInfo } = useStore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Check if device is mobile using window width
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showAuthPanel, setShowAuthPanel] = useState(isMobile);
  const [globeAnimating, setGlobeAnimating] = useState(false);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setShowAuthPanel(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle OAuth token from URL parameters
  useEffect(() => {
    const token = searchParams.get("token");
    const success = searchParams.get("success");

    if (token && success === "true") {
      console.log("📥 OAuth token received from URL");
      // Store the token
      localStorage.setItem("authToken", token);
      const expiry = Date.now() + 3 * 24 * 60 * 60 * 1000; // 3 days
      localStorage.setItem("authTokenExpiry", expiry.toString());

      // Clear URL parameters
      setSearchParams({});

      // Fetch user info with the new token
      const fetchUserInfo = async () => {
        try {
          const response = await apiClient.get("/api/auth/userInfo");
          if (response.data?.user) {
            setUserInfo(response.data.user);
            toast.success("Logged in successfully via OAuth");
            navigate(response.data.user.profileSetup ? "/chat" : "/profile");
          }
        } catch (error) {
          console.error("Failed to fetch user info after OAuth:", error);
          toast.error("Authentication failed. Please try again.");
          localStorage.removeItem("authToken");
          localStorage.removeItem("authTokenExpiry");
        }
      };

      fetchUserInfo();
    }
  }, [searchParams, setSearchParams, setUserInfo, navigate]);

  const handlePasswordReset = () => {
    setResettingPassword(false);
    setResetUser(null);
    setEmail("");
    setPassword("");
  };

  // Handle brand click to show auth panel
  const handleBrandClick = () => {
    setGlobeAnimating(true);
    setTimeout(() => {
      setShowAuthPanel(true);
      setGlobeAnimating(false);
    }, 800);
  };

  // Handle navigation to privacy policy
  const handlePrivacyClick = () => {
    navigate("/privacy-policy");
  };



  // Close auth panel
  const handleCloseAuth = () => {
    setShowAuthPanel(false);
    setEmail("");
    setPassword("");
  };

  const validateLogin = (email, password) => {
    if (!email) {
      toast.error("Email is required");
      return false;
    }
    if (!password) {
      toast.error("Password is required");
      return false;
    }
    return true;
  };

  const handleLogIn = async () => {
    if (validateLogin(email, password)) {
      setLoading(true);
      try {
        const response = await apiClient.post(
          "/api/auth/login",
          { email, password },
          { withCredentials: true }
        );
        console.log("Login response:", response.data);

        // Store the token if provided (backup authentication method)
        if (response.data.token) {
          const expiry = Date.now() + 3 * 24 * 60 * 60 * 1000; // 3 days
          localStorage.setItem("authToken", response.data.token);
          localStorage.setItem("authTokenExpiry", expiry.toString());
        }

        if (response.data.resetPassword) {
          setResetUser(response.data.user);
          setResettingPassword(true);
          toast.info("Please reset your password.");
        } else if (response.data.user?._id) {
          setUserInfo(response.data.user);
          toast.success("Logged in successfully");
          navigate(response.data.user.profileSetup ? "/chat" : "/profile");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Login failed");
      } finally {
        setLoading(false);
      }
    }
  };

  if (resettingPassword) {
    console.log("Rendering ResetPassword with user:", resetUser);
    return (
      <ResetPassword user={resetUser} onPasswordReset={handlePasswordReset} />
    );
  }

  const handleGithubLogin = () => {
    const serverUrl =
      import.meta.env.VITE_API_URL ||
      import.meta.env.VITE_APP_SERVER_URL || getBaseUrl();
    window.location.href = `${serverUrl}/api/auth/github`;
  };

  const handleLinkedInLogin = () => {
    const serverUrl =
      import.meta.env.VITE_API_URL ||
      import.meta.env.VITE_APP_SERVER_URL || getBaseUrl();
    window.location.href = `${serverUrl}/api/auth/linkedin`;
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-black via-slate-900 to-black">
      {/* 3D Globe Background */}
      <div className="absolute inset-0 z-0">
        <ThreeErrorBoundary
          onBrandClick={handleBrandClick}
          onPrivacyClick={handlePrivacyClick}
          showAuth={showAuthPanel}
        >
          <Globe3D
            onBrandClick={handleBrandClick}
            onPrivacyClick={handlePrivacyClick}
            showAuth={showAuthPanel}
          />
        </ThreeErrorBoundary>
      </div>

      {/* Mobile Background */}
      <div className="absolute inset-0 z-0 block md:hidden">
        <div className="w-full h-full bg-gradient-to-br from-cyan-900/20 via-slate-900/40 to-indigo-900/20 backdrop-blur-xl"></div>
      </div>

      {/* Animated particles overlay */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        {[...Array(20)].map((_, i) => (
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

      {/* Authentication Panel */}
      <AnimatePresence>
        {showAuthPanel && (
          <>
            {/* Backdrop blur */}
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            />

            {/* Auth Panel */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center p-4 z-30"
              initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotateY: 90 }}
              transition={{
                duration: 0.8,
                type: "spring",
                stiffness: 100,
                damping: 20,
              }}
            >
              <div className="relative w-full max-w-md">
                {/* Close button */}
                <motion.button
                  onClick={handleCloseAuth}
                  className="absolute -top-4 -right-4 z-40 w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-4 h-4" />
                </motion.button>

                {/* Auth Form */}
                <motion.div
                  className="relative p-8 rounded-2xl bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-2xl border border-white/20 shadow-2xl overflow-hidden mx-4"
                  initial={{ y: 50 }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {/* Animated border */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl"
                    animate={{
                      background: [
                        "linear-gradient(45deg, rgba(6, 182, 212, 0.3), rgba(59, 130, 246, 0.3))",
                        "linear-gradient(45deg, rgba(59, 130, 246, 0.3), rgba(99, 102, 241, 0.3))",
                        "linear-gradient(45deg, rgba(99, 102, 241, 0.3), rgba(6, 182, 212, 0.3))",
                      ],
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                  />

                  <div className="relative z-10">
                    {/* Header */}
                    <motion.div
                      className="text-center mb-8"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <div className="inline-flex items-center gap-3 mb-4">
                        <motion.div
                          className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center"
                          animate={{ rotate: [0, 360] }}
                          transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          <Lock className="w-5 h-5 text-white" />
                        </motion.div>
                        <h3 className="text-3xl font-bold text-white">
                          Welcome Back
                        </h3>
                      </div>
                      <p className="text-cyan-300 font-mono text-sm">
                        Secure access to Communiatec community
                      </p>
                    </motion.div>

                    <div className="space-y-6">
                      {/* Email Input */}
                      <motion.div
                        className="space-y-3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                          <Mail className="w-4 h-4 text-cyan-400" />
                          Email Address
                        </label>
                        <div className="relative group">
                          <Input
                            type="email"
                            placeholder="user@communiatec.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-12 bg-white/10 border-white/20 rounded-xl text-white placeholder-gray-400 focus:bg-white/15 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all duration-300 backdrop-blur-sm text-base pl-4 font-mono"
                          />
                          <motion.div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300" />
                        </div>
                      </motion.div>

                      {/* Password Input */}
                      <motion.div
                        className="space-y-3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                      >
                        <label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                          <Lock className="w-4 h-4 text-cyan-400" />
                          Password
                        </label>
                        <div className="relative group">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter secure password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-14 md:h-12 bg-white/10 border-white/20 rounded-xl text-white placeholder-gray-400 focus:bg-white/15 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all duration-300 backdrop-blur-sm text-base pl-4 pr-12 font-mono touch-manipulation"
                          />
                          <motion.button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </motion.button>
                          <motion.div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300" />
                        </div>
                      </motion.div>

                      {/* Sign In Button */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          onClick={handleLogIn}
                          disabled={loading}
                          className="w-full h-14 md:h-12 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-700 hover:from-cyan-600 hover:via-blue-700 hover:to-indigo-800 text-white rounded-xl font-bold shadow-2xl shadow-cyan-500/25 transition-all duration-300 relative overflow-hidden group touch-manipulation"
                        >
                          {/* Shimmer effect */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                            animate={{
                              translateX: ["-100%", "100%"],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              repeatDelay: 3,
                            }}
                          />

                          {loading ? (
                            <div className="flex items-center justify-center gap-3 relative z-10">
                              <Loader2 className="h-5 w-5 animate-spin" />
                              <span>Authenticating...</span>
                            </div>
                          ) : (
                            <span className="relative z-10 flex items-center justify-center gap-2">
                              <Lock className="w-4 h-4" />
                              Sign In Securely
                            </span>
                          )}
                        </Button>
                      </motion.div>

                      {/* Divider */}
                      <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-white/20" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-4 bg-black/50 text-gray-300 font-semibold backdrop-blur-xl rounded-full border border-white/10">
                            Or use SSO
                          </span>
                        </div>
                      </div>

                      {/* SSO Buttons */}
                      <motion.div
                        className="flex flex-col md:flex-row gap-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                      >
                        <motion.div
                          className="flex-1"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <Button
                            variant="outline"
                            onClick={handleGithubLogin}
                            className="h-12 md:h-10 bg-white/10 hover:bg-white/15 border-white/20 hover:border-white/40 text-gray-300 hover:text-white rounded-xl transition-all duration-300 w-full backdrop-blur-sm font-semibold touch-manipulation"
                          >
                            <FaGithub className="h-5 w-5 md:h-4 md:w-4 mr-2" />
                            GitHub
                          </Button>
                        </motion.div>

                        <motion.div
                          className="flex-1"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <Button
                            variant="outline"
                            onClick={handleLinkedInLogin}
                            className="h-12 md:h-10 bg-white/10 hover:bg-white/15 border-white/20 hover:border-white/40 text-gray-300 hover:text-white rounded-xl transition-all duration-300 w-full backdrop-blur-sm font-semibold touch-manipulation"
                          >
                            <FaLinkedin className="h-5 w-5 md:h-4 md:w-4 mr-2 text-cyan-400" />
                            LinkedIn
                          </Button>
                        </motion.div>
                      </motion.div>
                    </div>

                    {/* Footer */}
                    <motion.div
                      className="mt-6 text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.9 }}
                    >
                      <p className="text-xs text-gray-400 font-mono">
                        Protected by community-grade security
                      </p>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Loading overlay during globe animation */}
      <AnimatePresence>
        {globeAnimating && (
          <motion.div
            className="absolute inset-0 bg-black/80 flex items-center justify-center z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <motion.div
                className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mb-4 mx-auto"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <Lock className="w-8 h-8 text-white" />
              </motion.div>
              <p className="text-white font-mono">
                Initializing secure connection...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Auth;
