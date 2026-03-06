export default function ListingCard() {
  return (
    <div className="border rounded-lg overflow-hidden bg-white text-black">

      <img
        src="https://via.placeholder.com/300"
        alt="item"
        className="w-full h-40 object-cover"
      />

      <div className="p-3">
        <p className="font-bold text-lg">₹500 / day</p>
        <p className="text-sm">Honda City for Rent</p>
        <p className="text-xs text-gray-500">Pune</p>
      </div>

    </div>
  );
}
