import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload as UploadIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const categories = [
  { id: "real_estate", name: "Real Estate", subcategories: ["Plots", "Houses", "Commercial Buildings"] },
  { id: "cars", name: "Cars", subcategories: [] },
  { id: "bikes", name: "Bikes", subcategories: [] },
  { id: "scooters", name: "Scooters", subcategories: [] },
  { id: "clothing", name: "Clothing", subcategories: [] },
  { id: "appliances", name: "Appliances", subcategories: [] },
  { id: "rent_a_friend", name: "Rent a Friend", subcategories: ["Male Friend", "Female Friend"] }
];

export default function UploadAdPage() {
  const navigate = useNavigate();
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pricePerDay, setPricePerDay] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [images, setImages] = useState([]);
  const [location, setLocation] = useState(null);
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    setImages([...images, ...files]);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('category', category);
      if (subcategory) formData.append('subcategory', subcategory);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('price_per_day', pricePerDay);
      formData.append('contact_number', contactNumber);
      formData.append('location', JSON.stringify({
        lat: location?.lat,
        lng: location?.lng,
        city,
        address
      }));
      images.forEach((image) => {
        formData.append('images', image);
      });

      const response = await fetch(`${API}/ads`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to create ad');

      toast.success('Ad created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to create ad');
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = categories.find(c => c.id === category);

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-20">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button
              data-testid="back-btn"
              variant="ghost"
              onClick={() => navigate(-1)}
              className="rounded-full"
            >
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Manrope' }}>Upload Ad</h1>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
          <div>
            <Label htmlFor="category" className="text-sm font-medium text-gray-700">Category</Label>
            <Select data-testid="category-select" value={category} onValueChange={setCategory} required>
              <SelectTrigger className="mt-1 h-12 rounded-lg bg-gray-50">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCategory?.subcategories.length > 0 && (
            <div>
              <Label htmlFor="subcategory" className="text-sm font-medium text-gray-700">Subcategory</Label>
              <Select data-testid="subcategory-select" value={subcategory} onValueChange={setSubcategory}>
                <SelectTrigger className="mt-1 h-12 rounded-lg bg-gray-50">
                  <SelectValue placeholder="Select subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {selectedCategory.subcategories.map((sub) => (
                    <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="title" className="text-sm font-medium text-gray-700">Title</Label>
            <Input
              data-testid="title-input"
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a clear title"
              required
              className="mt-1 h-12 rounded-lg bg-gray-50"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
            <Textarea
              data-testid="description-input"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your item in detail"
              required
              rows={4}
              className="mt-1 rounded-lg bg-gray-50"
            />
          </div>

          <div>
            <Label htmlFor="price" className="text-sm font-medium text-gray-700">Price per Day (₹)</Label>
            <Input
              data-testid="price-input"
              id="price"
              type="number"
              value={pricePerDay}
              onChange={(e) => setPricePerDay(e.target.value)}
              placeholder="500"
              required
              min="1"
              className="mt-1 h-12 rounded-lg bg-gray-50"
            />
          </div>

          <div>
            <Label htmlFor="contact" className="text-sm font-medium text-gray-700">Contact Number</Label>
            <Input
              data-testid="contact-input"
              id="contact"
              type="tel"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              placeholder="+91 XXXXXXXXXX"
              required
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
              placeholder="Mumbai"
              required
              className="mt-1 h-12 rounded-lg bg-gray-50"
            />
          </div>

          <div>
            <Label htmlFor="address" className="text-sm font-medium text-gray-700">Address</Label>
            <Input
              data-testid="address-input"
              id="address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Complete address"
              required
              className="mt-1 h-12 rounded-lg bg-gray-50"
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700">Images (Max 5)</Label>
            <div className="mt-1">
              <label
                htmlFor="images"
                data-testid="image-upload-label"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                <UploadIcon size={32} className="text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Click to upload images</p>
                <input
                  data-testid="image-input"
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        data-testid={`remove-image-${index}`}
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Button
            data-testid="submit-ad-btn"
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            {loading ? 'Creating...' : 'Create Ad'}
          </Button>
        </form>
      </div>
    </div>
  );
}