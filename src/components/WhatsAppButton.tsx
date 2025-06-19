"use client";

import React, { useState } from 'react';
import { Phone, MessageCircle, X } from 'lucide-react';
import Image from 'next/image';

interface WhatsAppButtonProps {
  phoneNumber?: string;
  message?: string;
  className?: string;
  showIcon?: 'phone' | 'message';
  variant?: 'floating' | 'inline' | 'compact';
  showTooltip?: boolean;
}

const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  phoneNumber = "918019288448", // Default phone number
  message = "Hi! I'm interested in your cakes. Can you help me with my order?",
  className = "",
  showIcon = 'phone',
  variant = 'floating',
  showTooltip = true
}) => {
  const [showTooltipState, setShowTooltipState] = useState(false);

  const handleWhatsAppClick = () => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const IconComponent = showIcon === 'phone' ? Phone : MessageCircle;
  // Floating variant (default)
  if (variant === 'floating') {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        {showTooltip && showTooltipState && (
          <div className="absolute bottom-16 right-0 mb-2 bg-gray-900 text-white px-3 py-2  rounded-lg text-sm whitespace-nowrap shadow-lg ">
            Need help? Chat with us!
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
          </div>
        )}
          <button
          onClick={handleWhatsAppClick}
          onMouseEnter={() => setShowTooltipState(true)}
          onMouseLeave={() => setShowTooltipState(false)}
          className={`flex items-center gap-3 justify-center text-black border-2 bg-white border-green-500  py-2 rounded-full shadow-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300 px-4 ${className}`}
          title="Chat with us on WhatsApp"
          aria-label="Chat with us on WhatsApp"
        >
          {/* <MessageCircle className="h-6 w-6" /> */}
          <Image
            src="/whatsapp.svg"
            alt="WhatsApp Icon"
            width={28}
            height={28}
          />
          <span className="font-semibold text-sm">Chat with us</span>
        </button>
      </div>  
    );
  }
  // Inline variant
  if (variant === 'inline') {
    return (
      <button
        onClick={handleWhatsAppClick}
        className={`flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl min-w-[200px] justify-center ${className}`}
        title="Chat with us on WhatsApp"
        aria-label="Chat with us on WhatsApp"
      >
        <MessageCircle className="h-6 w-6" />
        <span>Chat with us</span>
      </button>
    );
  }
  // Compact variant
  if (variant === 'compact') {
    return (
      <button
        onClick={handleWhatsAppClick}
        className={`flex items-center justify-center w-12 h-12 bg-green-500 hover:bg-green-600 text-white rounded-full transition-all duration-300 hover:scale-110 shadow-md ${className}`}
        title="Chat with us on WhatsApp"
        aria-label="Chat with us on WhatsApp"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  return null;
};

export default WhatsAppButton;
