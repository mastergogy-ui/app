"use client";

import { motion } from "framer-motion";
import { 
  FiCar, 
  FiHome, 
  FiSmartphone, 
  FiBriefcase, 
  FiShoppingBag, 
  FiTruck, 
  FiMonitor, 
  FiCoffee,
  FiHeart
} from "react-icons/fi";

const categories = [
  { name: "Cars", icon: FiCar, color: "from-blue-500 to-blue-600" },
  { name: "Properties", icon: FiHome, color: "from-green-500 to-green-600" },
  { name: "Mobiles", icon: FiSmartphone, color: "from-purple-500 to-purple-600" },
  { name: "Jobs", icon: FiBriefcase, color: "from-orange-500 to-orange-600" },
  { name: "Fashion", icon: FiShoppingBag, color: "from-pink-500 to-pink-600" },
  { name: "Bikes", icon: FiTruck, color: "from-red-500 to-red-600" },
  { name: "Electronics", icon: FiMonitor, color: "from-indigo-500 to-indigo-600" },
  { name: "Furniture", icon: FiCoffee, color: "from-yellow-500 to-yellow-600" },
  { name: "Pets", icon: FiHeart, color: "from-teal-500 to-teal-600" },
];

export default function Categories({ onSelectCategory }: { onSelectCategory?: (category: string) => void }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {categories.map((category, index) => {
        const Icon = category.icon;
        return (
          <motion.div
            key={category.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05, y: -5 }}
            onClick={() => onSelectCategory?.(category.name)}
            className={`category-card bg-gradient-to-br ${category.color} cursor-pointer`}
          >
            <Icon className="w-8 h-8 mb-2" />
            <span className="font-semibold text-center">{category.name}</span>
          </motion.div>
        );
      })}
    </div>
  );
}
