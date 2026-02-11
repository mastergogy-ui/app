import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const categoryNames = {
  real_estate: "Real Estate",
  cars: "Cars",
  bikes: "Bikes",
  scooters: "Scooters",
  clothing: "Clothing",
  appliances: "Appliances",
  rent_a_friend: "Rent a Friend",
  all: "All Categories"
};

export default function CategoryPage() {
  const { category } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [location, setLocation] = useState(null);

  useEffect(() => {
    getLocation();
  }, []);

  useEffect(() => {
    if (location) {
      fetchAds();
    }
  }, [category, searchQuery, location]);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          setLocation({ lat: null, lng: null });
        }
      );
    } else {
      setLocation({ lat: null, lng: null });
    }
  };

  const fetchAds = async () => {
    setLoading(true);
    try {
      let url = `${API}/ads?`;
      if (category !== 'all') {
        url += `category=${category}&`;
      }
      if (location.lat && location.lng) {
        url += `lat=${location.lat}&lng=${location.lng}&max_distance=20&`;
      }
      if (searchQuery) {
        url += `search=${encodeURIComponent(searchQuery)}&`;
      }
      if (minPrice) {
        url += `min_price=${minPrice}&`;
      }
      if (maxPrice) {
        url += `max_price=${maxPrice}&`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      setAds(data);
    } catch (error) {
      console.error('Error fetching ads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchAds();
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-20">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button
              data-testid="back-btn"
              variant="ghost"
              onClick={() => navigate('/')}
              className="rounded-full"
            >
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Manrope' }}>
              {categoryNames[category] || 'Browse'}
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
          <div className="flex gap-3 mb-3">
            <Input
              data-testid="search-input"
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 h-12 rounded-lg bg-gray-50"
            />
            <Button data-testid="search-btn" onClick={handleSearch} className="h-12 rounded-lg bg-blue-600 hover:bg-blue-700 px-6">
              <Search size={20} />
            </Button>
          </div>
          <div className="flex gap-3">
            <Input
              data-testid="min-price-input"
              type="number"
              placeholder="Min price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="h-10 rounded-lg bg-gray-50"
            />
            <Input
              data-testid="max-price-input"
              type="number"
              placeholder="Max price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="h-10 rounded-lg bg-gray-50"
            />
            <Button data-testid="filter-btn" onClick={handleSearch} variant="outline" className="h-10 rounded-lg px-4">
              <SlidersHorizontal size={18} />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : ads.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No listings found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ads.map((ad) => (
              <div
                key={ad.ad_id}
                data-testid={`ad-card-${ad.ad_id}`}
                onClick={() => navigate(`/ad/${ad.ad_id}`)}
                className="listing-card bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer"
              >
                <div className="relative h-48 overflow-hidden">
                  <img src={`${BACKEND_URL}${ad.images[0]}`} alt={ad.title} className="w-full h-full object-cover" />
                  {ad.distance && (
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-900">
                      {ad.distance} km
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-1 truncate">{ad.title}</h4>
                  <p className="text-2xl font-bold text-emerald-500 mb-2">
                    ₹{ad.price_per_day}<span className="text-sm font-normal text-gray-500">/day</span>
                  </p>
                  <p className="text-sm text-gray-500 truncate">{ad.location.city || 'Location'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}