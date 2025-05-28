"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { ToastContainer, useToast as useToastHook } from "@/components/Toast";

interface ToastContextType {
  showSuccess: (
    title: string,
    message: string,
    icon?: "cart" | "heart" | "check"
  ) => void;
  showError: (title: string, message: string) => void;
  showInfo: (title: string, message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const { messages, removeToast, showSuccess, showError, showInfo } =
    useToastHook();

  const value: ToastContextType = {
    showSuccess,
    showError,
    showInfo,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer messages={messages} onClose={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
