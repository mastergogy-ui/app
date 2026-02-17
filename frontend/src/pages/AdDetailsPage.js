import { useEffect, useState,usecallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, MessageCircle, Heart, Share2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdDetailsPage() {
  const { adId } = useParams();
  const navigate = useNavigate();
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchAd();
    checkAuth();
  }, [fetchad]);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${API}/auth/me`, { credentials: 'include' });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    }
  };

  const fetchAd = usecallback(async () => {
    try {
      const response = await fetch(`${API}/ads/${adId}`);
      const data = await response.json();
      setAd(data);
    } catch (error) {
      console.error('Error fetching ad:', error);
      toast.error('Failed to load ad');
    } finally {
      setLoading(false);
    }
  },[]);

  const handleSave = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      if (isSaved) {
        await fetch(`${API}/ads/${adId}/save`, {
          method: 'DELETE',
          credentials: 'include'
        });
        setIsSaved(false);
        toast.success('Removed from saved');
      } else {
        await fetch(`${API}/ads/${adId}/save`, {
          method: 'POST',
          credentials: 'include'
        });
        setIsSaved(true);
        toast.success('Added to saved');
      }
    } catch (error) {
      toast.error('Failed to save');
    }
  };

  const handleChat = () => {
    if (!user) {
      // Store the intended chat destination
      sessionStorage.setItem('pendingChat', JSON.stringify({ adId, ownerId: ad.owner.user_id }));
      toast.info('Please login to start chatting');
      navigate('/login', { state: { from: `/ad/${adId}` } });
      return;
    }
    navigate(`/chat/${adId}/${ad.owner.user_id}`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: ad.title,
        text: `Check out this rental: ${ad.title}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <p className="text-gray-500">Ad not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-20">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              data-testid="back-btn"
              variant="ghost"
              onClick={() => navigate(-1)}
              className="rounded-full"
            >
              <ArrowLeft size={20} />
            </Button>
            <div className="flex gap-2">
              <Button
                data-testid="share-btn"
                variant="ghost"
                onClick={handleShare}
                className="rounded-full"
              >
                <Share2 size={20} />
              </Button>
              <Button
                data-testid="save-btn"
                variant="ghost"
                onClick={handleSave}
                className="rounded-full"
              >
                <Heart size={20} fill={isSaved ? "currentColor" : "none"} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
              <Swiper
                modules={[Pagination]}
                spaceBetween={0}
                slidesPerView={1}
                pagination={{ clickable: true }}
                className="h-96"
              >
                {ad.images.map((image, index) => (
                  <SwiperSlide key={index}>
                    <img
                      src={`${BACKEND_URL}${image}`}
                      alt={`${ad.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Available';
                      }}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Manrope' }}>
                {ad.title}
              </h1>
              <div className="flex items-center gap-4 mb-6">
                <div className="text-3xl font-bold text-emerald-500">
                  ₹{ad.price_per_day}<span className="text-lg font-normal text-gray-500">/day</span>
                </div>
                <div className="text-sm text-gray-500">
                  {ad.views} views
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-600 mb-6">
                <MapPin size={18} />
                <span>{ad.location.city}, {ad.location.address}</span>
              </div>
              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">{ad.description}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center overflow-hidden">
                  {ad.owner.picture ? (
                    <img src={ad.owner.picture} alt={ad.owner.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-bold text-xl">{ad.owner.name[0]}</span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{ad.owner.name}</p>
                  <p className="text-sm text-gray-500">Owner</p>
                </div>
              </div>
              <div className="space-y-3">
                <Button
                  data-testid="call-btn"
                  onClick={() => window.location.href = `tel:${ad.contact_number}`}
                  className="w-full h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  <Phone size={18} className="mr-2" />
                  Call
                </Button>
                <Button
                  data-testid="chat-btn"
                  onClick={handleChat}
                  variant="outline"
                  className="w-full h-12 rounded-full border-gray-200 font-semibold"
                >
                  <MessageCircle size={18} className="mr-2" />
                  Chat
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
