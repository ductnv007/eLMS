import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';
import { getCurrentUser } from '@/lib/auth-service';

export function SiteHeader() {
  const user = getCurrentUser();

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold text-slate-900">
          ELMS
        </Link>
        <nav className="hidden gap-6 text-sm font-medium text-slate-600 md:flex">
          <Link href="/courses">Courses</Link>
          <Link href="/app">Dashboard</Link>
          <Link href="/manage">Manage</Link>
          <Link href="/about">About</Link>
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
            {user.role}
          </span>
          <Link href="/auth/sign-in" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">
            Sign in
          </Link>
          <Link href="/auth/sign-in" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">
            Join now
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-4">
        <div>
          <h3 className="mb-4 text-lg font-semibold text-slate-900">ELMS</h3>
          <p className="text-sm text-slate-600">Modern learning for product teams, creators, and operators.</p>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Explore</h4>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>Courses</li>
            <li>Certificates</li>
            <li>Community</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Company</h4>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>About</li>
            <li>Careers</li>
            <li>Press</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Support</h4>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>Help center</li>
            <li>Privacy</li>
            <li>Terms</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
