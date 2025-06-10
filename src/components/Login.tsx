import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  MessageSquare,
  Phone,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface LoginProps {
  setShowLogin: (show: boolean) => void;
  isVisible?: boolean;
}

export default function Login({ setShowLogin, isVisible = true }: LoginProps) {
  const { login } = useAuth();
  const [step, setStep] = useState(1); // 1: phone, 2: otp
  const [phoneNumber, setPhoneNumber] = useState("+91 ");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  // Prevent background scroll when modal is visible
  useEffect(() => {
    if (isVisible) {
      // Store original overflow style
      const originalStyle = window.getComputedStyle(document.body).overflow;
      // Prevent scrolling
      document.body.style.overflow = 'hidden';

      // Cleanup function to restore scroll
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isVisible]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.startsWith("+91 ")) {
      setPhoneNumber(value);
    } else if (value.length < 4) {
      setPhoneNumber("+91 ");
    }
  };

  const handlePhoneSubmit = async () => {
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
      });      if (response.status === 200) {
        setSuccess("OTP sent to your WhatsApp!");
        setStep(2);
      } else {
        setError(response.data.error || "Failed to send OTP");
      }
    } catch (error) {
      setError("Network error. Please try again." + " " + (error instanceof Error ? error.message : ""));
    } finally {
      setLoading(false);
    }
  };
  const handleOtpSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("/api/auth/verify-otp", {
        phoneNumber,
        otp,
      });

      if (response.status === 200) {
        setSuccess("Login successful!");
        login(response.data.user);

        // Close modal first, then redirect
        setShowLogin(false);

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
      });      if (response.status === 200) {
        setSuccess("OTP resent to your WhatsApp!");
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
    <div className={`fixed inset-0 z-50 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
      {/* Modal Backdrop - only visible on larger screens */}
      <div className="hidden md:block absolute inset-0 bg-black/60" onClick={() => setShowLogin(false)}></div>
      {/* Modal Content */}
      <div className={`w-full h-full md:absolute md:top-1/2 md:left-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2 md:w-[26rem] md:h-auto md:max-h-[85vh] bg-white md:bg-transparent md:rounded-lg md:overflow-visible flex flex-col ${isVisible ? 'translate-y-0' : 'translate-y-full md:translate-y-0'}`}>

        {/* Decorative Background - only on mobile */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none md:hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-gradient-to-br from-orange-200/40 via-pink-200/30 to-purple-200/40 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-gradient-to-br from-green-200/40 via-blue-200/30 to-indigo-200/40 rounded-full blur-3xl opacity-50"></div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => setShowLogin(false)}
          className="absolute top-3 right-3 md:top-2 md:right-2 p-2 rounded-full bg-white shadow-md hover:shadow-lg border hover:bg-gray-50 z-10"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>        {/* Content */}
        <div className="flex-1 flex flex-col px-6 py-8 md:px-6 md:py-5 relative md:bg-white md:shadow-lg md:rounded-lg md:min-h-[30rem]">          {/* Header - Top section */}
          <div className="text-center pt-8 md:pt-3 pb-8 md:pb-4">
            <div className="w-20 h-20 md:hidden mx-auto bg-gradient-to-br from-orange-400 via-pink-500 to-purple-500 rounded-full flex items-center justify-center shadow-xl mb-4 border-4 border-white/20">
              <span className="text-3xl">🍰</span>
            </div>
            <h1 className="text-3xl md:text-lg font-bold text-gray-900 mb-3 md:mb-1 tracking-tight">
              {step === 1 ? "Welcome Back!" : "Verify Phone"}
            </h1>            <p className="text-gray-600 text-lg md:text-xs font-medium">
              {step === 1
                ? "Enter your phone to continue"
                : `WhatsApp code sent to ${phoneNumber}`}
            </p>
          </div>{/* Alert Messages */}
          {error && (
            <div className="mb-6 md:mb-4 p-4 md:p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 shadow-sm">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-6 md:mb-4 p-4 md:p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 shadow-sm">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
              <p className="text-green-700 text-sm font-medium">{success}</p>
            </div>
          )}
          {/* Main Input Section - Centered in top portion */}
          <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
            {/* Step 1: Phone Number Input */}
            {step === 1 && (
              <div className="space-y-6 md:space-y-4">
                <div className="text-center">
                  <label htmlFor="phone" className="text-gray-700 text-base md:text-sm font-semibold mb-4 md:mb-3 flex items-center justify-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-orange-100 to-pink-100 rounded-lg">
                      <Phone className="w-5 h-5 text-orange-600" />
                    </div>
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    placeholder="+91 98765 43210"
                    className="w-full px-6 py-4 md:px-4 md:py-3 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-lg md:text-base  font-medium focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 shadow-sm hover:shadow-md transition-all duration-300"
                    required
                  />                  <p className="mt-3 md:mt-2 text-gray-500 text-sm text-center font-medium">
                    💬 We'll send you a verification code on WhatsApp
                  </p>
                </div>
              </div>
            )}
            {/* Step 2: OTP Input */}
            {step === 2 && (
              <div className="space-y-6 md:space-y-4">
                <div className="text-center">
                  <label htmlFor="otp" className="text-gray-700 text-base md:text-sm font-semibold mb-4 md:mb-3 flex items-center justify-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg">
                      <MessageSquare className="w-5 h-5 text-green-600" />
                    </div>
                    Verification Code
                  </label>
                  <input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="• • • • • •"
                    maxLength={6}
                    className="w-full px-6 py-4 md:px-4 md:py-3 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-2xl md:text-lg text-center font-mono tracking-[0.3em] focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 shadow-sm hover:shadow-md transition-all duration-300"
                    required
                  />                  <p className="mt-3 md:mt-2 text-gray-500 text-sm text-center font-medium">
                    💬 Check your WhatsApp for the 6-digit code
                  </p>
                </div>

                {/* Back and Resend options */}
                <div className="flex items-center justify-between pt-2 md:pt-3">
                  <button
                    type="button"
                    onClick={handleBackToPhone}
                    className="text-gray-600 hover:text-gray-900 flex items-center gap-2 text-sm font-medium hover:bg-gray-100 px-3 py-2 rounded-lg transition-all duration-200"
                  >
                    ← Change Phone
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-orange-600 hover:text-orange-700 font-semibold text-sm disabled:opacity-50 hover:bg-orange-50 px-3 py-2 rounded-lg transition-all duration-200"
                  >
                    Resend OTP
                  </button>
                </div>
              </div>
            )}
          </div>
          {/* Button Section - Bottom */}
          <div className="pt-8 md:pt-4 pb-4 md:pb-2">
            <div className="max-w-sm mx-auto w-full">
              {step === 1 ? (
                <button
                  onClick={handlePhoneSubmit}
                  disabled={loading || phoneNumber.length < 8}
                  className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white py-4 md:py-3 px-6 rounded-xl text-lg md:text-base font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>Send OTP</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleOtpSubmit}
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white py-4 md:py-3 px-6 rounded-xl text-lg md:text-base font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify & Login</span>
                      <CheckCircle2 className="w-5 h-5" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>          {/* Footer */}
          <div className="text-center pb-2">
            <p className="text-gray-500 text-xs font-medium">
              🍰 By continuing, you agree to our{" "}
              <span className="text-gray-700 hover:text-orange-600 cursor-pointer font-semibold transition-colors duration-200">Terms</span>{" "}
              and{" "}
              <span className="text-gray-700 hover:text-orange-600 cursor-pointer font-semibold transition-colors duration-200">Privacy Policy</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


