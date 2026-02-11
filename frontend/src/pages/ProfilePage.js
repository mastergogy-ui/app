import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (authUser) {
      setUser(authUser);
      setName(authUser.name || '');
      setPhone(authUser.phone || '');
      setCity(authUser.location?.city || '');
      if (authUser.picture) {
        setImagePreview(authUser.picture.startsWith('http') ? authUser.picture : `${BACKEND_URL}${authUser.picture}`);
      }
    }
  }, [authUser]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('phone', phone);
      if (city) {
        formData.append('location', JSON.stringify({ city }));
      }
      if (imageFile) {
        formData.append('picture', imageFile);
      }

      const response = await fetch(`${API}/user/profile`, {
        method: 'PUT',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Update failed');

      const data = await response.json();
      setUser(data);
      login(data); // Update the auth context with new user data
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  if (!user) {
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                data-testid="back-btn"
                variant="ghost"
                onClick={() => navigate('/')}
                className="rounded-full"
              >
                <ArrowLeft size={20} />
              </Button>
              <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Manrope' }}>Profile</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-6">
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center overflow-hidden">
                {imagePreview ? (
                  <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-bold text-4xl">{user.name[0]}</span>
                )}
              </div>
              <label
                htmlFor="profile-picture"
                data-testid="upload-picture-btn"
                className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-3 cursor-pointer hover:bg-blue-700 transition-colors"
              >
                <Camera size={20} />
                <input
                  id="profile-picture"
                  data-testid="picture-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Manrope' }}>{user.name}</h2>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</Label>
                <Input
                  data-testid="name-input"
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  className="mt-1 h-12 rounded-lg bg-gray-50"
                />
              </div>

              <div>
                <Label htmlFor="email-display" className="text-sm font-medium text-gray-700">Email Address</Label>
                <Input
                  id="email-display"
                  type="email"
                  value={user.email}
                  disabled
                  className="mt-1 h-12 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number</Label>
                <Input
                  data-testid="phone-input"
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 XXXXXXXXXX"
                  className="mt-1 h-12 rounded-lg bg-gray-50"
                />
              </div>

              <div>
                <Label htmlFor="city" className="text-sm font-medium text-gray-700">City</Label>
                <Input
                  data-testid="city-input"
                  id="city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Your city"
                  className="mt-1 h-12 rounded-lg bg-gray-50"
                />
              </div>

              <Button
                data-testid="save-profile-btn"
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h3>
          <Button
            data-testid="logout-btn"
            onClick={handleLogout}
            variant="outline"
            className="w-full h-12 rounded-full border-red-200 text-red-500 hover:bg-red-50 font-semibold"
          >
            <LogOut size={20} className="mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}