import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home, PlusCircle, MessageSquare, User, Bell, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import socketService from "@/services/socketService";

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
  const { isAuthenticated, user, gogoPoints } = useAuth();
  const [nearbyAds, setNearbyAds] = useState([]);
  const [location, setLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  // Format large numbers
  const formatPoints = (points) => {
    if (points >= 1000000000) return `${(points / 1000000000).toFixed(1)}B`;
    if (points >= 1000000) return `${(points / 1000000).toFixed(1)}M`;
    if (points >= 1000) return `${(points / 1000).toFixed(1)}K`;
    return points.toString();
  };

  useEffect(() => {
    getLocation();
    if (isAuthenticated && user) {
      checkUnreadMessages();
      // Set up socket listeners
      setupSocketListener();
    }
    
    return () => {
      // Clean up listeners but don't disconnect socket
      socketService.offNotification();
      socketService.offNewMessage();
    };
  }, [isAuthenticated, user]);

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

  const checkUnreadMessages = async () => {
    try {
      const response = await fetch(`${API}/conversations`, { credentials: 'include' });
      if (response.ok) {
        const conversations = await response.json();
        const unread = conversations.filter(conv => !conv.seen && conv.last_message).length;
        setUnreadCount(unread);
        if (unread > 0) {
          setHasNewMessage(true);
        }
      }
    } catch (error) {
      console.error('Error checking messages:', error);
    }
  };

  const setupSocketListener = () => {
    const socket = socketService.getSocket();
    if (!socket) {
      console.log('Socket not available');
      return;
    }

    // Listen for notifications
    socketService.onNotification((data) => {
      console.log('Received notification:', data);
      if (data.receiver_id === user?.user_id) {
        setUnreadCount(prev => prev + 1);
        setHasNewMessage(true);
        playNotificationSound();
        
        toast.success(`New message from ${data.sender_name || 'someone'}`, {
          description: data.message?.message || 'Click to view',
          action: {
            label: 'View',
            onClick: () => navigate('/messages')
          }
        });
      }
    });

    // Also listen for direct new_message events
    socketService.onNewMessage((message) => {
      console.log('Received new_message:', message);
      if (message.receiver_id === user?.user_id) {
        setUnreadCount(prev => prev + 1);
        setHasNewMessage(true);
        playNotificationSound();
      }
    });
  };

  const playNotificationSound = () => {
    const audio = new Audio('data:audio/wav;base64,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');
    audio.play().catch(e => console.log('Audio play failed:', e));
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
            <div className="flex items-center gap-2">
              {isAuthenticated && (
                <button
                  data-testid="notification-btn"
                  onClick={() => navigate('/messages')}
                  className="relative rounded-full p-2 hover:bg-gray-100 transition-colors"
                >
                  <Bell 
                    size={22} 
                    className={hasNewMessage ? "text-green-500" : "text-blue-600"}
                    fill={hasNewMessage ? "currentColor" : "none"}
                  />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
              )}
              <img src="/logo.png" alt="RentWala" className="h-14 md:h-16 w-auto" />
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              {isAuthenticated ? (
                <>
                  {/* Gogo Points Display */}
                  <div 
                    data-testid="gogo-points-display"
                    className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1.5 rounded-full font-semibold text-sm cursor-pointer hover:from-amber-500 hover:to-orange-600 transition-all"
                    onClick={() => navigate('/profile')}
                  >
                    <Coins size={16} />
                    <span>{formatPoints(gogoPoints)}</span>
                  </div>
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
                    className="hidden sm:flex rounded-full bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2 font-semibold text-sm md:text-base"
                  >
                    Dashboard
                  </Button>
                </>
              ) : (
                <>
                  <Button data-testid="login-btn" variant="outline" onClick={() => navigate('/login')} className="rounded-full border-gray-200 px-4 md:px-6 text-sm md:text-base">
                    Login
                  </Button>
                  <Button data-testid="register-btn" onClick={() => navigate('/register')} className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 text-sm md:text-base">
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
                  <div className="relative h-48 overflow-hidden bg-gray-100">
                    <img 
                      src={`${BACKEND_URL}${ad.images[0]}`} 
                      alt={ad.title} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                      }}
                    />
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