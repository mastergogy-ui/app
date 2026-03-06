'use client'

import Link from 'next/link'

export default function HomePage() {
return ( <div className="space-y-10">

```
  {/* HERO SECTION */}
  <section className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white rounded-xl p-10 shadow-lg">
    <h1 className="text-4xl font-bold mb-3">
      GoGo Fantasy Points
    </h1>

    <p className="text-lg opacity-90 mb-6">
       earn virtual points, and post maximum ads.
    </p>

    <p className="bg-yellow-400/20 border border-yellow-400 text-yellow-200 p-3 rounded mb-6 text-sm">
      ⚠️ This platform uses virtual points only. 
    </p>

    <div className="flex gap-4">
      <Link
        href="/login"
        className="bg-white text-blue-700 px-5 py-2 rounded font-semibold hover:bg-gray-200"
      >
        User Login
      </Link>

      <Link
        href="/register"
        className="bg-black/30 px-5 py-2 rounded hover:bg-black/40"
      >
        Register
      </Link>

      <Link
        href="/admin/login"
        className="bg-purple-800 px-5 py-2 rounded hover:bg-purple-900"
      >
        Admin Login
      </Link>
    </div>
  </section>


  {/* FEATURES */}
  <section className="grid md:grid-cols-3 gap-6">

    <div className="bg-slate-900 p-6 rounded-lg shadow border border-slate-800">
      <h2 className="text-xl font-semibold text-cyan-400 mb-2">
        Predict Matches
      </h2>
      <p className="text-slate-400">
        Choose which team will win and earn points when your prediction is correct.
      </p>
    </div>

    <div className="bg-slate-900 p-6 rounded-lg shadow border border-slate-800">
      <h2 className="text-xl font-semibold text-cyan-400 mb-2">
        Earn Points
      </h2>
      <p className="text-slate-400">
        Points are awarded based on your correct predictions. Compete with other users.
      </p>
    </div>

    <div className="bg-slate-900 p-6 rounded-lg shadow border border-slate-800">
      <h2 className="text-xl font-semibold text-cyan-400 mb-2">
        Leaderboard
      </h2>
      <p className="text-slate-400">
        Climb the leaderboard and see how you rank against other players.
      </p>
    </div>

  </section>


  {/* CALL TO ACTION */}
  <section className="text-center py-10">

    <h2 className="text-2xl font-bold mb-3">
      Start Playing Now
    </h2>

    <p className="text-slate-400 mb-6">
      Create your account and start predicting matches today.
    </p>

    <Link
      href="/register"
      className="bg-cyan-600 px-6 py-3 rounded text-white font-semibold hover:bg-cyan-700"
    >
      Create Account
    </Link>

  </section>

</div>
```

)
}
