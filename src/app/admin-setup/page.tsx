'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Loader2, CheckCircle, AlertCircle, User, Lock, Mail } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import axios from 'axios';

interface AdminInfo {
  email: string;
  createdAt: string;
}

export default function AdminSetup() {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [adminExists, setAdminExists] = useState(false);
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});

  // Check if admin already exists
  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const response = await axios.get('/api/auth/setup-admin');
      setAdminExists(response.data.adminExists);
      setAdminInfo(response.data.admin);
    } catch (error) {
      console.error('Error checking admin status:', error);
    } finally {
      setCheckingAdmin(false);
    }
  };

  const validateForm = () => {
    const newErrors: { email?: string; password?: string; confirmPassword?: string } = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const response = await axios.post('/api/auth/setup-admin', {
        email: formData.email,
        password: formData.password
      });

      if (response.status === 200) {
        showSuccess('Success', 'Admin account created successfully!');
        setAdminExists(true);
        setAdminInfo({
          email: formData.email,
          createdAt: new Date().toISOString()
        });
        setFormData({ email: '', password: '', confirmPassword: '' });
      } else {
        showError('Error', response.data.error || 'Failed to create admin account');
      }
    } catch (error) {
      console.error('Setup error:', error);
      showError('Error', 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 flex items-center gap-4">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Checking admin status...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Setup
              </h1>
              <p className="text-gray-600 text-sm">
                {adminExists ? 'Admin account already configured' : 'Create the admin account for your Bakingo store'}
              </p>
            </div>
          </div>

          {adminExists ? (
            // Admin exists - show info
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-green-800">Admin Account Active</h3>
                    <p className="text-sm text-green-700">
                      Admin account is already configured and ready to use.
                    </p>
                  </div>
                </div>
              </div>

              {adminInfo && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <h4 className="font-medium text-gray-900">Account Details:</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Email:</strong> {adminInfo.email}</p>
                    <p><strong>Created:</strong> {new Date(adminInfo.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <a
                  href="/admin-login"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium text-center hover:bg-blue-700 transition-colors"
                >
                  Go to Login
                </a>
              </div>
            </div>
          ) : (
            // Admin doesn't exist - show setup form
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg transition-colors ${
                      errors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    placeholder="admin@bakingo.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg transition-colors ${
                      errors.password ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    placeholder="Enter admin password"
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg transition-colors ${
                      errors.confirmPassword ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    placeholder="Confirm admin password"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-700 
                  focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating Admin...
                  </>
                ) : (
                  'Create Admin Account'
                )}
              </button>
            </form>
          )}

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Security Note:</p>
                <p>Only one admin account can exist in the system. This ensures security and prevents unauthorized access.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
