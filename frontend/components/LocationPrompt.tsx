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
          {/* Backdrop - full screen with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* Modal - Centered and Smaller */}
          <motion.div
           initial={{ opacity: 0, y: -80 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -80 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
           className="fixed top-4 left-2 z-50 w-[55%] max-w-[240px]"
          >
            <div className="bg-white rounded-2xl shadow-2xl p-5 mx-4 relative overflow-hidden">
              
              {/* Decorative top bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#23e5db] to-[#002f34]"></div>
              
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors z-10"
              >
                <FiX className="w-4 h-4" />
              </button>

              {/* Icon */}
              <div className="flex justify-center mb-3">
                <div className="w-14 h-14 bg-gradient-to-br from-[#002f34] to-[#004d55] rounded-full flex items-center justify-center shadow-lg">
                  <FiMapPin className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Title */}
              <h2 className="text-xl font-bold text-center text-gray-900 mb-1">
                {showManualInput ? 'Enter Your Location' : 'Find Items Near You'}
              </h2>

              {/* Description */}
              <p className="text-center text-gray-500 text-sm mb-4">
                {showManualInput 
                  ? 'Enter your city to see items available in your area'
                  : 'Allow location access to see items available near you'
                }
              </p>

              {!showManualInput ? (
                <>
                  {/* Loading State */}
                  {loading && (
                    <div className="flex flex-col items-center mb-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#23e5db] border-t-transparent mb-2"></div>
                      <p className="text-xs text-gray-500">Getting your location...</p>
                    </div>
                  )}

                  {/* Error State */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg mb-3 text-xs">
                      {error}
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="space-y-2">
                    <button
                      onClick={handleAllowLocation}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-[#002f34] to-[#004d55] text-white px-4 py-2.5 rounded-lg font-medium text-sm hover:from-[#004d55] hover:to-[#006b77] transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-md"
                    >
                      <FiNavigation className="w-4 h-4" />
                      <span>Allow Location Access</span>
                    </button>

                    <button
                      onClick={() => setShowManualInput(true)}
                      className="w-full bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-200 transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                      <FiSearch className="w-4 h-4" />
                      <span>Enter Location Manually</span>
                    </button>

                    <button
                      onClick={handleClose}
                      className="w-full text-gray-400 hover:text-gray-600 py-1.5 text-xs transition-colors"
                    >
                      Not Now
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Manual Location Input */}
                  <form onSubmit={handleManualSubmit} className="space-y-3">
                    <div>
                      <input
                        type="text"
                        value={manualCity}
                        onChange={(e) => setManualCity(e.target.value)}
                        placeholder="Enter your city name"
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#23e5db] focus:border-transparent outline-none transition-all duration-300"
                        autoFocus
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-[#002f34] to-[#004d55] text-white px-4 py-2.5 rounded-lg font-medium text-sm hover:from-[#004d55] hover:to-[#006b77] transition-all duration-300 transform hover:scale-105 shadow-md"
                      >
                        Set Location
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowManualInput(false)}
                        className="w-full text-gray-500 hover:text-gray-700 py-1.5 text-xs transition-colors"
                      >
                        Back
                      </button>
                    </div>
                  </form>
                </>
              )}

              {/* Privacy Note */}
              <p className="text-xs text-center text-gray-400 mt-3">
                We never share your exact location
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
