'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function LessonPlayerPage({
  params,
}: {
  params: { lessonId: string };
}) {
  const [isCompleted, setIsCompleted] = useState(false);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <Link href="/app" className="text-sm font-semibold text-indigo-600">
        ← Back to dashboard
      </Link>

      <div className="mt-8">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 shadow-sm">
          <div className="aspect-video bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-600 mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </div>
              <p className="text-white text-sm font-medium">Video player will appear here</p>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 border-b border-slate-200 pb-6">
            <h1 className="text-2xl font-bold text-slate-900">Introduction to Web Development</h1>
            <p className="mt-2 text-slate-600">Learn the fundamentals of HTML, CSS, and JavaScript</p>
          </div>

          <div className="mb-6">
            <h2 className="mb-3 text-lg font-semibold text-slate-900">Lesson Content</h2>
            <div className="space-y-3 text-slate-600">
              <p>Welcome to this comprehensive introduction to web development. In this lesson, you will learn:</p>
              <ul className="list-inside list-disc space-y-2 ml-2">
                <li>Basic HTML structure and semantic elements</li>
                <li>CSS styling and responsive design principles</li>
                <li>JavaScript fundamentals and DOM manipulation</li>
                <li>Best practices for modern web development</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-3 pt-6">
            <button
              onClick={() => setIsCompleted(!isCompleted)}
              className={`rounded-full px-6 py-3 font-semibold transition-colors ${
                isCompleted
                  ? 'bg-emerald-600 text-white'
                  : 'border border-slate-300 bg-white text-slate-900 hover:bg-slate-50'
              }`}
            >
              {isCompleted ? '✓ Completed' : 'Mark as complete'}
            </button>
            <Link
              href="/app"
              className="rounded-full bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-800"
            >
              Continue to dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
