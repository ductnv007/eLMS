export default function AppearancePage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-4xl font-black text-slate-900">Appearance settings</h1>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-slate-700">Brand name</label>
          <input className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" defaultValue="ELMS" />
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-slate-700">Primary color</label>
          <input type="color" className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50" defaultValue="#4f46e5" />
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">Default display mode</label>
          <select className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <option>Light</option>
            <option>Dark</option>
            <option>System</option>
          </select>
        </div>
      </div>
    </main>
  );
}
