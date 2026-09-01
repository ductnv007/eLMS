import Link from 'next/link';
import { listCourses } from '@/lib/course-service';

export default function CoursesPage() {
  const items = listCourses();

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Catalog</p>
          <h1 className="mt-2 text-4xl font-black text-slate-900">All courses</h1>
        </div>
        <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">
          {items.length} results
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {items.map((course) => (
          <article key={course.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <img src={course.cover} alt={course.title} className="h-44 w-full object-cover" />
            <div className="p-5">
              <div className="flex justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
                <span>{course.category}</span>
                <span>{course.level}</span>
              </div>
              <h2 className="mt-3 text-xl font-bold text-slate-900">{course.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{course.summary}</p>
              <div className="mt-4 flex justify-between text-sm text-slate-500">
                <span>{course.lessons} lessons</span>
                <span>{course.duration}</span>
              </div>
              <div className="mt-5 flex items-center justify-between">
                <span className="font-bold text-slate-900">{course.price}</span>
                <Link href={`/courses/${course.slug}`} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                  Open
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
