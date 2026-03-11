"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { FiUpload, FiX, FiMapPin, FiDollarSign, FiTag, FiFileText } from "react-icons/fi";
import toast from "react-hot-toast";

const categories = [
  "Cars", "Properties", "Mobiles", "Jobs", "Fashion", "Bikes", 
  "Electronics", "Furniture", "Pets", "Commercial Vehicles", "Other"
];

const cities = [
  "Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", 
  "Pune", "Hyderabad", "Ahmedabad", "Jaipur", "Lucknow"
];

export default function PostAdPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
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

  useEffect(() => {
    if (!token) {
      toast.error("Please login to post an ad");
      router.push("/login");
    }
  }, [token]);

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

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      toast.error("Please login to post an ad");
      return;
    }

    // Validation
    if (!formData.title || !formData.description || !formData.price || !formData.category || !formData.location) {
      toast.error("Please fill all required fields");
      return;
    }

    if (images.length === 0) {
      toast.error("Please add at least one image");
      return;
    }

    setLoading(true);

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

      images.forEach(image => {
        formDataToSend.append("images", image);
      });

      console.log("Sending ad data..."); // Debug log

      const res = await fetch(`${API_URL}/api/ads`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await res.json();
      console.log("Response:", data); // Debug log

      if (res.ok) {
        toast.success("Ad posted successfully!");
        // Force a refresh of the dashboard data
        router.push(`/ad/${data._id}`);
        router.refresh(); // This will refresh the page data
      } else {
        toast.error(data.error || "Failed to post ad");
      }
    } catch (error) {
      console.error("Post ad error:", error);
      toast.error("Failed to post ad. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Post Your Ad</h1>
          <p className="text-gray-600 mb-8">Fill in the details below to list your item</p>

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
                  placeholder="e.g., Yam
