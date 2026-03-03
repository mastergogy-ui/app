import Link from 'next/link';

export default function HomePage() {
  return (
    <section className="card space-y-4">
      <h1 className="text-3xl font-bold text-cyan-400">GoGo Fantasy Points</h1>
      <p className="text-slate-300">Predict match winners, manage your virtual points, and compete on the leaderboard.</p>
      <p className="rounded border border-amber-500/60 bg-amber-500/10 p-3 text-amber-200">
        This platform uses virtual points only. No real money involved.
      </p>
      <div className="flex gap-3">
        <Link href="/login" className="rounded bg-cyan-600 px-4 py-2">User Login</Link>
        <Link href="/register" className="rounded bg-slate-700 px-4 py-2">Register</Link>
        <Link href="/admin/login" className="rounded bg-purple-700 px-4 py-2">Admin Login</Link>
      </div>
    </section>
  );
}
