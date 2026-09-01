import Link from 'next/link';
import { dashboardStats, learnerProgress } from '@/lib/mock-data';
import { getCurrentUser } from '@/lib/auth-service';

export default async function LearnerDashboardPage() {
  const user = await getCurrentUser();

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Learner</p>
          <h1 className="mt-2 text-4xl font-black text-slate-900">My dashboard</h1>
        </div>
        <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
          {user.name}
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat) => (
          <div key={stat.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="mt-4 text-3xl font-black text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Enrolled courses</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          {learnerProgress.map((item) => (
            <div key={item.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">{item.title}</h2>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{item.status}</span>
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-indigo-600" style={{ width: `${item.progress}%` }} />
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                <span>{item.progress}% complete</span>
                <Link href={`/app/lesson/lesson-${item.title.replace(/\s+/g, '-').toLowerCase()}`} className="font-semibold text-indigo-600 hover:text-indigo-700">
                  Continue →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
