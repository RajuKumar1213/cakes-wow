import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'overlay' | 'inline';
  text?: string;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({ 
  size = 'md', 
  variant = 'default', 
  text = 'Loading...', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const LoadingSVG = () => (
    <svg
      className={`animate-spin ${sizeClasses[size]}`}
      viewBox="0 0 50 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer ring */}
      <circle
        cx="25"
        cy="25"
        r="20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="31.416"
        strokeDashoffset="31.416"
        fill="none"
        opacity="0.3"
      >
        <animate
          attributeName="stroke-dasharray"
          dur="2s"
          values="0 31.416;15.708 15.708;0 31.416"
          repeatCount="indefinite"
        />
        <animate
          attributeName="stroke-dashoffset"
          dur="2s"
          values="0;-15.708;-31.416"
          repeatCount="indefinite"
        />
      </circle>
      
      {/* Inner circle */}
      <circle
        cx="25"
        cy="25"
        r="12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="18.85"
        strokeDashoffset="18.85"
        fill="none"
        opacity="0.6"
      >
        <animate
          attributeName="stroke-dasharray"
          dur="1.5s"
          values="0 18.85;9.425 9.425;0 18.85"
          repeatCount="indefinite"
        />
        <animate
          attributeName="stroke-dashoffset"
          dur="1.5s"
          values="0;-9.425;-18.85"
          repeatCount="indefinite"
        />
      </circle>
      
      {/* Center dot */}
      <circle
        cx="25"
        cy="25"
        r="3"
        fill="currentColor"
        opacity="0.8"
      >
        <animate
          attributeName="opacity"
          dur="1s"
          values="0.8;0.3;0.8"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );

  const CakeLoadingSVG = () => (
    <svg
      className={`${sizeClasses[size]}`}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Cake layers with animation */}
      <g className="animate-bounce">
        {/* Bottom layer */}
        <rect
          x="20"
          y="70"
          width="60"
          height="20"
          rx="4"
          fill="currentColor"
          opacity="0.8"
        >
          <animate
            attributeName="opacity"
            dur="2s"
            values="0.8;0.4;0.8"
            repeatCount="indefinite"
          />
        </rect>
        
        {/* Middle layer */}
        <rect
          x="25"
          y="55"
          width="50"
          height="15"
          rx="4"
          fill="currentColor"
          opacity="0.6"
        >
          <animate
            attributeName="opacity"
            dur="2s"
            values="0.6;0.3;0.6"
            repeatCount="indefinite"
            begin="0.3s"
          />
        </rect>
        
        {/* Top layer */}
        <rect
          x="30"
          y="42"
          width="40"
          height="12"
          rx="4"
          fill="currentColor"
          opacity="0.4"
        >
          <animate
            attributeName="opacity"
            dur="2s"
            values="0.4;0.2;0.4"
            repeatCount="indefinite"
            begin="0.6s"
          />
        </rect>
        
        {/* Candle */}
        <rect
          x="48"
          y="30"
          width="4"
          height="12"
          fill="currentColor"
          opacity="0.7"
        />
        
        {/* Flame */}
        <ellipse
          cx="50"
          cy="28"
          rx="3"
          ry="4"
          fill="currentColor"
          opacity="0.9"
        >
          <animate
            attributeName="opacity"
            dur="0.5s"
            values="0.9;0.5;0.9"
            repeatCount="indefinite"
          />
          <animateTransform
            attributeName="transform"
            type="scale"
            dur="0.5s"
            values="1;1.2;1"
            repeatCount="indefinite"
          />
        </ellipse>
      </g>
    </svg>
  );

  if (variant === 'overlay') {
    return (
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex flex-col items-center space-y-4 shadow-xl">
          <div className="text-pink-600 dark:text-pink-400">
            <CakeLoadingSVG />
          </div>
          {text && (
            <p className={`text-gray-700 dark:text-gray-300 font-medium ${textSizeClasses[size]}`}>
              {text}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="text-pink-600 dark:text-pink-400">
          <LoadingSVG />
        </div>
        {text && (
          <span className={`text-gray-700 dark:text-gray-300 ${textSizeClasses[size]}`}>
            {text}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      <div className="text-pink-600 dark:text-pink-400">
        <CakeLoadingSVG />
      </div>
      {text && (
        <p className={`text-gray-700 dark:text-gray-300 font-medium ${textSizeClasses[size]}`}>
          {text}
        </p>
      )}
    </div>
  );
};

// Additional spinner variant for simple use cases
export const Spinner: React.FC<Pick<LoadingProps, 'size' | 'className'>> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg
        className="animate-spin w-full h-full"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="31.416"
          strokeDashoffset="31.416"
          fill="none"
          opacity="0.3"
        >
          <animate
            attributeName="stroke-dasharray"
            dur="2s"
            values="0 31.416;15.708 15.708;0 31.416"
            repeatCount="indefinite"
          />
          <animate
            attributeName="stroke-dashoffset"
            dur="2s"
            values="0;-15.708;-31.416"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    </div>
  );
};

// Page loading component for full-page loading states
export const PageLoading: React.FC<{ text?: string }> = ({ text = 'Loading page...' }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-6">
          <Loading size="xl" variant="default" text="" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Bakingo
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {text}
        </p>
      </div>
    </div>
  );
};

export default Loading;