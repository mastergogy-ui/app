import './globals.css';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100">
        <Navbar />
        <main className="mx-auto w-full max-w-6xl p-4">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
