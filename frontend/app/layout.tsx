import './globals.css'
import Link from 'next/link'

export const metadata = {
title: 'RentWala',
description: 'Rent anything near you'
}

export default function RootLayout({
children,
}: {
children: React.ReactNode
}) {
return ( <html lang="en"> <body className="bg-gray-100">

```
    {/* NAVBAR */}
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">

      <Link href="/" className="text-2xl font-bold text-blue-600">
        RentWala
      </Link>

      <div className="flex gap-6 items-center text-sm font-medium">

        <Link href="/">Home</Link>

        <Link href="/dashboard">
          Dashboard
        </Link>

        <Link href="/create-ad">
          Post Ad
        </Link>

        <Link href="/leaderboard">
          Leaderboard
        </Link>

        <Link href="/profile">
          Profile
        </Link>

      </div>
    </nav>

    {/* PAGE CONTENT */}
    <main className="max-w-7xl mx-auto p-6">
      {children}
    </main>

    {/* FOOTER */}
    <footer className="bg-white mt-10 border-t">
      <div className="max-w-7xl mx-auto p-6 text-center text-sm text-gray-500">
        © 2026 RentWala. All rights reserved.
      </div>
    </footer>

  </body>
</html>


)
}
