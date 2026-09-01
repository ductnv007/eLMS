import Link from 'next/link';
import { categories, courses, testimonials, dashboardStats, learnerProgress } from '@/lib/mock-data';
import { SiteFooter, SiteHeader } from '@/components/site-shell';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <SiteHeader />

      <main>
        <section className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
          <div>
            <span className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-700">
              Built for modern learning
            </span>
            <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-900 md:text-6xl">
              Learn faster. Ship smarter. Grow together.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-slate-600">
              ELMS helps teams and learners build practical skills through structured courses, guided progress, and real-world outcomes.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/courses" className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white">
                Explore courses
              </Link>
              <Link href="/app" className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700">
                View dashboard
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-8 text-sm text-slate-600">
              <div><span className="block text-2xl font-bold text-slate-900">18k+</span> learners</div>
              <div><span className="block text-2xl font-bold text-slate-900">240+</span> lessons</div>
              <div><span className="block text-2xl font-bold text-slate-900">94%</span> completion</div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60">
            <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 p-6 text-white">
              <p className="text-sm text-indigo-200">Continue learning</p>
              <h2 className="mt-4 text-2xl font-bold">Full-Stack Next.js Bootcamp</h2>
              <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/20">
                <div className="h-full w-[72%] rounded-full bg-emerald-400" />
              </div>
              <div className="mt-4 flex justify-between text-sm text-indigo-100">
                <span>72% complete</span>
                <span>Next lesson</span>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {dashboardStats.map((stat) => (
                <div key={stat.label} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-600">{stat.label}</span>
                  <span className="text-lg font-bold text-slate-900">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-6 py-10">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Browse by category</h2>
              <Link href="/courses" className="text-sm font-semibold text-indigo-600">View all</Link>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
              {categories.map((category) => (
                <div key={category} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                  <p className="font-semibold text-slate-700">{category}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Featured courses</h2>
            <Link href="/courses" className="text-sm font-semibold text-indigo-600">See catalog</Link>
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {courses.map((course) => (
              <article key={course.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <img src={course.cover} alt={course.title} className="h-48 w-full object-cover" />
                <div className="p-6">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <span>{course.category}</span>
                    <span>{course.level}</span>
                  </div>
                  <h3 className="mt-3 text-xl font-bold text-slate-900">{course.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{course.summary}</p>
                  <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                    <span>{course.instructor}</span>
                    <span>{course.rating} ★</span>
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-lg font-bold text-slate-900">{course.price}</span>
                    <Link href={`/courses/${course.slug}`} className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
                      Learn more
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-slate-900 py-16 text-white">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="text-2xl font-bold">Your learning dashboard</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {learnerProgress.map((item) => (
                <div key={item.title} className="rounded-3xl border border-slate-700 bg-slate-800 p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{item.title}</h3>
                    <span className="text-xs uppercase tracking-wide text-emerald-300">{item.status}</span>
                  </div>
                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-700">
                    <div className="h-full rounded-full bg-emerald-400" style={{ width: `${item.progress}%` }} />
                  </div>
                  <p className="mt-4 text-sm text-slate-300">{item.progress}% completed</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16">
          <h2 className="text-2xl font-bold text-slate-900">What learners say</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-3xl border border-slate-200 bg-white p-6">
                <p className="text-slate-600">“{t.quote}”</p>
                <div className="mt-6 border-t border-slate-200 pt-4">
                  <p className="font-semibold text-slate-900">{t.name}</p>
                  <p className="text-sm text-slate-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
