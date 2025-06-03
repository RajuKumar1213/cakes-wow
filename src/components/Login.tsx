import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Cross,
  Heart,
  MessageSquare,
  Phone,
  Sparkles,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface LoginProps {
  setShowLogin: (show: boolean) => void;
}

export default function Login({ setShowLogin }: LoginProps) {
  const { login } = useAuth();
  const [step, setStep] = useState(1); // 1: phone, 2: otp
  const [phoneNumber, setPhoneNumber] = useState("+91 ");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Ensure +91 prefix is always present
    if (value.startsWith("+91 ")) {
      setPhoneNumber(value);
    } else if (value.length < 4) {
      setPhoneNumber("+91 ");
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        data: { phoneNumber },
      });

      if (response.status === 200) {
        setSuccess("OTP sent successfully! Check your phone.");
        setStep(2);
      } else {
        setError(response.data.error || "Failed to send OTP");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("/api/auth/verify-otp", {
        phoneNumber,
        otp,
      });

      if (response.status === 200) {
        setSuccess("Login successful! Redirecting...");
        // Update auth context with user data
        login(response.data.user);
        // Redirect to dashboard or home page
        router.push("/");
      } else {
        setError(response.data.error || "Invalid OTP");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToPhone = () => {
    setStep(1);
    setOtp("");
    setError("");
    setSuccess("");
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post("/api/auth/send-otp", {
        phoneNumber,
      });

      if (response.status === 200) {
        setSuccess("OTP resent successfully!");
      } else {
        setError(response.data.error || "Failed to resend OTP");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-sm">
        {/* Main Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header with Gradient */}
          <div className="bg-gradient-to-r from-orange-500 via-pink-500 to-orange-600 p-5 text-center relative">
            {" "}
            <button
              onClick={() => setShowLogin(false)}
              className="absolute cursor-pointer top-3 right-3 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
            <div className="relative z-10">
              <h1 className="text-xl font-bold text-white mb-1">
                {step === 1 ? "Welcome! 🍰" : "Verify Phone 📱"}
              </h1>
              <p className="text-white/90 text-sm">
                {step === 1
                  ? "Enter your phone to continue"
                  : `Code sent to ${phoneNumber}`}
              </p>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-5">
            {" "}
            {/* Alert Messages */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                <p className="text-green-700 text-sm">{success}</p>
              </div>
            )}{" "}
            {/* Step 1: Phone Number */}
            {step === 1 && (
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div className="group">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-orange-500" />
                      Phone Number *
                    </div>
                  </label>
                  <div className="relative">
                    <input
                      id="phone"
                      type="tel"
                      value={phoneNumber}
                      onChange={handlePhoneChange}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-400 bg-white outline-none transition-all duration-300 hover:border-orange-300 font-medium"
                      required
                    />
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                  <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-yellow-500" />
                    We'll send you a verification code
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || phoneNumber.length < 8}
                  className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-orange-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>Send OTP</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}{" "}
            {/* Step 2: OTP Verification */}
            {step === 2 && (
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div className="group">
                  <label
                    htmlFor="otp"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-orange-500" />
                      Verification Code *
                    </div>
                  </label>
                  <div className="relative">
                    <input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="• • • • • •"
                      maxLength={6}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-400 bg-white outline-none transition-all duration-300 hover:border-orange-300 text-center text-lg font-mono tracking-widest"
                      required
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500 text-center">
                    Enter the 6-digit code
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify & Login</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Resend and Back options */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleBackToPhone}
                    className="text-xs text-gray-600 hover:text-orange-600 transition-colors"
                  >
                    ← Change Phone
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-xs text-orange-600 hover:text-orange-700 font-medium transition-colors disabled:opacity-50"
                  >
                    Resend OTP
                  </button>
                </div>
              </form>
            )}{" "}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              🍰 By continuing, you agree to our{" "}
              <span className="text-orange-600 hover:underline cursor-pointer">
                Terms
              </span>{" "}
              and{" "}
              <span className="text-orange-600 hover:underline cursor-pointer">
                Privacy Policy
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
