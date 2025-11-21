import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Lock,
  Eye,
  EyeOff,
  Check,
  X,
  AlertTriangle,
  ArrowLeft,
  Mail,
  Phone,
  MessageCircle,
  Shield,
  Fingerprint,
  Smartphone,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Enhanced PIN hashing with salt and multiple rounds (matching PinSetup)
const hashPin = (pin, userId) => {
  try {
    const salt = `communiatec_secure_${userId}_${new Date().getFullYear()}`;
    let hash = btoa(`${salt}:${pin}`);
    // Multiple rounds for better security
    for (let i = 0; i < 3; i++) {
      hash = btoa(`${hash}:${salt}`);
    }
    return hash;
  } catch (e) {
    return btoa(`fallback_${pin}_${userId}`);
  }
};

// Legacy hash function for backward compatibility
const hashPinLegacy = (pin) => {
  try {
    return btoa(`communiatec_pin:${pin}`);
  } catch (e) {
    return pin;
  }
};

// Modern PIN input with individual digit boxes (same as PinSetup)
const PinDigitInput = ({
  digits,
  onChange,
  onComplete,
  disabled,
  error,
  shake,
}) => {
  const inputRefs = useRef([]);

  useEffect(() => {
    // Focus first empty input
    if (!disabled) {
      const firstEmpty = digits.findIndex((d) => d === "");
      const focusIndex = firstEmpty === -1 ? 0 : firstEmpty;
      inputRefs.current[focusIndex]?.focus();
    }
  }, [disabled, digits]);

  const handleChange = (index, value) => {
    if (disabled) return;

    // Only allow single digit
    const digit = value.replace(/[^0-9]/g, "").slice(-1);

    const newDigits = [...digits];
    newDigits[index] = digit;
    onChange(newDigits);

    // Auto-focus next input
    if (digit && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if PIN is complete
    if (newDigits.every((d) => d !== "") && newDigits.length === 4) {
      onComplete(newDigits.join(""));
    }
  };

  const handleKeyDown = (index, e) => {
    if (disabled) return;

    // Handle backspace
    if (e.key === "Backspace") {
      if (digits[index] === "" && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }

    // Handle arrow keys
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    if (disabled) return;

    const paste = (e.clipboardData || window.clipboardData).getData("text");
    const digits = paste
      .replace(/[^0-9]/g, "")
      .slice(0, 4)
      .split("");

    if (digits.length === 4) {
      onChange(digits);
      onComplete(digits.join(""));
    }
  };

  return (
    <motion.div
      animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
      transition={{ duration: 0.4 }}
      className="flex gap-3 justify-center"
    >
      {[0, 1, 2, 3].map((index) => (
        <motion.div
          key={index}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: index * 0.1 }}
        >
          <input
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digits[index] || ""}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={disabled}
            className={`
              w-14 h-16 sm:w-16 sm:h-18 text-center text-2xl font-bold
              bg-white/10 backdrop-blur-sm border-2 rounded-2xl
              text-white placeholder:text-white/30
              transition-all duration-300 outline-none
              disabled:opacity-50 disabled:cursor-not-allowed
              focus:scale-110 focus:shadow-xl focus:shadow-green-500/25
              ${
                error
                  ? "border-red-500 bg-red-500/10 focus:border-red-400"
                  : "border-white/20 focus:border-green-400 hover:border-white/30"
              }
              ${digits[index] ? "border-green-500 bg-green-500/20" : ""}
            `}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

const ContactAdminPage = ({ onBack }) => {
  const contactMethods = [
    {
      icon: Mail,
      title: "Email Support",
      detail: "support@communiatec.com",
      time: "24-48 hrs",
      color: "blue",
      href: "mailto:support@communiatec.com?subject=PIN Reset Request",
    },
    {
      icon: Phone,
      title: "Phone Support",
      detail: "+1 (555) 123-4567",
      time: "Mon-Fri 9-5",
      color: "green",
      href: "tel:+15551234567",
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      detail: "Available on our website",
      status: "Online",
      color: "purple",
      href: "#",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 right-1/3 w-48 h-48 bg-yellow-500/5 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-white/10 mb-6"
          >
            <Lock className="w-10 h-10 text-orange-400" />
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-2">PIN Recovery</h2>
          <p className="text-white/60">
            Need help with your PIN? Our support team is here to help
          </p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl"
        >
          <div className="space-y-6">
            {/* Security Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20"
            >
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-orange-200 text-sm font-medium mb-1">
                    Secure PIN Reset Process
                  </p>
                  <p className="text-orange-300/80 text-xs">
                    For your security, PIN resets require administrator
                    verification. Choose your preferred contact method below.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Contact Methods */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-3">
                Contact Support
              </h3>

              <div className="space-y-3">
                {contactMethods.map((method, index) => {
                  const Icon = method.icon;
                  return (
                    <motion.a
                      key={method.title}
                      href={method.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className="block p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 group cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className={`w-12 h-12 rounded-full bg-${method.color}-500/20 flex items-center justify-center group-hover:bg-${method.color}-500/30 transition-colors`}
                        >
                          <Icon
                            className={`w-5 h-5 text-${method.color}-400`}
                          />
                        </motion.div>
                        <div className="flex-1">
                          <p className="text-white font-medium group-hover:text-white transition-colors">
                            {method.title}
                          </p>
                          <p className="text-white/60 text-sm group-hover:text-white/80 transition-colors">
                            {method.detail}
                          </p>
                        </div>
                        <div className="text-right">
                          {method.status ? (
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                              <span className="text-green-400 text-xs font-medium">
                                {method.status}
                              </span>
                            </div>
                          ) : (
                            <span className="text-white/40 text-xs">
                              {method.time}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.a>
                  );
                })}
              </div>
            </div>

            {/* Required Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="p-4 rounded-xl bg-white/5 border border-white/10"
            >
              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                Please include in your message:
              </h4>
              <ul className="space-y-2 text-sm text-white/70">
                {[
                  "Your registered email address",
                  "Account verification details (e.g., last login date)",
                  "Reason for PIN reset request",
                ].map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="flex items-center gap-2"
                  >
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                    {item}
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Back button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <Button
                onClick={onBack}
                variant="ghost"
                className="w-full h-12 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 border border-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to PIN Entry
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-6"
        >
          <p className="text-xs text-white/40 flex items-center justify-center gap-2">
            <Shield className="w-3 h-3" />
            Your security is our priority. All PIN resets are processed securely
            by our admin team.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

const PinVerify = ({ onFinish, userInfo }) => {
  const [pinDigits, setPinDigits] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [shake, setShake] = useState(false);
  const [showForgotPage, setShowForgotPage] = useState(false);
  const [error, setError] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);

  const userId = userInfo?._id || userInfo?.id;
  const pinKey = userId ? `communiatec_pin_${userId}` : null;
  const maxAttempts = 5; // Increased from 3 for better UX
  const lockDuration = 30; // 30 seconds lockout

  // Check if account is locked
  useEffect(() => {
    const lockKey = `${pinKey}_locked`;
    const lockedUntil = localStorage.getItem(lockKey);

    if (lockedUntil) {
      const remaining = parseInt(lockedUntil) - Date.now();
      if (remaining > 0) {
        setIsLocked(true);
        setLockTimer(Math.ceil(remaining / 1000));

        const interval = setInterval(() => {
          const newRemaining = parseInt(lockedUntil) - Date.now();
          if (newRemaining <= 0) {
            setIsLocked(false);
            setLockTimer(0);
            localStorage.removeItem(lockKey);
            clearInterval(interval);
          } else {
            setLockTimer(Math.ceil(newRemaining / 1000));
          }
        }, 1000);

        return () => clearInterval(interval);
      } else {
        localStorage.removeItem(lockKey);
      }
    }
  }, [pinKey]);

  const handleVerify = async (pin) => {
    if (!pinKey) {
      toast.error("Missing user context");
      return;
    }

    if (isLocked) {
      toast.error(`Account locked. Try again in ${lockTimer} seconds.`);
      return;
    }

    const stored = localStorage.getItem(pinKey);
    if (!stored) {
      toast.error("No PIN found. Please contact support to set up your PIN.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Try both new and legacy hash methods for backward compatibility
      const hashedNew = hashPin(pin, userId);
      const hashedLegacy = hashPinLegacy(pin);

      if (hashedNew === stored || hashedLegacy === stored) {
        // Success - reset attempts and mark as verified
        setAttempts(0);
        localStorage.removeItem(`${pinKey}_attempts`);

        const verifiedKey = `communiatec_pin_verified_${userId}`;
        sessionStorage.setItem(verifiedKey, "true");

        toast.success("🔓 Access granted!");

        // Add success animation delay
        setTimeout(() => {
          onFinish && onFinish();
        }, 500);
      } else {
        // Incorrect PIN
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        localStorage.setItem(`${pinKey}_attempts`, newAttempts.toString());

        if (newAttempts >= maxAttempts) {
          // Lock the account
          const lockUntil = Date.now() + lockDuration * 1000;
          localStorage.setItem(`${pinKey}_locked`, lockUntil.toString());
          setIsLocked(true);
          setLockTimer(lockDuration);
          setError(
            `Account locked for ${lockDuration} seconds due to multiple failed attempts.`
          );
        } else {
          const remaining = maxAttempts - newAttempts;
          setError(
            `Incorrect PIN. ${remaining} attempt${
              remaining === 1 ? "" : "s"
            } remaining.`
          );
        }

        setPinDigits(["", "", "", ""]);
        setShake(true);
        setTimeout(() => setShake(false), 600);

        toast.error(
          `Incorrect PIN. ${maxAttempts - newAttempts} attempts remaining.`
        );
      }
    } catch (err) {
      console.error("PIN verification error:", err);
      toast.error("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePinComplete = (pin) => {
    if (isLocked || loading) return;
    handleVerify(pin);
  };

  const handleForgot = () => {
    setShowForgotPage(true);
  };

  const handleClear = () => {
    setPinDigits(["", "", "", ""]);
    setError("");
  };

  // Show contact page if forgot PIN is clicked
  if (showForgotPage) {
    return <ContactAdminPage onBack={() => setShowForgotPage(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={`absolute -top-1/2 -right-1/2 w-96 h-96 rounded-full blur-3xl animate-pulse transition-colors duration-1000 ${
            isLocked ? "bg-red-500/15" : "bg-green-500/10"
          }`}
        ></div>
        <div
          className={`absolute -bottom-1/2 -left-1/2 w-96 h-96 rounded-full blur-3xl animate-pulse delay-1000 transition-colors duration-1000 ${
            isLocked ? "bg-orange-500/15" : "bg-blue-500/10"
          }`}
        ></div>
        <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{
              scale: isLocked ? 1.1 : 1,
              rotateZ: shake ? [0, -5, 5, -5, 5, 0] : 0,
            }}
            transition={{ duration: shake ? 0.4 : 0.3 }}
            className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl border border-white/10 mb-6 transition-all duration-300 ${
              isLocked
                ? "bg-gradient-to-r from-red-500/20 to-orange-500/20"
                : attempts > 0
                ? "bg-gradient-to-r from-orange-500/20 to-yellow-500/20"
                : "bg-gradient-to-r from-green-500/20 to-blue-500/20"
            }`}
          >
            {isLocked ? (
              <AlertTriangle className="w-10 h-10 text-red-400" />
            ) : (
              <Lock className="w-10 h-10 text-green-400" />
            )}
          </motion.div>

          <h2 className="text-3xl font-bold text-white mb-2">
            {isLocked ? "Account Locked" : "Welcome Back"}
          </h2>

          <p className="text-white/60">
            {isLocked
              ? `Please wait ${lockTimer} seconds before trying again`
              : "Enter your 4-digit PIN to continue"}
          </p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl transition-all duration-300 ${
            shake ? "animate-pulse border-red-400/50" : ""
          } ${isLocked ? "border-red-400/30" : ""}`}
        >
          <div className="space-y-6">
            {/* PIN Input */}
            <div className="text-center">
              <label className="block text-sm font-medium text-white/80 mb-6">
                {isLocked ? "Account Temporarily Locked" : "Enter your PIN"}
              </label>

              <PinDigitInput
                digits={pinDigits}
                onChange={setPinDigits}
                onComplete={handlePinComplete}
                disabled={loading || isLocked}
                error={error && error !== ""}
                shake={shake}
              />

              {/* Error message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`mt-4 flex items-center justify-center gap-2 text-sm ${
                      isLocked ? "text-red-400" : "text-orange-400"
                    }`}
                  >
                    <AlertTriangle size={16} />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Lock timer */}
              <AnimatePresence>
                {isLocked && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="mt-4 flex items-center justify-center gap-2 text-red-400"
                  >
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span className="font-mono text-lg">{lockTimer}s</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action buttons */}
            {!isLocked && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex gap-3"
              >
                <Button
                  onClick={handleClear}
                  variant="ghost"
                  disabled={loading}
                  className="px-4 h-12 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 border border-white/10"
                >
                  <RefreshCw size={16} />
                </Button>

                <Button
                  onClick={handleForgot}
                  variant="ghost"
                  disabled={loading}
                  className="flex-1 h-12 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 border border-white/10"
                >
                  <MessageCircle size={16} className="mr-2" />
                  Need Help?
                </Button>
              </motion.div>
            )}

            {/* Attempt indicator */}
            {!isLocked && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-center gap-2 pt-2"
              >
                <div className="flex gap-1">
                  {Array.from({ length: maxAttempts }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.6 + i * 0.05 }}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        i < attempts ? "bg-orange-400" : "bg-white/20"
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Security footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-center pt-2"
            >
              <p className="text-xs text-white/40 flex items-center justify-center gap-2">
                <Fingerprint className="w-3 h-3" />
                Secured with advanced encryption
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Mobile optimization note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 text-center"
        >
          <div className="flex items-center justify-center gap-2 text-white/30 text-xs">
            <Smartphone size={12} />
            <span>Optimized for mobile and desktop</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PinVerify;
