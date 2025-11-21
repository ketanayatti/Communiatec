import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import apiClient from "@/lib/apiClient";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, Loader2, Shield, CheckCircle2, AlertTriangle } from "lucide-react";

const ResetPassword = ({ user, onPasswordReset }) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const handlePasswordChange = (value) => {
    setNewPassword(value);
    setPasswordStrength(calculatePasswordStrength(value));
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 2) return "bg-red-500";
    if (passwordStrength === 3) return "bg-yellow-500";
    if (passwordStrength === 4) return "bg-blue-500";
    return "bg-green-500";
  };

  const getStrengthText = () => {
    if (passwordStrength <= 2) return "Weak";
    if (passwordStrength === 3) return "Fair";
    if (passwordStrength === 4) return "Good";
    return "Strong";
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (passwordStrength < 3) {
      toast.error("Password is too weak");
      return;
    }

    setLoading(true);
    try {
      await apiClient.post("/api/auth/reset-password", {
        userId: user._id,
        newPassword,
      });
      toast.success("Password reset successfully. Please log in again.");
      navigate("/auth");
      onPasswordReset?.();
    } catch (error) {
      toast.error(error.response?.data?.message || "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const isValidPassword = passwordStrength >= 3 && passwordsMatch;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-gray-900 to-black">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -right-4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
        className="relative w-full max-w-lg"
      >
        {/* Main card */}
        <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden">
          {/* Header with gradient */}
          <div className="relative bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-600/20 p-8 pb-6">
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]"></div>
            <div className="relative flex items-center justify-center mb-4">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
                <Shield className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Reset Password
            </h2>
            <p className="text-center text-gray-400 mt-2 text-sm leading-relaxed">
              Create a new secure password for your account
            </p>
          </div>

          {/* Form content */}
          <div className="p-8 space-y-6">
            {/* New Password Field */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                <Lock className="w-4 h-4 text-blue-400" />
                New Password
              </label>
              <div className="relative group">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your new password"
                  value={newPassword}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:bg-white/10 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 backdrop-blur-sm text-base px-4 pr-12 group-hover:border-white/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-400 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              
              {/* Password strength indicator */}
              {newPassword && (
                <div className="space-y-2 mt-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Password Strength</span>
                    <span className={`font-semibold ${passwordStrength <= 2 ? 'text-red-400' : passwordStrength === 3 ? 'text-yellow-400' : passwordStrength === 4 ? 'text-blue-400' : 'text-green-400'}`}>
                      {getStrengthText()}
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                <Lock className="w-4 h-4 text-blue-400" />
                Confirm Password
              </label>
              <div className="relative group">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:bg-white/10 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 backdrop-blur-sm text-base px-4 pr-12 group-hover:border-white/20"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-400 transition-colors p-1"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              
              {/* Password match indicator */}
              {confirmPassword && (
                <div className="flex items-center gap-2 mt-2">
                  {passwordsMatch ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <span className="text-xs text-green-400">Passwords match</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span className="text-xs text-red-400">Passwords don't match</span>
                    </>
                  )}
                </div>
              )}
            </div>



            {/* Submit Button */}
            <Button
              onClick={handleResetPassword}
              disabled={loading || !isValidPassword}
              className={`w-full h-14 rounded-xl font-semibold text-base transition-all duration-300 ${ 
                loading || !isValidPassword
                  ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-500 hover:via-purple-500 hover:to-cyan-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Updating Password...</span>
                </div>
              ) : (
                'Update Password'
              )}
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            Your password will be encrypted and stored securely
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;