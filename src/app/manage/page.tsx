const stats = [
  { label: 'Published', value: '15' },
  { label: 'Drafts', value: '7' },
  { label: 'Enrollments', value: '1,240' },
  { label: 'Completion', value: '84%' },
];

export default function ManageDashboardPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Admin</p>
          <h1 className="mt-2 text-4xl font-black text-slate-900">Manage platform</h1>
        </div>
        <button className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">New course</button>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="mt-4 text-3xl font-black text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Course overview</h2>
          <ul className="mt-5 space-y-3 text-sm text-slate-600">
            <li className="flex justify-between border-b pb-3"><span>Full-Stack Next.js Bootcamp</span><span>Published</span></li>
            <li className="flex justify-between border-b pb-3"><span>Product Design Systems</span><span>Draft</span></li>
            <li className="flex justify-between"><span>AI Workflows for Teams</span><span>Published</span></li>
          </ul>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Brand settings</h2>
          <div className="mt-5 space-y-4 text-sm text-slate-600">
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3"><span>Primary color</span><span className="h-5 w-5 rounded-full bg-indigo-600" /></div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3"><span>Brand name</span><span>ELMS</span></div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3"><span>Default mode</span><span>Light</span></div>
          </div>
        </div>
      </div>
    </main>
  );
}
