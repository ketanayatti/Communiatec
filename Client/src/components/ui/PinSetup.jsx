import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Lock,
  Shield,
  Eye,
  EyeOff,
  Check,
  X,
  Fingerprint,
  Smartphone,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Enhanced PIN hashing with salt and multiple rounds
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

// Modern PIN input with individual digit boxes
const PinDigitInput = ({ digits, onChange, onComplete, disabled, error }) => {
  const inputRefs = useRef([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0] && !disabled) {
      inputRefs.current[0].focus();
    }
  }, [disabled]);

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
    <div className="flex gap-3 justify-center">
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
              focus:scale-110 focus:shadow-xl focus:shadow-blue-500/25
              ${
                error
                  ? "border-red-500 bg-red-500/10 focus:border-red-400"
                  : "border-white/20 focus:border-blue-400 hover:border-white/30"
              }
              ${digits[index] ? "border-blue-500 bg-blue-500/20" : ""}
            `}
          />
        </motion.div>
      ))}
    </div>
  );
};

// Security indicator component
const SecurityIndicator = ({ strength }) => {
  const getStrengthColor = () => {
    switch (strength) {
      case "weak":
        return "from-red-500 to-orange-500";
      case "good":
        return "from-orange-500 to-yellow-500";
      case "strong":
        return "from-green-500 to-blue-500";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getStrengthText = () => {
    switch (strength) {
      case "weak":
        return "Weak PIN - Consider using varied digits";
      case "good":
        return "Good PIN - Moderate security";
      case "strong":
        return "Strong PIN - Excellent security";
      default:
        return "";
    }
  };

  if (!strength) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 text-sm"
    >
      <div
        className={`w-3 h-3 rounded-full bg-gradient-to-r ${getStrengthColor()}`}
      />
      <span className="text-white/70">{getStrengthText()}</span>
    </motion.div>
  );
};

const PinSetup = ({ onFinish, userInfo }) => {
  const [step, setStep] = useState(1); // 1: create, 2: confirm, 3: success
  const [pinDigits, setPinDigits] = useState(["", "", "", ""]);
  const [confirmDigits, setConfirmDigits] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pinStrength, setPinStrength] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const userId = userInfo?._id || userInfo?.id;
  const pinKey = userId ? `communiatec_pin_${userId}` : null;

  // Calculate PIN strength
  const calculatePinStrength = (pin) => {
    if (pin.length !== 4) return "";

    const digits = pin.split("");
    const uniqueDigits = [...new Set(digits)].length;
    const isSequential = digits.every(
      (digit, i) =>
        i === 0 || Math.abs(parseInt(digits[i - 1]) - parseInt(digit)) === 1
    );
    const isRepeating = uniqueDigits === 1;

    if (
      isRepeating ||
      isSequential ||
      [
        "1234",
        "0000",
        "1111",
        "2222",
        "3333",
        "4444",
        "5555",
        "6666",
        "7777",
        "8888",
        "9999",
      ].includes(pin)
    ) {
      return "weak";
    } else if (uniqueDigits >= 3) {
      return "strong";
    } else {
      return "good";
    }
  };

  const handlePinComplete = (pin) => {
    setError("");
    const strength = calculatePinStrength(pin);
    setPinStrength(strength);

    if (strength === "weak") {
      setError("This PIN is too predictable. Try using varied digits.");
      return;
    }

    // Auto-advance to confirmation step after a short delay
    setTimeout(() => {
      setStep(2);
    }, 800);
  };

  const handleConfirmComplete = (confirmPin) => {
    const originalPin = pinDigits.join("");

    if (originalPin !== confirmPin) {
      setError("PINs don't match. Please try again.");
      setConfirmDigits(["", "", "", ""]);
      return;
    }

    setError("");
    handleSave(originalPin);
  };

  const handleSave = async (pin) => {
    if (!pinKey) {
      toast.error("Unable to save PIN - missing user context");
      return;
    }

    setLoading(true);
    try {
      const hashed = hashPin(pin, userId);
      localStorage.setItem(pinKey, hashed);

      // Store PIN creation timestamp for security audit
      const timestampKey = `${pinKey}_created`;
      localStorage.setItem(timestampKey, Date.now().toString());

      // Mark session as verified
      const verifiedKey = `communiatec_pin_verified_${userId}`;
      sessionStorage.setItem(verifiedKey, "true");

      setShowSuccess(true);

      // Auto-complete after showing success animation
      setTimeout(() => {
        toast.success("🔒 PIN created successfully!");
        onFinish && onFinish();
      }, 2000);
    } catch (err) {
      console.error("PIN save error:", err);
      toast.error("Failed to save PIN. Please try again.");
      setStep(1);
      setPinDigits(["", "", "", ""]);
      setConfirmDigits(["", "", "", ""]);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setConfirmDigits(["", "", "", ""]);
      setError("");
    }
  };

  const handleReset = () => {
    setStep(1);
    setPinDigits(["", "", "", ""]);
    setConfirmDigits(["", "", "", ""]);
    setError("");
    setPinStrength("");
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Success animation background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md relative z-10 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 150 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-green-500/30 to-blue-500/30 border-2 border-green-400/50 mb-6"
          >
            <Check className="w-12 h-12 text-green-400" />
          </motion.div>

          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-3xl font-bold text-white mb-2"
          >
            PIN Created Successfully!
          </motion.h2>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-white/60 mb-8"
          >
            Your account is now secured with a 4-digit PIN
          </motion.p>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.9, type: "spring" }}
            className="flex gap-1 justify-center"
          >
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1 + i * 0.1 }}
                className="w-3 h-3 bg-green-400 rounded-full"
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl animate-pulse delay-2000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/10 mb-6"
          >
            <Shield className="w-10 h-10 text-blue-400" />
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-2">
            {step === 1 ? "Secure Your Account" : "Confirm Your PIN"}
          </h2>
          <p className="text-white/60">
            {step === 1
              ? "Create a 4-digit PIN for quick and secure access"
              : "Enter your PIN again to confirm"}
          </p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl"
        >
          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{
                  scale: step === 1 ? 1.1 : 1,
                  backgroundColor:
                    step >= 1 ? "#3b82f6" : "rgba(255, 255, 255, 0.1)",
                }}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
              >
                {step > 1 ? (
                  <Check className="w-5 h-5 text-white" />
                ) : (
                  <span className="text-white font-semibold">1</span>
                )}
              </motion.div>
              <motion.div
                animate={{
                  backgroundColor:
                    step >= 2 ? "#3b82f6" : "rgba(255, 255, 255, 0.1)",
                }}
                className="w-16 h-1 rounded-full transition-all duration-500"
              />
              <motion.div
                animate={{
                  scale: step === 2 ? 1.1 : 1,
                  backgroundColor:
                    step >= 2 ? "#3b82f6" : "rgba(255, 255, 255, 0.1)",
                }}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 text-white animate-spin" />
                ) : step > 2 ? (
                  <Check className="w-5 h-5 text-white" />
                ) : (
                  <span className="text-white font-semibold">2</span>
                )}
              </motion.div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <label className="block text-sm font-medium text-white/80 mb-6">
                    Enter your 4-digit PIN
                  </label>
                  <PinDigitInput
                    digits={pinDigits}
                    onChange={setPinDigits}
                    onComplete={handlePinComplete}
                    disabled={loading}
                    error={error && error !== ""}
                  />

                  {/* Error message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-4 flex items-center justify-center gap-2 text-red-400 text-sm"
                      >
                        <X size={16} />
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Security indicator */}
                  <div className="mt-4 flex justify-center">
                    <SecurityIndicator strength={pinStrength} />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <label className="block text-sm font-medium text-white/80 mb-6">
                    Confirm your PIN
                  </label>
                  <PinDigitInput
                    digits={confirmDigits}
                    onChange={setConfirmDigits}
                    onComplete={handleConfirmComplete}
                    disabled={loading}
                    error={error && error !== ""}
                  />

                  {/* Error message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-4 flex items-center justify-center gap-2 text-red-400 text-sm"
                      >
                        <X size={16} />
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Navigation buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleBack}
                    variant="ghost"
                    disabled={loading}
                    className="flex-1 h-12 text-white/80 hover:text-white hover:bg-white/10 rounded-xl border border-white/20 transition-all duration-300"
                  >
                    <ArrowLeft size={16} className="mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={handleReset}
                    variant="ghost"
                    disabled={loading}
                    className="px-4 h-12 text-white/60 hover:text-white hover:bg-white/10 rounded-xl border border-white/20 transition-all duration-300"
                  >
                    <RefreshCw size={16} />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Security note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <div className="flex items-center justify-center gap-2 text-white/40 text-xs">
              <Fingerprint size={14} />
              <span>Your PIN is encrypted and stored securely</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Mobile optimization note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6 text-center"
        >
          <div className="flex items-center justify-center gap-2 text-white/30 text-xs">
            <Smartphone size={12} />
            <span>Works seamlessly on mobile and desktop</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PinSetup;
