import { useState } from 'react';
import toast from 'react-hot-toast';

type LocationResult = {
  displayName: string;
  city?: string;
  state?: string;
  country?: string;
  lat?: number;
  lon?: number;
};

export const useLocationSearch = () => {
  const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
  const [searching, setSearching] = useState(false);

  const searchLocation = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      // Using OpenStreetMap Nominatim API (free, no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=10`
      );
      const data = await response.json();

      const results = data.map((item: any) => {
        const address = item.address;
        return {
          displayName: item.display_name,
          city: address.city || address.town || address.village,
          state: address.state,
          country: address.country,
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon)
        };
      });

      setSearchResults(results);
    } catch (error) {
      console.error('Location search failed:', error);
      toast.error('Failed to search locations');
    } finally {
      setSearching(false);
    }
  };

  return { searchResults, searching, searchLocation };
};
