'use client';

import { useEffect, useState } from 'react';
import { X, CheckCircle, Heart, ShoppingCart } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
  icon?: 'cart' | 'heart' | 'check';
}

interface ToastProps {
  message: ToastMessage;
  onClose: (id: string) => void;
}

const Toast = ({ message, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(message.id);
    }, 3000);

    return () => clearTimeout(timer);
  }, [message.id, onClose]);
  const getIcon = () => {
    switch (message.icon) {
      case 'cart':
        return <ShoppingCart className="w-4 h-4" />;
      case 'heart':
        return <Heart className="w-4 h-4" />;
      case 'check':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getBgColor = () => {
    switch (message.type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'info':
        return 'bg-blue-500';
      default:
        return 'bg-green-500';
    }
  };
  return (
    <div className={`${getBgColor()} text-white p-3 rounded-lg shadow-lg flex items-center space-x-2 min-w-[250px] max-w-xs animate-slide-in-right`}>
      <div className="flex-shrink-0">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{message.title}</p>
        <p className="text-xs opacity-90 truncate">{message.message}</p>
      </div>
      <button
        onClick={() => onClose(message.id)}
        className="flex-shrink-0 hover:bg-white/20 rounded p-0.5 transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  messages: ToastMessage[];
  onClose: (id: string) => void;
}

export const ToastContainer = ({ messages, onClose }: ToastContainerProps) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-xs">
      {messages.map((message) => (
        <Toast key={message.id} message={message} onClose={onClose} />
      ))}
    </div>
  );
};

// Hook for using toasts
export const useToast = () => {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Date.now().toString();
    setMessages(prev => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  };

  const showSuccess = (title: string, message: string, icon?: 'cart' | 'heart' | 'check') => {
    addToast({ type: 'success', title, message, icon });
  };

  const showError = (title: string, message: string) => {
    addToast({ type: 'error', title, message });
  };

  const showInfo = (title: string, message: string) => {
    addToast({ type: 'info', title, message });
  };

  return {
    messages,
    removeToast,
    showSuccess,
    showError,
    showInfo,
  };
};
