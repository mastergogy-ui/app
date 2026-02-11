import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdminPage() {
  const navigate = useNavigate();
  const [ads, setAds] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('ads');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [adsRes, usersRes] = await Promise.all([
        fetch(`${API}/admin/ads`, { credentials: 'include' }),
        fetch(`${API}/admin/users`, { credentials: 'include' })
      ]);

      const adsData = await adsRes.json();
      const usersData = await usersRes.json();

      setAds(adsData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (adId, status) => {
    try {
      const formData = new FormData();
      formData.append('status', status);

      const response = await fetch(`${API}/admin/ads/${adId}/status`, {
        method: 'PUT',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Update failed');

      toast.success(`Ad ${status}`);
      setAds(ads.map(ad => ad.ad_id === adId ? { ...ad, status } : ad));
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

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
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Manrope' }}>Admin Panel</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex gap-4 mb-6 border-b border-gray-100">
            <button
              data-testid="ads-tab"
              onClick={() => setActiveTab('ads')}
              className={`pb-3 px-4 font-semibold transition-colors ${
                activeTab === 'ads'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              All Ads ({ads.length})
            </button>
            <button
              data-testid="users-tab"
              onClick={() => setActiveTab('users')}
              className={`pb-3 px-4 font-semibold transition-colors ${
                activeTab === 'users'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              All Users ({users.length})
            </button>
          </div>

          {activeTab === 'ads' ? (
            <div className="space-y-4">
              {ads.map((ad) => (
                <div key={ad.ad_id} data-testid={`admin-ad-${ad.ad_id}`} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex gap-4">
                    <img
                      src={`${BACKEND_URL}${ad.images[0]}`}
                      alt={ad.title}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{ad.title}</h3>
                      <p className="text-emerald-500 font-bold mb-2">₹{ad.price_per_day}/day</p>
                      <p className="text-sm text-gray-500 mb-2">Owner: {ad.owner?.name} ({ad.owner?.email})</p>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          ad.status === 'active' ? 'bg-emerald-50 text-emerald-600' :
                          ad.status === 'pending' ? 'bg-yellow-50 text-yellow-600' :
                          'bg-red-50 text-red-600'
                        }`}>
                          {ad.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {ad.status !== 'active' && (
                        <Button
                          data-testid={`approve-ad-${ad.ad_id}`}
                          onClick={() => handleUpdateStatus(ad.ad_id, 'active')}
                          className="rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white"
                        >
                          Approve
                        </Button>
                      )}
                      {ad.status !== 'rejected' && (
                        <Button
                          data-testid={`reject-ad-${ad.ad_id}`}
                          onClick={() => handleUpdateStatus(ad.ad_id, 'rejected')}
                          variant="outline"
                          className="rounded-lg border-red-200 text-red-500 hover:bg-red-50"
                        >
                          Reject
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.user_id} data-testid={`admin-user-${user.user_id}`} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center overflow-hidden">
                      {user.picture ? (
                        <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white font-bold text-xl">{user.name[0]}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{user.name}</h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      {user.phone && <p className="text-sm text-gray-500">{user.phone}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}