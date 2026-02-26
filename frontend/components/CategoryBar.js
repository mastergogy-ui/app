import Link from "next/link";

const categories = [
  { name: "Rent a Friend", slug: "rent-friend" },
  { name: "Rent a Bike", slug: "rent-bike" },
  { name: "Rent a Car", slug: "rent-car" },
  { name: "Rent Furniture", slug: "rent-furniture" },
  {
    name: "Rent Property",
    slug: "rent-property",
    children: ["flat", "pg", "villa", "office"],
  },
];

export default function CategoryBar() {
  return (
    <div className="flex gap-6 overflow-x-auto p-4 border-b bg-white">
      {categories.map((cat) => (
        <Link key={cat.slug} href={`/category/${cat.slug}`} className="cursor-pointer whitespace-nowrap">
          {cat.name}
        </Link>
      ))}
    </div>
  );
}
