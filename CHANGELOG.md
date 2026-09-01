# Changelog

All notable changes to this project will be documented in this file.

## [0.6.0] - 2026-09-02

### Added
- Supabase integration with PostgreSQL schema (users, courses, lessons, quizzes, enrollments).
- Supabase client and data service layer for real backend connectivity.
- Updated auth service to support Supabase authentication.
- RLS policies for secure data access.
- Database migrations and schema documentation.

## [0.5.0] - 2026-09-02

### Added
- Admin course management page with course table and status display.
- Admin appearance settings page for brand customization.
- Admin service layer with mock course data and analytics.

## [0.4.0] - 2026-09-02

### Added
- Phase 4 quality gates and release notes.
- Added phase documentation for product/engineering roadmap.
- Confirmed typecheck, unit test, and production build flow.

## [0.3.0] - 2026-09-02

### Added
- Auth-aware app shell and role visibility.
- Theme configuration abstraction for brand settings.
- Admin layout and sign-in/sign-up entry points.

## [0.2.0] - 2026-09-02

### Added
- Data-source abstraction with `mock` and `supabase` hooks.
- Course service layer for catalog/detail retrieval.
- Mock-first repository pattern for future remote data adapters.

## [0.1.1] - 2026-09-02

### Added
- Initial mock-first learning UI and landing page.
- Course catalog and product detail pages.
- Learner dashboard and admin-management demo screens.

## [0.1.0] - 2026-09-01

### Added
- Initial project scaffold with Next.js App Router and TypeScript.
- Tailwind styling foundation.
- Mock-first architecture for catalog and learner flow.
- Git initialization and basic quality gates.
- Initial build and lint verification.
