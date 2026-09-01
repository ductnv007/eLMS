export default function SignInPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center px-6 py-12">
      <div className="grid w-full gap-8 rounded-4xl border border-slate-200 bg-white p-8 shadow-sm md:grid-cols-2">
        <div className="rounded-3xl bg-slate-900 p-8 text-white">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Welcome back</p>
          <h1 className="mt-4 text-4xl font-black">Sign in to ELMS</h1>
          <p className="mt-4 text-slate-300">Continue your learning path and manage your progress with a single account.</p>
        </div>
        <form className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
            <input className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-0" placeholder="you@example.com" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
            <input type="password" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-0" placeholder="••••••••" />
          </div>
          <button type="submit" className="w-full rounded-full bg-indigo-600 px-4 py-3 text-sm font-semibold text-white">Sign in</button>
          <div className="text-center text-sm text-slate-500">No account yet? <a href="/auth/sign-up" className="font-semibold text-indigo-600">Create one</a></div>
        </form>
      </div>
    </main>
  );
}
