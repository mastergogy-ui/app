"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMapPin, FiX, FiSearch, FiNavigation, FiClock, FiTrendingUp } from 'react-icons/fi';
import { useLocationSearch } from '../hooks/useLocationSearch';
import toast from 'react-hot-toast';

type LocationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: {
    displayName: string;
    city?: string;
    state?: string;
    country?: string;
    lat?: number;
    lon?: number;
  }) => void;
  recentLocations?: Array<{
    displayName: string;
    city?: string;
    state?: string;
    country?: string;
  }>;
};

const popularLocations = [
  { displayName: 'Mumbai, Maharashtra', city: 'Mumbai', state: 'Maharashtra' },
  { displayName: 'Delhi, Delhi', city: 'Delhi', state: 'Delhi' },
  { displayName: 'Bangalore, Karnataka', city: 'Bangalore', state: 'Karnataka' },
  { displayName: 'Chennai, Tamil Nadu', city: 'Chennai', state: 'Tamil Nadu' },
  { displayName: 'Kolkata, West Bengal', city: 'Kolkata', state: 'West Bengal' },
  { displayName: 'Pune, Maharashtra', city: 'Pune', state: 'Maharashtra' },
  { displayName: 'Hyderabad, Telangana', city: 'Hyderabad', state: 'Telangana' },
  { displayName: 'Ahmedabad, Gujarat', city: 'Ahmedabad', state: 'Gujarat' },
  { displayName: 'Jaipur, Rajasthan', city: 'Jaipur', state: 'Rajasthan' },
  { displayName: 'Lucknow, Uttar Pradesh', city: 'Lucknow', state: 'Uttar Pradesh' },
];

export default function LocationModal({ isOpen, onClose, onLocationSelect, recentLocations = [] }: LocationModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [gettingCurrent, setGettingCurrent] = useState(false);
  const { searchResults, searching, searchLocation } = useLocationSearch();

  useEffect(() => {
    if (searchQuery) {
      const debounce = setTimeout(() => {
        searchLocation(searchQuery);
      }, 500);
      return () => clearTimeout(debounce);
    }
  }, [searchQuery]);

  const handleUseCurrentLocation = () => {
    setGettingCurrent(true);
    
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      setGettingCurrent(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Reverse geocoding to get address
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          );
          const data = await response.json();
          
          const address = data.address;
          const location = {
            displayName: data.display_name,
            city: address.city || address.town || address.village,
            state: address.state,
            country: address.country,
            lat: latitude,
            lon: longitude
          };
          
          onLocationSelect(location);
          onClose();
          toast.success('Location updated successfully');
        } catch (error) {
          console.error('Reverse geocoding failed:', error);
          toast.error('Failed to get location details');
        } finally {
          setGettingCurrent(false);
        }
      },
      (error) => {
        let message = 'Failed to get location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Please allow location access';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out';
            break;
        }
        toast.error(message);
        setGettingCurrent(false);
      }
    );
  };

  const handleLocationClick = (location: any) => {
    onLocationSelect(location);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-0 left-0 right-0 md:top-1/2 md:left-1/2 md:bottom-auto md:transform md:-translate-x-1/2 md:-translate-y-1/2 z-50 w-full md:max-w-lg"
          >
            <div className="bg-white rounded-t-2xl md:rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden">
              
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Choose your location</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FiX className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="p-4 border-b">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search city, area or locality"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#23e5db] focus:border-transparent outline-none transition-all"
                    autoFocus
                  />
                </div>
              </div>

              {/* Search Results or Default Content */}
              <div className="overflow-y-auto max-h-[60vh] p-4">
                {searchQuery ? (
                  // Search Results
                  <div className="space-y-2">
                    {searching ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#23e5db] border-t-transparent"></div>
                      </div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((result, index) => (
                        <button
                          key={index}
                          onClick={() => handleLocationClick(result)}
                          className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors flex items-start space-x-3"
                        >
                          <FiMapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-gray-900">{result.city || result.state || result.country}</p>
                            <p className="text-sm text-gray-500">{result.displayName}</p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <p className="text-center text-gray-500 py-8">No locations found</p>
                    )}
                  </div>
                ) : (
                  // Default Content
                  <div className="space-y-6">
                    {/* Current Location */}
                    <div>
                      <button
                        onClick={handleUseCurrentLocation}
                        disabled={gettingCurrent}
                        className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors flex items-center space-x-3 disabled:opacity-50"
                      >
                        <div className="w-8 h-8 bg-[#23e5db]/10 rounded-full flex items-center justify-center">
                          <FiNavigation className="w-4 h-4 text-[#23e5db]" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">Use current location</p>
                          {gettingCurrent && (
                            <p className="text-sm text-gray-500">Getting location...</p>
                          )}
                        </div>
                      </button>
                    </div>

                    {/* Recent Locations */}
                    {recentLocations.length > 0 && (
                      <div>
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center">
                          <FiClock className="w-3 h-3 mr-1" />
                          Recent Locations
                        </h3>
                        <div className="space-y-1">
                          {recentLocations.map((loc, index) => (
                            <button
                              key={index}
                              onClick={() => handleLocationClick(loc)}
                              className="w-full text-left p-2 hover:bg-gray-50 rounded-lg transition-colors flex items-center space-x-3"
                            >
                              <FiMapPin className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-700">{loc.displayName}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Popular Locations */}
                    <div>
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center">
                        <FiTrendingUp className="w-3 h-3 mr-1" />
                        Popular Locations
                      </h3>
                      <div className="space-y-1">
                        {popularLocations.map((loc, index) => (
                          <button
                            key={index}
                            onClick={() => handleLocationClick(loc)}
                            className="w-full text-left p-2 hover:bg-gray-50 rounded-lg transition-colors flex items-center space-x-3"
                          >
                            <FiMapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-700">{loc.displayName}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
