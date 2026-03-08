import "./globals.css";
import Navbar from "../components/Navbar";
import FloatingPostAd from "../components/FloatingPostAd";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>

        <Navbar />

        {children}

        <FloatingPostAd />

      </body>
    </html>
  );
}
