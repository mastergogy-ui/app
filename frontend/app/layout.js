import "./globals.css";

export const metadata = {
  title: "rentwala.vip",
  description: "Location-first rental marketplace",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
