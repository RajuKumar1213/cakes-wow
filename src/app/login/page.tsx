'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Phone, MessageSquare, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

export default function LoginPage() {
  const { login } = useAuth();
  const [step, setStep] = useState(1); // 1: phone, 2: otp
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        data: { phoneNumber },
      });

      if (response.status === 200) {
        setSuccess('OTP sent successfully! Check your phone.');
        setStep(2);
      } else {
        setError(response.data.error || 'Failed to send OTP');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/auth/verify-otp', {
        phoneNumber,
        otp,
      });

      if (response.status === 200) {
        setSuccess('Login successful! Redirecting...');
        // Update auth context with user data
        login(response.data.user);
        // Redirect to dashboard or home page
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        setError(response.data.error || 'Invalid OTP');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToPhone = () => {
    setStep(1);
    setOtp('');
    setError('');
    setSuccess('');
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('/api/auth/send-otp', {
        phoneNumber,
      });

      if (response.status === 200) {
        setSuccess('OTP resent successfully!');
      } else {
        setError(response.data.error || 'Failed to resend OTP');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              {step === 1 ? (
                <Phone className="w-8 h-8 text-orange-600" />
              ) : (
                <MessageSquare className="w-8 h-8 text-orange-600" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {step === 1 ? 'Welcome to Bakingo' : 'Verify Your Phone'}
            </h1>
            <p className="text-gray-600">
              {step === 1 
                ? 'Enter your phone number to get started' 
                : `We've sent a verification code to ${phoneNumber}`
              }
            </p>
          </div>

          {/* Alert Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}

          {/* Step 1: Phone Number */}
          {step === 1 && (
            <form onSubmit={handlePhoneSubmit} className="space-y-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1234567890"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                    required
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Enter your phone number with country code
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !phoneNumber.trim()}
                className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 focus:ring-4 focus:ring-orange-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    Send OTP
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors text-center text-lg font-mono tracking-widest"
                  required
                />
                <p className="mt-2 text-xs text-gray-500">
                  Enter the 6-digit code sent to your phone
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 focus:ring-4 focus:ring-orange-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    Verify & Login
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Resend and Back options */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleBackToPhone}
                  className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  ← Change Phone Number
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors disabled:opacity-50"
                >
                  Resend OTP
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
