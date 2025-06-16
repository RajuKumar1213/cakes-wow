'use client';

import { useState, useEffect } from 'react';
import { X, Phone } from 'lucide-react';
import axios from 'axios';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const WhatsAppModal = ({ isOpen, onClose, onSuccess, onError }: WhatsAppModalProps) => {
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingCurrent, setFetchingCurrent] = useState(false);

  // Fetch current WhatsApp number when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCurrentWhatsAppNumber();
    }
  }, [isOpen]);

  const fetchCurrentWhatsAppNumber = async () => {
    setFetchingCurrent(true);
    try {
     

      const response = await axios.get('/api/admin/whatsapp');

      if (response.data.success) {
        setWhatsappNumber(response.data.whatsappNumber || '');
      }    } catch (error: any) {
      console.error('Error fetching current WhatsApp number:', error);
      onError('Failed to fetch current WhatsApp number');
    } finally {
      setFetchingCurrent(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);    try {
      const response = await axios.put('/api/admin/whatsapp', {
        whatsappNumber: whatsappNumber.trim()
      });

      if (response.data.success) {
        onSuccess(response.data.message);
        onClose();
      }    } catch (error: any) {
      console.error('Error updating WhatsApp number:', error);
      if (error.response?.data?.error) {
        onError(error.response.data.error);
      } else {
        onError('Failed to update WhatsApp number');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setWhatsappNumber('');
      onClose();
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length <= 10) {
      setWhatsappNumber(value);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Phone className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              WhatsApp Number
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label htmlFor="whatsappNumber" className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp Number for Order Notifications
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 text-sm">+91</span>
              </div>
              <input
                type="tel"
                id="whatsappNumber"
                value={whatsappNumber}
                onChange={handleNumberChange}
                placeholder="Enter 10-digit mobile number"
                className="w-full pl-12 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                disabled={loading || fetchingCurrent}
              />
            </div>
            <p className="mt-2 text-sm text-gray-600">
              This number will receive WhatsApp notifications for new orders. 
              Must be a valid 10-digit Indian mobile number.
            </p>
            {whatsappNumber && (
              <p className="mt-1 text-sm text-gray-500">
                Preview: +91 {whatsappNumber}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || fetchingCurrent || (whatsappNumber.length > 0 && whatsappNumber.length !== 10)}
              className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </div>
              ) : fetchingCurrent ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Loading...
                </div>
              ) : (
                whatsappNumber ? 'Update Number' : 'Remove Number'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WhatsAppModal;
