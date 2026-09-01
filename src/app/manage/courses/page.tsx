import { getAdminCourseRows } from '@/lib/admin-service';

export default function ManageCoursesPage() {
  const rows = getAdminCourseRows();

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Manage</p>
          <h1 className="mt-2 text-4xl font-black text-slate-900">Courses</h1>
        </div>
        <button className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">New course</button>
      </div>

      <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-6 py-4 font-semibold">Course</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Learners</th>
              <th className="px-6 py-4 font-semibold">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-slate-200">
                <td className="px-6 py-4 font-medium text-slate-900">{row.title}</td>
                <td className="px-6 py-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${row.status === 'Published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {row.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">{row.learners}</td>
                <td className="px-6 py-4 text-slate-900">{row.revenue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
