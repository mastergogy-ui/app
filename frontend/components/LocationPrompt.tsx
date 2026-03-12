"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMapPin, FiX, FiNavigation, FiSearch } from 'react-icons/fi';
import { useLocation } from '../hooks/useLocation';

type LocationPromptProps = {
  onLocationSet?: (city: string, lat?: number, lng?: number) => void;
  onClose?: () => void;
  autoShow?: boolean;
};

export default function LocationPrompt({ onLocationSet, onClose, autoShow = true }: LocationPromptProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [manualCity, setManualCity] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  
  const { 
    latitude, 
    longitude, 
    city, 
    loading, 
    error, 
    permissionDenied,
    requestLocation,
    setManualLocation 
  } = useLocation({ autoRequest: false });

  // Show prompt on mount if autoShow is true
  useEffect(() => {
    if (autoShow && !localStorage.getItem('location-prompt-shown')) {
      setIsOpen(true);
      localStorage.setItem('location-prompt-shown', 'true');
    }
  }, [autoShow]);

  const handleAllowLocation = () => {
    requestLocation();
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCity.trim()) {
      setManualLocation(manualCity.trim());
      setIsOpen(false);
      onLocationSet?.(manualCity.trim());
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  // Auto-close when location is successfully set
  useEffect(() => {
    if (city && isOpen) {
      setIsOpen(false);
      onLocationSet?.(city, latitude || undefined, longitude || undefined);
    }
  }, [city, latitude, longitude]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-6 mx-4">
              
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>

              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-[#002f34] to-[#004d55] rounded-full flex items-center justify-center">
                  <FiMapPin className="w-10 h-10 text-white" />
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
                {showManualInput ? 'Enter Your Location' : 'Find Items Near You'}
              </h2>

              {/* Description */}
              <p className="text-center text-gray-600 mb-6">
                {showManualInput 
                  ? 'Enter your city to see items available in your area'
                  : 'Allow location access to see items available near you'
                }
              </p>

              {!showManualInput ? (
                <>
                  {/* Loading State */}
                  {loading && (
                    <div className="flex flex-col items-center mb-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#23e5db] border-t-transparent mb-2"></div>
                      <p className="text-sm text-gray-500">Getting your location...</p>
                    </div>
                  )}

                  {/* Error State */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
                      {error}
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={handleAllowLocation}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-[#002f34] to-[#004d55] text-white px-6 py-3 rounded-lg font-semibold hover:from-[#004d55] hover:to-[#006b77] transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      <FiNavigation className="w-5 h-5" />
                      <span>Allow Location Access</span>
                    </button>

                    <button
                      onClick={() => setShowManualInput(true)}
                      className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                      <FiSearch className="w-5 h-5" />
                      <span>Enter Location Manually</span>
                    </button>

                    <button
                      onClick={handleClose}
                      className="w-full text-gray-500 hover:text-gray-700 py-2 text-sm transition-colors"
                    >
                      Not Now
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Manual Location Input */}
                  <form onSubmit={handleManualSubmit} className="space-y-4">
                    <div>
                      <input
                        type="text"
                        value={manualCity}
                        onChange={(e) => setManualCity(e.target.value)}
                        placeholder="Enter your city name"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#23e5db] focus:border-transparent outline-none transition-all duration-300"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-[#002f34] to-[#004d55] text-white px-6 py-3 rounded-lg font-semibold hover:from-[#004d55] hover:to-[#006b77] transition-all duration-300 transform hover:scale-105"
                      >
                        Set Location
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowManualInput(false)}
                        className="w-full text-gray-500 hover:text-gray-700 py-2 text-sm transition-colors"
                      >
                        Back
                      </button>
                    </div>
                  </form>
                </>
              )}

              {/* Privacy Note */}
              <p className="text-xs text-center text-gray-400 mt-6">
                Your location helps us show you items nearby. We never share your exact location.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
