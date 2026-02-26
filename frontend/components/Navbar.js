import Link from "next/link";

export default function Navbar() {
  return (
    <div className="flex items-center justify-between p-4 shadow-md bg-white">
      <h1 className="text-xl font-bold">rentwala.vip</h1>
      <div className="flex gap-4 text-sm md:text-base items-center">
        <Link href="/select-location">Location</Link>
        <Link href="/login">Login</Link>
        <Link href="/messages">Messages</Link>
        <Link href="/post-ad" className="bg-green-500 px-4 py-2 text-white rounded">
          Post Ad
        </Link>
      </div>
    </div>
  );
}
