import Link from 'next/link';
import { notFound } from 'next/navigation';
import { courses } from '@/lib/mock-data';

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = courses.find((item) => item.slug === slug);

  if (!course) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <Link href="/courses" className="text-sm font-semibold text-indigo-600">
        ← Back to catalog
      </Link>

      <div className="mt-8 overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-sm">
        <img src={course.cover} alt={course.title} className="h-72 w-full object-cover" />
        <div className="grid gap-8 p-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="flex gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              <span>{course.category}</span>
              <span>{course.level}</span>
              <span>{course.language}</span>
            </div>
            <h1 className="mt-4 text-4xl font-black text-slate-900">{course.title}</h1>
            <p className="mt-3 text-xl text-slate-600">{course.subtitle}</p>
            <p className="mt-6 text-slate-600">{course.description}</p>

            <div className="mt-8">
              <h2 className="text-lg font-bold text-slate-900">What you will learn</h2>
              <ul className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
                {course.learningOutcomes.map((outcome) => (
                  <li key={outcome} className="rounded-2xl bg-slate-50 px-4 py-3">• {outcome}</li>
                ))}
              </ul>
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-bold text-slate-900">Curriculum</h2>
              <div className="mt-4 space-y-4">
                {course.curriculum.map((section) => (
                  <div key={section.title} className="rounded-2xl border border-slate-200 p-4">
                    <h3 className="font-semibold text-slate-900">{section.title}</h3>
                    <ul className="mt-3 space-y-2 text-sm text-slate-600">
                      {section.lessons.map((lesson) => (
                        <li key={lesson}>• {lesson}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <div className="text-sm text-slate-500">Instructor</div>
            <div className="mt-2 text-xl font-bold text-slate-900">{course.instructor}</div>
            <div className="mt-6 space-y-3 text-sm text-slate-600">
              <div className="flex justify-between"><span>Lessons</span><span>{course.lessons}</span></div>
              <div className="flex justify-between"><span>Duration</span><span>{course.duration}</span></div>
              <div className="flex justify-between"><span>Students</span><span>{course.students}</span></div>
              <div className="flex justify-between"><span>Rating</span><span>{course.rating} ★</span></div>
            </div>
            <button className="mt-8 w-full rounded-full bg-indigo-600 px-4 py-3 text-sm font-semibold text-white">
              Enroll now
            </button>
            <button className="mt-3 w-full rounded-full border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
              Continue learning
            </button>
          </aside>
        </div>
      </div>
    </main>
  );
}
