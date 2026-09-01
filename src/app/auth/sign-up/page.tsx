export default function SignUpPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center px-6 py-12">
      <div className="w-full rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-4xl font-black text-slate-900">Create your account</h1>
        <form className="mt-8 grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Full name</label>
            <input className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-0" placeholder="Your name" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
            <input className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-0" placeholder="you@example.com" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
            <input type="password" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-0" placeholder="••••••••" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Role</label>
            <select className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-0">
              <option>Learner</option>
              <option>Instructor</option>
              <option>Admin</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="w-full rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white">Create account</button>
          </div>
        </form>
      </div>
    </main>
  );
}
