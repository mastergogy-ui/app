import Navbar from "@/components/Navbar";
import CategoryBar from "@/components/CategoryBar";

export default function Home() {
  return (
    <>
      <Navbar />
      <CategoryBar />
      <div className="p-4">Welcome to rentwala.vip</div>
    </>
  );
}
