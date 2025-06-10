'use client';

import React from 'react';
import { CheckoutProvider } from '@/contexts/CheckoutContext';
import { useCheckout } from '@/contexts/CheckoutContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import CartReviewStepContent from '@/components/checkout/CartReviewStepContent';
import DeliveryDetailsStepContent from '@/components/checkout/DeliveryDetailsStepContent';
import { checkoutSteps } from '@/constants/checkout';
import { PaymentStep } from './PaymentStep';

// Progress indicator component
const StepProgress: React.FC = () => {
    const { state } = useCheckout();
    const { currentStep } = state;

    return (
    <div className="mb-6 md:mb-12">
        {/* Mobile view - simplified */}
        <div className="block md:hidden">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500">
                    Step {currentStep} of {checkoutSteps.length}
                </span>
                <div className="flex space-x-1">
                    {checkoutSteps.map((_, index) => (
                        <div
                            key={index}
                            className={`h-1.5 w-6 rounded-full ${index + 1 <= currentStep ? 'bg-pink-500' : 'bg-gray-200'
                                }`}
                        />
                    ))}
                </div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                <div className="flex items-center space-x-2">
                    <div className="flex-shrink-0">
                        {React.createElement(checkoutSteps[currentStep - 1]?.icon || 'div', {
                            className: 'w-4 h-4 text-pink-500'
                        })}
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900">
                            {checkoutSteps[currentStep - 1]?.title}
                        </h3>
                        <p className="text-xs text-gray-500">
                            {checkoutSteps[currentStep - 1]?.description}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        {/* Desktop view - enhanced */}
        <div className="hidden md:block">
            <div className="relative">
                {/* Background progress line */}
                <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 rounded-full" />

                {/* Active progress line */}
                <div
                    className="absolute top-6 left-0 h-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
                    style={{
                        width: `${((currentStep - 1) / (checkoutSteps.length - 1)) * 100}%`
                    }}
                />

                {/* Steps */}
                <div className="relative flex justify-between">
                    {checkoutSteps.map((step, index) => {
                        const stepNumber = index + 1;
                        const isActive = currentStep === stepNumber;
                        const isCompleted = currentStep > stepNumber;
                        const Icon = step.icon;

                        return (
                            <div key={step.id} className="flex flex-col items-center group">
                                {/* Step circle with icon */}
                                <div
                                    className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-200 scale-110'
                                        : isActive
                                            ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-200 scale-110'
                                            : 'bg-white text-gray-400 border-2 border-gray-200 hover:border-pink-300 hover:text-pink-400'
                                        }`}
                                >
                                    {isCompleted ? (
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <Icon className="w-5 h-5" />
                                    )}
                                </div>

                                {/* Step info */}
                                <div className="mt-4 text-center max-w-[120px]">
                                    <h3
                                        className={`text-sm font-semibold transition-colors duration-300 ${isActive
                                            ? 'text-pink-600'
                                            : isCompleted
                                                ? 'text-green-600'
                                                : 'text-gray-600 group-hover:text-pink-500'
                                            }`}
                                    >
                                        {step.title}
                                    </h3>
                                    <p
                                        className={`text-xs mt-1 transition-colors duration-300 ${isActive
                                            ? 'text-pink-500'
                                            : isCompleted
                                                ? 'text-green-500'
                                                : 'text-gray-400'
                                            }`}
                                    >
                                        {step.description}
                                    </p>
                                </div>

                                {/* Active step indicator */}
                                {isActive && (
                                    <div className="absolute -bottom-2 w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    </div>
    );
};

// Main checkout content component
const CheckoutContent: React.FC = () => {
    const { state } = useCheckout();
    const { currentStep, loading } = state;
    if (loading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <LoadingSpinner size="lg" text="Processing..." />
            </div>
        );
    }

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 1:
                return <DeliveryDetailsStepContent />;
            case 2:
                return <CartReviewStepContent />;
            case 3:
                return <PaymentStep />;
            case 4:
                return <div className="p-6"><h2 className="text-xl font-semibold mb-4">Confirmation</h2><p>Order confirmation step coming soon...</p></div>;
            default:
                return <CartReviewStepContent />;
        }
    }; return (
        <div className="max-w-5xl mx-auto p-2 md:p-4 lg:p-6">
            {/* Header */}
            <div className="mb-4 md:mb-8 text-center">
                <h1 className="text-xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-1 md:mb-3">
                    Secure Checkout
                </h1>
                <p className="text-gray-600 text-sm md:text-lg">
                    Complete your order in {checkoutSteps.length} simple steps
                </p>
            </div>

            {/* Progress indicator */}
            <StepProgress />

            {/* Current step content */}
            <div className="bg-white rounded-lg md:rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-3 md:p-6 border-b border-gray-100">
                    <div className="flex items-center space-x-2 md:space-x-3">
                        <div className="flex-shrink-0">
                            {React.createElement(checkoutSteps[currentStep - 1]?.icon || 'div', {
                                className: 'w-4 h-4 md:w-6 md:h-6 text-pink-600'
                            })}
                        </div>
                        <div>
                            <h2 className="text-base md:text-xl font-semibold text-gray-900">
                                {checkoutSteps[currentStep - 1]?.title}
                            </h2>
                            <p className="text-sm md:text-base text-gray-600">
                                {checkoutSteps[currentStep - 1]?.description}
                            </p>
                        </div>
                    </div>
                </div>
                {renderCurrentStep()}
            </div>
        </div>
    );
};

// Main checkout page component
const CheckoutPage: React.FC = () => {
    return (
        <CheckoutProvider>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-pink-50/30 to-purple-50/30 py-8">
                <CheckoutContent />
            </div>
        </CheckoutProvider>
    );
};

export default CheckoutPage;