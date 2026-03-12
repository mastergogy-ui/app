import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

type LocationState = {
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  loading: boolean;
  error: string | null;
  permissionDenied: boolean;
  timestamp: number | null;
};

type LocationResult = LocationState & {
  requestLocation: () => void;
  setManualLocation: (city: string, lat?: number, lng?: number) => void;
};

export const useLocation = (options?: {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  autoRequest?: boolean;
}): LocationResult => {
  const [state, setState] = useState<LocationState>({
    latitude: null,
    longitude: null,
    city: null,
    loading: false,
    error: null,
    permissionDenied: false,
    timestamp: null,
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://mahalakshmi.onrender.com";

  // Reverse geocoding to get city from coordinates
  const getCityFromCoordinates = async (lat: number, lng: number) => {
    try {
      // Using OpenStreetMap Nominatim API (free, no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`
      );
      const data = await response.json();
      
      // Extract city from address
      const address = data.address;
      const city = address.city || address.town || address.village || address.county || 'Unknown';
      
      setState(prev => ({ ...prev, city }));
      return city;
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return null;
    }
  };

  const requestLocation = () => {
    // Check if browser supports geolocation
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Geolocation is not supported by your browser',
        permissionDenied: true
      }));
      toast.error('Your browser does not support location services');
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    const successHandler = async (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      
      setState(prev => ({
        ...prev,
        latitude,
        longitude,
        loading: false,
        error: null,
        permissionDenied: false,
        timestamp: position.timestamp
      }));

      // Get city name from coordinates
      await getCityFromCoordinates(latitude, longitude);
      
      toast.success('Location accessed successfully');
    };

    const errorHandler = (error: GeolocationPositionError) => {
      let errorMessage = '';
      let permissionDenied = false;

      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Please allow location access to see nearby items';
          permissionDenied = true;
          toast.error('Location permission denied');
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information is unavailable';
          toast.error('Unable to detect your location');
          break;
        case error.TIMEOUT:
          errorMessage = 'Location request timed out';
          toast.error('Location request timed out');
          break;
        default:
          errorMessage = 'An unknown error occurred';
          toast.error('Failed to get location');
      }

      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        permissionDenied
      }));
    };

    const geolocationOptions = {
      enableHighAccuracy: options?.enableHighAccuracy ?? true,
      timeout: options?.timeout ?? 10000,
      maximumAge: options?.maximumAge ?? 0
    };

    navigator.geolocation.getCurrentPosition(
      successHandler,
      errorHandler,
      geolocationOptions
    );
  };

  const setManualLocation = (city: string, lat?: number, lng?: number) => {
    setState(prev => ({
      ...prev,
      city,
      latitude: lat || null,
      longitude: lng || null,
      error: null,
      permissionDenied: false,
      loading: false
    }));
    toast.success(`Location set to ${city}`);
  };

  // Auto-request location on mount if specified
  useEffect(() => {
    if (options?.autoRequest) {
      requestLocation();
    }
  }, []);

  return {
    ...state,
    requestLocation,
    setManualLocation
  };
};
