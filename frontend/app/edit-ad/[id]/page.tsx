"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { motion } from "framer-motion";
import { FiUpload, FiX, FiMapPin, FiDollarSign, FiTag, FiFileText, FiArrowLeft } from "react-icons/fi";
import toast from "react-hot-toast";
import Link from "next/link";

type Ad = {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  location: string;
  city: string;
  images: string[];
};

const categories = [
  "Cars", "Properties", "Mobiles", "Jobs", "Fashion", "Bikes", 
  "Electronics", "Furniture", "Pets", "Commercial Vehicles", "Other"
];

const cities = [
  "Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", 
  "Pune", "Hyderabad", "Ahmedabad", "Jaipur", "Lucknow"
];

export default function EditAdPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    condition: "Good",
    location: "",
    city: ""
  });

  // Load ad data on mount
  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    loadAd();
  }, [params.id, token]);

  const loadAd = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://mahalakshmi.onrender.com";
      const res = await fetch(`${API_URL}/api/ads/${params.id}`);
      
      if (!res.ok) {
        throw new Error("Failed to load ad");
      }
      
      const data = await res.json();
      const ad = data.ad;
      
      // Check if user owns this ad
      if (ad.user._id !== user?.id) {
        toast.error("You don't have permission to edit this ad");
        router.push("/dashboard");
        return;
      }
      
      setFormData({
        title: ad.title || "",
        description: ad.description || "",
        price: ad.price?.toString() || "",
        category: ad.category || "",
        condition: ad.condition || "Good",
        location: ad.location || "",
        city: ad.city || ""
      });
      
      setExistingImages(ad.images || []);
      
    } catch (error) {
      console.error("Failed to load ad:", error);
      toast.error("Failed to load ad");
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (images.length + files.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    setImages([...images, ...files]);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      toast.error("Please login to edit ad");
      return;
    }

    if (!formData.title || !formData.description || !formData.price || !formData.category || !formData.location) {
      toast.error("Please fill all required fields");
      return;
    }

    setSaving(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://mahalakshmi.onrender.com";
      
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("condition", formData.condition);
      formDataToSend.append("location", formData.location);
      formDataToSend.append("city", formData.city || formData.location);
      
      // Send existing images as JSON string
      formDataToSend.append("existingImages", JSON.stringify(existingImages));

      // Append new images
      images.forEach(image => {
        formDataToSend.append("newImages", image);
      });

      const res = await fetch(`${API_URL}/api/ads/${params.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Ad updated successfully!");
        router.push(`/ad/${params.id}`);
        router.refresh();
      } else {
        toast.error(data.error || "Failed to update ad");
      }
    } catch (error) {
      console.error("Update ad error:", error);
      toast.error("Failed to update ad. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-white mb-6 hover:text-[#23e5db] transition-colors"
        >
          <FiArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Your Ad</h1>
          <p className="text-gray-600 mb-8">Update the details of your listing</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FiTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field pl-10"
                  placeholder="e.g., Yamaha R15 V3 for rent"
                  required
                />
              </div>
            </div>

            {/* Category and Condition */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
                <select
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  className="input-field"
                >
                  <option value="New">New</option>
                  <option value="Like New">Like New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                </select>
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="input-field pl-10"
                  placeholder="Enter price per day"
                  required
                  min="0"
                />
              </div>
            </div>

            {/* Location */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="input-field pl-10"
                    placeholder="e.g., Andheri West, Mumbai"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select city</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FiFileText className="absolute left-3 top-3 text-gray-400" />
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={5}
                  className="input-field pl-10 resize-none"
                  placeholder="Describe your item in detail..."
                  required
                />
              </div>
            </div>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Photos
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {existingImages.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img}
                        alt={`Existing ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add New Photos
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#23e5db] transition-colors">
                <input
                  type="file"
                  id="images"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label htmlFor="images" className="cursor-pointer">
                  <FiUpload className="mx-auto text-3xl text-gray-400 mb-2" />
                  <p className="text-gray-600 mb-1">Click to upload new photos</p>
                  <p className="text-sm text-gray-500">Maximum 5 images total</p>
                </label>
              </div>

              {/* New Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-5 gap-2">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-[#002f34] to-[#004d55] text-white py-3 px-4 rounded-lg font-semibold hover:from-[#004d55] hover:to-[#006b77] transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              
              <Link href={`/ad/${params.id}`} className="flex-1">
                <button
                  type="button"
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-300"
                >
                  Cancel
                </button>
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
