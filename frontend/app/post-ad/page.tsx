'use client';

export default function PostAdPage() {
  return (
    <div className="max-w-xl mx-auto bg-slate-900 p-6 rounded-lg space-y-4">

      <h1 className="text-2xl font-bold">Post Item for Rent</h1>

      <input
        type="text"
        placeholder="Item title"
        className="w-full p-2 rounded text-black"
      />

      <input
        type="number"
        placeholder="Rent price per day"
        className="w-full p-2 rounded text-black"
      />

      <select className="w-full p-2 rounded text-black">
        <option>Select Category</option>
        <option>Cars</option>
        <option>Properties</option>
        <option>Mobiles</option>
        <option>Fashion</option>
        <option>Bikes</option>
        <option>Electronics</option>
        <option>Commercial Vehicles</option>
        <option>Furniture</option>
        <option>Rent a Friend</option>
      </select>

      <input
        type="text"
        placeholder="Location"
        className="w-full p-2 rounded text-black"
      />

      <input type="file" />

      <button className="bg-blue-600 px-4 py-2 rounded w-full">
        Post Rent Ad
      </button>

    </div>
  );
}
