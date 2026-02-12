import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Trash2, Eye, TrendingUp, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function DashboardPage() {
  const navigate = useNavigate();
  const { gogoPoints } = useAuth();
  const [user, setUser] = useState(null);
  const [myAds, setMyAds] = useState([]);
  const [savedAds, setSavedAds] = useState([]);
  const [activeTab, setActiveTab] = useState('my-ads');
  const [loading, setLoading] = useState(true);

  // Format large numbers
  const formatPoints = (points) => {
    if (points >= 1000000000) return `${(points / 1000000000).toFixed(1)}B`;
    if (points >= 1000000) return `${(points / 1000000).toFixed(1)}M`;
    if (points >= 1000) return `${(points / 1000).toFixed(1)}K`;
    return points.toString();
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userRes, adsRes, savedRes] = await Promise.all([
        fetch(`${API}/auth/me`, { credentials: 'include' }),
        fetch(`${API}/user/ads`, { credentials: 'include' }),
        fetch(`${API}/user/saved-ads`, { credentials: 'include' })
      ]);

      const userData = await userRes.json();
      const adsData = await adsRes.json();
      const savedData = await savedRes.json();

      setUser(userData);
      setMyAds(adsData);
      setSavedAds(savedData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAd = async (adId) => {
    if (!window.confirm('Are you sure you want to delete this ad?')) return;

    try {
      const response = await fetch(`${API}/ads/${adId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Delete failed');
      toast.success('Ad deleted successfully');
      setMyAds(myAds.filter(ad => ad.ad_id !== adId));
    } catch (error) {
      toast.error('Failed to delete ad');
    }
  };

  const totalViews = myAds.reduce((sum, ad) => sum + ad.views, 0);
  const totalEarnings = myAds.reduce((sum, ad) => sum + (ad.price_per_day * 30), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Manrope' }}>Dashboard</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Gogo Points Card */}
          <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-white/80">Gogo Points</p>
              <Coins size={20} className="text-white" />
            </div>
            <p className="text-3xl font-bold text-white" data-testid="dashboard-points">{formatPoints(gogoPoints)}</p>
            <p className="text-xs text-white/70 mt-1">Available balance</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Total Ads</p>
              <TrendingUp size={20} className="text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{myAds.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Total Views</p>
              <Eye size={20} className="text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalViews}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Est. Earnings</p>
              <span className="text-emerald-500 text-xl">₹</span>
            </div>
            <p className="text-3xl font-bold text-emerald-500">₹{totalEarnings}</p>
            <p className="text-xs text-gray-500 mt-1">Per month estimate</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex gap-4 mb-6 border-b border-gray-100">
            <button
              data-testid="my-ads-tab"
              onClick={() => setActiveTab('my-ads')}
              className={`pb-3 px-4 font-semibold transition-colors ${
                activeTab === 'my-ads'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              My Ads ({myAds.length})
            </button>
            <button
              data-testid="saved-ads-tab"
              onClick={() => setActiveTab('saved-ads')}
              className={`pb-3 px-4 font-semibold transition-colors ${
                activeTab === 'saved-ads'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Saved Ads ({savedAds.length})
            </button>
          </div>

          {activeTab === 'my-ads' ? (
            myAds.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">You haven't posted any ads yet</p>
                <Button data-testid="upload-ad-btn" onClick={() => navigate('/upload')} className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-6">
                  Upload Ad
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {myAds.map((ad) => (
                  <div key={ad.ad_id} data-testid={`my-ad-${ad.ad_id}`} className="flex gap-4 border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <img
                      src={`${BACKEND_URL}${ad.images[0]}`}
                      alt={ad.title}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{ad.title}</h3>
                      <p className="text-emerald-500 font-bold mb-2">₹{ad.price_per_day}/day</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{ad.views} views</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          ad.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-yellow-50 text-yellow-600'
                        }`}>
                          {ad.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        data-testid={`edit-ad-${ad.ad_id}`}
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/ad/${ad.ad_id}`)}
                        className="rounded-lg"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        data-testid={`delete-ad-${ad.ad_id}`}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAd(ad.ad_id)}
                        className="rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            savedAds.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No saved ads yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedAds.map((ad) => (
                  <div
                    key={ad.ad_id}
                    data-testid={`saved-ad-${ad.ad_id}`}
                    onClick={() => navigate(`/ad/${ad.ad_id}`)}
                    className="listing-card bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img src={`${BACKEND_URL}${ad.images[0]}`} alt={ad.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-1 truncate">{ad.title}</h4>
                      <p className="text-2xl font-bold text-emerald-500 mb-2">
                        ₹{ad.price_per_day}<span className="text-sm font-normal text-gray-500">/day</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}