import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home, PlusCircle, MessageSquare, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const categories = [
  { id: "real_estate", name: "Real Estate", image: "https://images.unsplash.com/photo-1663756915301-2ba688e078cf?crop=entropy&cs=srgb&fm=jpg&q=85" },
  { id: "cars", name: "Cars", image: "https://images.unsplash.com/photo-1760713164476-7eb5063b3d07?crop=entropy&cs=srgb&fm=jpg&q=85" },
  { id: "bikes", name: "Bikes", image: "https://images.unsplash.com/photo-1661834172037-55a4d2ac026d?crop=entropy&cs=srgb&fm=jpg&q=85" },
  { id: "scooters", name: "Scooters", image: "https://images.unsplash.com/photo-1761049134836-eb778de442e5?crop=entropy&cs=srgb&fm=jpg&q=85" },
  { id: "clothing", name: "Clothing", image: "https://images.unsplash.com/photo-1766934587163-186d20bf3d40?crop=entropy&cs=srgb&fm=jpg&q=85" },
  { id: "appliances", name: "Appliances", image: "https://images.unsplash.com/photo-1758279745240-b75977c88fa8?crop=entropy&cs=srgb&fm=jpg&q=85" },
  { id: "rent_a_friend", name: "Rent a Friend", image: "https://images.unsplash.com/photo-1753351056838-143bc3e4cf03?crop=entropy&cs=srgb&fm=jpg&q=85" }
];

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [nearbyAds, setNearbyAds] = useState([]);
  const [location, setLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocation(loc);
          fetchNearbyAds(loc);
        },
        (error) => {
          console.error("Error getting location:", error);
          fetchNearbyAds();
        }
      );
    } else {
      fetchNearbyAds();
    }
  };

  const fetchNearbyAds = async (loc = null) => {
    try {
      let url = `${API}/ads?`;
      if (loc) {
        url += `lat=${loc.lat}&lng=${loc.lng}&max_distance=20`;
      }
      const response = await fetch(url);
      const data = await response.json();
      setNearbyAds(data.slice(0, 8));
    } catch (error) {
      console.error("Error fetching ads:", error);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/category/all?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Manrope' }}>RENT WALA</h1>
            </div>
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Button 
                    data-testid="upload-btn-desktop" 
                    onClick={() => navigate('/upload')} 
                    className="hidden md:flex items-center gap-2 rounded-full bg-red-500 hover:bg-red-600 text-white px-6 py-2 font-semibold"
                  >
                    <PlusCircle size={20} />
                    <span>Upload</span>
                  </Button>
                  <Button 
                    data-testid="profile-btn-desktop" 
                    onClick={() => navigate('/profile')} 
                    variant="outline"
                    className="hidden md:flex items-center gap-2 rounded-full border-gray-200 px-6 py-2 font-semibold"
                  >
                    <User size={20} />
                    <span>Profile</span>
                  </Button>
                  <Button 
                    data-testid="dashboard-btn-desktop" 
                    onClick={() => navigate('/dashboard')} 
                    className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 font-semibold"
                  >
                    Dashboard
                  </Button>
                </>
              ) : (
                <>
                  <Button data-testid="login-btn" variant="outline" onClick={() => navigate('/login')} className="rounded-full border-gray-200 px-6">
                    Login
                  </Button>
                  <Button data-testid="register-btn" onClick={() => navigate('/register')} className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-6">
                    Register
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Manrope' }}>
              Rent Anything, Earn Everyday
            </h2>
            <p className="text-lg text-blue-100">Find rentals nearby or list your items to earn money</p>
          </div>
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-2">
              <Input
                data-testid="search-input"
                type="text"
                placeholder="Search for items, properties, or friends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="h-14 rounded-full bg-white text-gray-900 px-6 text-base border-0 focus:ring-2 focus:ring-white/20"
              />
              <Button data-testid="search-btn" onClick={handleSearch} className="h-14 rounded-full bg-white text-blue-600 hover:bg-blue-50 px-8 font-semibold">
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-gray-900 mb-8" style={{ fontFamily: 'Manrope' }}>Browse Categories</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                data-testid={`category-${cat.id}`}
                onClick={() => navigate(`/category/${cat.id}`)}
                className="category-card bg-white rounded-xl border border-gray-100 p-4 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-blue-200 hover:shadow-md"
              >
                <div className="w-full h-24 rounded-lg overflow-hidden">
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                </div>
                <p className="text-sm font-semibold text-gray-900 text-center">{cat.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {nearbyAds.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-8" style={{ fontFamily: 'Manrope' }}>Nearby Rentals</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {nearbyAds.map((ad) => (
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
                    <p className="text-2xl font-bold text-emerald-500 mb-2">₹{ad.price_per_day}<span className="text-sm font-normal text-gray-500">/day</span></p>
                    <p className="text-sm text-gray-500 truncate">{ad.location.city || 'Location'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
        <div className="flex items-center justify-around py-3">
          <button data-testid="nav-home" onClick={() => navigate('/')} className="flex flex-col items-center gap-1 text-gray-600">
            <Home size={24} />
            <span className="text-xs font-medium">Home</span>
          </button>
          {isAuthenticated && (
            <>
              <button data-testid="nav-upload" onClick={() => navigate('/upload')} className="flex flex-col items-center gap-1 text-red-500">
                <PlusCircle size={24} />
                <span className="text-xs font-medium">Upload</span>
              </button>
              <button data-testid="nav-messages" onClick={() => navigate('/messages')} className="flex flex-col items-center gap-1 text-gray-600">
                <MessageSquare size={24} />
                <span className="text-xs font-medium">Messages</span>
              </button>
              <button data-testid="nav-dashboard" onClick={() => navigate('/dashboard')} className="flex flex-col items-center gap-1 text-gray-600">
                <Home size={24} />
                <span className="text-xs font-medium">Dashboard</span>
              </button>
              <button data-testid="nav-profile" onClick={() => navigate('/profile')} className="flex flex-col items-center gap-1 text-gray-600">
                <User size={24} />
                <span className="text-xs font-medium">Profile</span>
              </button>
            </>
          )}
        </div>
      </nav>
    </div>
  );
}