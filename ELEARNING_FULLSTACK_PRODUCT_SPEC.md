# E-Learning Web Platform — Full-Stack Product & Engineering Specification

**Document type:** Product + UX + Architecture + Data + Security + Delivery Specification  
**Status:** Implementation-ready baseline  
**Target delivery model:** GitHub source → Vercel Preview/Production → Supabase Postgres/Auth/Storage  
**Primary implementation style:** Modular monolith, data-driven, API-contract-first, mock-capable, multilingual, themeable  
**Primary objective:** Build a modern e-learning web application quickly without sacrificing module boundaries, security, maintainability, or the ability to replace mock data with real APIs later.

---

# PART 0 — EXECUTIVE DECISIONS

## 0.1 Recommended stack

The recommended implementation is a **full-stack modular monolith** rather than a separated frontend repository plus a dedicated Node backend in the MVP.

- **Frontend + Backend-for-Frontend:** Next.js 16 App Router + TypeScript strict mode.
- **UI:** React Server Components by default; Client Components only for interactive islands.
- **Styling:** Tailwind CSS + design tokens through CSS variables.
- **Reusable accessible components:** shadcn/ui-style components built on accessible primitives; component code remains owned by the repository.
- **Forms / validation:** shared Zod schemas; browser validation is UX only, server validation is authoritative.
- **Database:** Supabase Postgres.
- **Authentication:** Supabase Auth with SSR-compatible cookie session flow.
- **Authorization:** PostgreSQL Row Level Security as the final data-security boundary.
- **Object storage:** Supabase Storage.
- **Internationalization:** next-intl, locale-aware routes, JSON message catalogs for UI strings, translation tables for database content.
- **Deployment:** Vercel connected directly to GitHub.
- **Version control:** GitHub with protected `main`, feature branches, Pull Requests, Preview Deployments.
- **Unit / integration testing:** Vitest.
- **End-to-end testing:** Playwright.
- **Database security/integration validation:** Supabase CLI/local Postgres during full phase gates or a dedicated non-production Supabase environment.
- **Package manager:** pnpm.

### Why this architecture

This architecture optimizes for the user's stated goal: **code fast first, keep modules clean, then run a consolidated quality gate at the end of a phase**.

A separate NestJS/Express backend is deliberately not introduced in the MVP. It would duplicate routing, deployment, authentication/session handling, DTO mapping, build configuration, and CI work without adding proportional value for this scope. The application will nevertheless expose explicit module service and repository interfaces, plus `/api/v1` Route Handlers where a stable HTTP contract is useful, so a separate backend can be extracted later without rewriting the UI.

## 0.2 Architectural rules that are locked

1. UI components never query Supabase directly.
2. Supabase SDK usage is isolated inside infrastructure/data-access modules.
3. Every user-visible string must be localized; no text literals scattered through components.
4. All dynamic business data comes through a repository/service contract.
5. Every important domain must support `mock` and `supabase` data sources; `remote-api` can be added through the same contract.
6. Browser-visible Supabase credentials are publishable credentials only.
7. Service-role credentials must never reach the browser bundle.
8. RLS is mandatory for exposed application tables.
9. Authorization is never implemented only by hiding UI elements.
10. Public routes may cache aggressively; authenticated/session-refresh routes must not use unsafe shared ISR caching.
11. `main` is production-intent code; normal changes arrive by Pull Request.
12. Vercel Preview is the normal human review environment before merge.
13. Full E2E/database/security tests are consolidated at phase gates, not rerun after every small edit.
14. Cheap feedback is still allowed during development: typecheck, targeted lint, focused unit checks, or a build checkpoint may run when a module boundary is completed.
15. No raw arbitrary HTML from users is rendered without sanitization.
16. Theme customization is token-based; administrators cannot inject arbitrary CSS or JavaScript.

---

# PART 1 — PRODUCT VISION

## 1.1 Product definition

The product is a modern, responsive e-learning platform supporting:

- public course discovery;
- learner registration/login;
- enrollment;
- structured courses made of modules and lessons;
- article/video/file learning content;
- per-lesson and per-course progress;
- quizzes and attempts;
- learner dashboard;
- instructor/admin course management;
- multilingual UI and multilingual course content;
- customizable branding/theme colors;
- secure media/file access;
- desktop and mobile responsive layouts;
- a real-data adapter and a mock-data adapter using the same domain contracts.

The initial platform should feel like a modern SaaS/LMS product rather than a traditional admin CRUD site.

## 1.2 Primary success criteria

The MVP is successful when a new learner can:

1. open the public site in a supported language;
2. browse and search published courses;
3. open a localized course detail page;
4. create an account or sign in;
5. enroll in an available course;
6. continue learning from the last incomplete lesson;
7. consume article/video/file content;
8. mark or automatically record lesson progress;
9. complete a quiz and see a result;
10. see dashboard progress across enrolled courses;
11. change light/dark/system theme preference;
12. use the platform on desktop and mobile without layout breakage.

The MVP is also successful when an authorized instructor/admin can:

1. create a draft course;
2. define category, title, summary, cover, level, language variants, and publication status;
3. create ordered sections and lessons;
4. attach lesson media/files;
5. create quiz questions and answer choices;
6. preview a course before publication;
7. publish/unpublish a course;
8. inspect enrollment/progress at a useful summary level;
9. update site-level branding colors without editing source code.

## 1.3 Non-goals for the first implementation

The first implementation deliberately does not require:

- marketplace payouts;
- complex paid subscriptions;
- SCORM/xAPI/LTI compatibility;
- live classroom/video conferencing;
- advanced proctoring;
- AI tutoring;
- multi-tenant white-label billing;
- enterprise SSO;
- a separate microservice architecture;
- adaptive bitrate video encoding pipelines;
- a full drag-and-drop no-code website builder.

The architecture must not block these later, but they should not inflate the MVP.

---

# PART 2 — USERS, ROLES, AND AUTHORIZATION MODEL

## 2.1 Roles

Use four application roles:

### `learner`

Normal authenticated student.

Capabilities:

- read published course catalog;
- enroll when course policy permits;
- read own enrollments;
- consume course content for enrolled courses;
- update own lesson progress;
- create quiz attempts for self;
- read own quiz answers/results;
- update safe profile fields;
- manage own locale/theme preference.

### `instructor`

Teacher/course owner.

Capabilities:

- everything a learner can do;
- create courses;
- manage courses assigned to that instructor;
- manage sections, lessons, assets, and quizzes for assigned courses;
- preview own draft courses;
- see learner summaries for own courses.

### `content_manager`

Editorial role for organizations that need non-teacher operations.

Capabilities:

- manage course metadata/content across assigned or all courses according to policy;
- manage translations;
- upload learning assets;
- cannot change system security roles unless explicitly granted.

### `admin`

Platform administrator.

Capabilities:

- manage platform settings;
- manage roles and assignments;
- manage all courses and enrollments;
- manage theme/branding and available locales;
- read security/audit information;
- perform administrative operations through server-only endpoints/actions.

## 2.2 Role storage

Do not rely solely on editable client metadata.

Recommended database model:

- `profiles` — one public/application profile row per `auth.users` user;
- `roles` — role catalog;
- `user_roles` — many-to-many user-role assignments;
- optional `course_instructors` — explicit course ownership/assignment.

Role checks used by RLS should be implemented with carefully written SQL helper functions so the browser cannot self-elevate a role.

## 2.3 Authorization hierarchy

Authorization decisions are applied at multiple layers:

1. **Navigation/UI layer** — prevents showing actions a user cannot use.
2. **Server action/API layer** — validates identity, role, input, and business rules.
3. **Database RLS layer** — final enforcement of which rows can be selected/inserted/updated/deleted.
4. **Storage policies** — final enforcement of access to file objects.

A missing UI check is therefore inconvenient, not catastrophic; the database still rejects unauthorized operations.

---

# PART 3 — INFORMATION ARCHITECTURE AND ROUTES

All application routes use a top-level locale segment.

Example route pattern:

```text
/vi/...
/en/...
```

The default locale may redirect from `/` to the preferred/default locale.

## 3.1 Public routes

```text
/[locale]
/[locale]/courses
/[locale]/courses/[slug]
/[locale]/categories/[slug]
/[locale]/search
/[locale]/about
/[locale]/help
/[locale]/auth/sign-in
/[locale]/auth/sign-up
/[locale]/auth/forgot-password
/[locale]/auth/reset-password
/[locale]/auth/callback
```

### Public home page

Sections:

- header/navigation;
- hero with localized value proposition;
- featured courses;
- category rail/grid;
- continue-learning block if user is authenticated;
- popular/new course sections driven by data;
- platform benefits;
- learner testimonials as data records, not hardcoded markup;
- CTA;
- footer.

### Course catalog

Capabilities:

- keyword search;
- category filter;
- level filter;
- language filter;
- sort by newest/popularity/title;
- pagination or cursor pagination;
- URL-backed filter state for shareable links;
- responsive card/list presentation;
- skeleton loading;
- empty states;
- localized result count.

### Course detail

Sections:

- cover image;
- title/subtitle;
- instructor;
- level/category/language;
- short description;
- learning outcomes;
- prerequisites;
- curriculum outline;
- lesson count and estimated duration;
- enrollment CTA;
- progress/continue CTA for existing learner;
- published course only for anonymous users.

## 3.2 Learner routes

```text
/[locale]/app
/[locale]/app/my-courses
/[locale]/app/courses/[courseId]/learn/[lessonId]
/[locale]/app/courses/[courseId]/quiz/[quizId]
/[locale]/app/progress
/[locale]/app/profile
/[locale]/app/settings
```

### Learner dashboard

Primary widgets:

- continue learning;
- current enrollments;
- completion percentage;
- recently viewed lessons;
- completed courses;
- recent quiz results;
- quick profile/settings entry.

### Learning player

Desktop layout:

- top app bar;
- collapsible curriculum sidebar;
- main lesson canvas;
- lesson title/meta;
- content area;
- lesson resource/download area;
- previous/next lesson controls;
- progress indicator;
- completion control;
- mobile drawer for curriculum.

The player must support:

- `article` lesson;
- `video` lesson;
- `file` lesson;
- `quiz` lesson/linked quiz;
- later extension through a lesson-renderer registry.

## 3.3 Instructor/admin routes

```text
/[locale]/manage
/[locale]/manage/courses
/[locale]/manage/courses/new
/[locale]/manage/courses/[courseId]
/[locale]/manage/courses/[courseId]/content
/[locale]/manage/courses/[courseId]/learners
/[locale]/manage/courses/[courseId]/preview
/[locale]/manage/users
/[locale]/manage/localization
/[locale]/manage/appearance
/[locale]/manage/settings
/[locale]/manage/audit
```

The admin experience should use a fixed/collapsible left navigation rather than a single long page requiring excessive scrolling.

---

# PART 4 — UX AND VISUAL DESIGN SYSTEM

## 4.1 Visual direction

The default theme should be:

- modern SaaS/LMS;
- clean surfaces;
- clear hierarchy;
- generous but not wasteful spacing;
- subtle border/shadow usage;
- strong course imagery;
- readable lesson typography;
- low visual noise in the learning player;
- accessible contrast;
- responsive from mobile to wide desktop.

## 4.2 Layout primitives

Reusable layout primitives:

- `PublicShell`
- `AppShell`
- `ManageShell`
- `PageHeader`
- `Container`
- `Stack`
- `Cluster`
- `ResponsiveGrid`
- `SidebarLayout`
- `EmptyState`
- `LoadingState`
- `ErrorState`

Domain screens should compose these primitives rather than create one-off layout systems.

## 4.3 UI component families

Foundation:

- Button
- IconButton
- LinkButton
- Input
- Textarea
- Select
- Combobox
- Checkbox
- RadioGroup
- Switch
- Slider if needed for media controls
- Badge
- Avatar
- Card
- Tabs
- Accordion
- Dialog
- Drawer/Sheet
- DropdownMenu
- Tooltip
- Toast
- Progress
- Skeleton
- Breadcrumb
- Pagination
- DataTable
- Alert
- FormField
- ConfirmDialog

E-learning-specific:

- CourseCard
- CourseGrid
- CourseMeta
- InstructorBadge
- CurriculumTree
- LessonRow
- LessonStatusIcon
- LessonRenderer
- VideoLesson
- ArticleLesson
- FileLesson
- QuizRenderer
- QuestionCard
- AttemptResult
- ProgressRing/Bar
- ContinueLearningCard
- EnrollmentCard
- LearningOutcomeList

## 4.4 Accessibility

Target **WCAG 2.2 AA** behavior for core flows.

Requirements:

- semantic headings;
- keyboard navigation;
- visible focus states;
- accessible form labels and errors;
- dialog focus trapping;
- screen-reader labels for icon-only buttons;
- no color-only status communication;
- contrast-validated theme tokens;
- captions/transcripts field available for video lessons;
- reduced-motion preference respected;
- touch targets appropriate for mobile.

---

# PART 5 — THEME AND BRAND CUSTOMIZATION

## 5.1 Theme goals

The platform supports two separate concepts:

1. **Brand theme** controlled by admin and shared across the product.
2. **Display mode** controlled by the user: light, dark, or system.

## 5.2 Theme tokens

Use semantic CSS variables, not hardcoded utility colors throughout pages.

Example token model:

```text
--background
--foreground
--surface
--surface-elevated
--muted
--muted-foreground
--primary
--primary-foreground
--secondary
--secondary-foreground
--accent
--accent-foreground
--success
--warning
--danger
--border
--input
--ring
--radius
--shadow-strength
```

Color values should be stored and generated in a modern color space such as OKLCH where appropriate, with fallbacks/build tooling handled by the CSS pipeline.

## 5.3 Admin appearance settings

Admin can configure:

- brand name;
- logo/light logo;
- dark-mode logo if needed;
- favicon/app icon metadata reference;
- primary color;
- secondary color;
- accent color;
- border radius preset;
- default display mode;
- optional public hero image reference.

Settings are validated before persistence.

Do **not** support arbitrary injected CSS in the MVP.

## 5.4 Theme data model

`theme_settings`

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | singleton row or scoped key |
| `scope` | text | initially `global` |
| `brand_name` | text | localized brand name can remain app setting if needed |
| `logo_light_path` | text nullable | storage path |
| `logo_dark_path` | text nullable | storage path |
| `primary_color` | text | validated token value |
| `secondary_color` | text | validated token value |
| `accent_color` | text | validated token value |
| `radius_preset` | text | `none/sm/md/lg/xl` |
| `default_mode` | text | `light/dark/system` |
| `updated_by` | uuid | audit ownership |
| `updated_at` | timestamptz | audit timestamp |

RLS:

- public may read the safe global theme row;
- only admin may update it.

## 5.5 Runtime theme flow

1. Server loads safe theme configuration.
2. Theme values are transformed into semantic CSS variables.
3. User display mode chooses light/dark palette mapping.
4. Appearance screen previews changes locally before save.
5. Invalid contrast combinations show warnings and may be rejected for critical text/background pairs.

---

# PART 6 — INTERNATIONALIZATION: NO USER-VISIBLE HARDCODING

## 6.1 Supported locale baseline

Initial locales:

- `vi`
- `en`

The design must allow additional locales without restructuring routes or database tables.

## 6.2 UI translation rules

All user-visible copy lives in locale message catalogs.

Suggested structure:

```text
messages/
  vi/
    common.json
    navigation.json
    auth.json
    courses.json
    learning.json
    quiz.json
    admin.json
    validation.json
    errors.json
  en/
    ...same namespaces...
```

Forbidden patterns:

```tsx
<button>Đăng nhập</button>
throw new Error('Không tìm thấy khóa học')
```

Required pattern conceptually:

```text
t('auth.signIn')
t('errors.courseNotFound')
```

Internal logs may use stable English error codes; user-facing rendering converts codes to localized messages.

## 6.3 Dynamic content translations

UI dictionaries are not enough. Database content also requires localization.

Use translation tables for content that editors manage.

Examples:

- `course_translations`
- `category_translations`
- `section_translations` if section titles need localization
- `lesson_translations`
- `question_translations`
- `answer_option_translations`

Each translation row contains:

- parent entity ID;
- locale;
- localized title/text/content;
- localized slug where relevant;
- translation status.

Unique constraint:

```text
(parent_id, locale)
```

For slugs:

```text
(locale, slug)
```

must be unique within the relevant public namespace.

## 6.4 Fallback behavior

Rules:

1. Use requested locale if published translation exists.
2. Else use course default locale if translation exists.
3. Else hide unpublished/incomplete content from public routes rather than mix arbitrary languages silently.
4. Admin preview may show translation completeness and fallback indicators.

## 6.5 Localized formatting

Dates, times, numbers, percentages, and future currency values use locale-aware formatters. Do not manually concatenate date strings.

## 6.6 SEO localization

Public course pages should support:

- localized `title` and `description` metadata;
- locale-specific canonical URL;
- `hreflang` alternatives;
- localized slugs where configured;
- sitemap generation for published translations only.

---

# PART 7 — FRONTEND ARCHITECTURE

## 7.1 Rendering strategy

Use Server Components by default.

Use Client Components only when the feature requires:

- browser event handlers;
- local transient state;
- drag/drop;
- dialogs requiring client state;
- media APIs;
- optimistic interaction where server round-trip alone is poor UX.

Do not mark entire layouts as `use client` for convenience.

## 7.2 Data fetching strategy

Server-rendered page data flow:

```text
Route
  → module query/service
    → repository interface
      → selected adapter (mock / supabase / remote-api)
        → normalized domain DTO
          → page/component
```

No page imports `@supabase/supabase-js` directly.

## 7.3 Mutation strategy

Use Server Actions for first-party application form mutations when convenient.

Use Route Handlers when:

- an explicit HTTP API is required;
- a third-party webhook calls the application;
- mobile/external consumers may need the contract;
- a resource-oriented endpoint is clearer than a Server Action.

Both mutation paths call the same application services; business logic is not duplicated.

## 7.4 Client state

Avoid a global Redux-like store in the MVP.

State ownership:

- URL search params: catalog/search/filter/sort state;
- server/database: domain state;
- local component state: dialogs, drafts, tabs, non-persisted UI state;
- cookie/local preference: safe presentation preferences only;
- session: Supabase Auth SSR session.

If later real-time collaborative functionality needs a richer client server-state cache, introduce it as a localized module dependency rather than globally from day one.

## 7.5 Forms

Rules:

- schema shared where practical;
- validate in browser for UX;
- validate again on server;
- server owns authorization and canonical normalization;
- field errors use translation keys;
- unknown server errors map to a generic localized safe message;
- never expose raw Postgres errors to the learner.

---

# PART 8 — BACKEND / APPLICATION LAYER ARCHITECTURE

## 8.1 Modular monolith definition

Each business domain is a self-contained module with a public interface.

Suggested modules:

```text
auth
users
catalog
courses
learning
progress
quiz
enrollment
media
localization
theme
admin
audit
```

Each module may contain:

```text
domain/
application/
infrastructure/
presentation/
```

Not every module must use every folder if it adds no value, but boundaries must remain explicit.

## 8.2 Domain layer

Contains:

- domain types;
- stable enums/constants;
- pure validation/business rules when appropriate;
- domain-level interfaces that should not depend on Next.js or Supabase.

## 8.3 Application layer

Contains use cases such as:

- `listPublishedCourses`
- `getCourseByLocalizedSlug`
- `enrollLearner`
- `recordLessonProgress`
- `submitQuizAttempt`
- `createCourseDraft`
- `publishCourse`
- `updateThemeSettings`

Application services receive dependencies through interfaces rather than importing global clients throughout the codebase.

## 8.4 Infrastructure layer

Contains:

- Supabase repositories;
- mock repositories;
- remote API adapters if enabled;
- storage adapters;
- database row mappers;
- server-only service clients.

## 8.5 Presentation layer

Contains:

- module UI components;
- module view models;
- Server Actions;
- Route Handler adapters;
- input DTO parsers.

This prevents HTTP/React concerns from becoming the domain model itself.

---

# PART 9 — DATA-DRIVEN / MOCK-FIRST CONTRACT

## 9.1 Goal

The application must be usable before all real APIs/database flows are complete.

The same UI should work against:

- `mock` data;
- Supabase;
- future remote API.

## 9.2 Configuration

Server environment variable:

```text
DATA_SOURCE=mock|supabase|remote-api
```

Production defaults to `supabase`.

Preview branches may select either `mock` or a safe staging Supabase project depending on test intent.

## 9.3 Repository interface example

Conceptual contract:

```text
CourseRepository
- listPublished(query, locale)
- getBySlug(slug, locale)
- getById(id, locale, actor)
- createDraft(input, actor)
- update(id, input, actor)
- publish(id, actor)
```

Implementations:

```text
MockCourseRepository
SupabaseCourseRepository
RemoteApiCourseRepository
```

## 9.4 DTO normalization

Adapters normalize source-specific data into the same application DTO.

The UI should not care whether a course came from:

- static fixture JSON;
- Supabase rows;
- external REST/GraphQL.

## 9.5 Mock data requirements

Mock fixtures must include realistic edge cases:

- no courses;
- one course;
- many courses;
- long titles;
- missing optional cover;
- different locales;
- incomplete progress;
- completed progress;
- failed/passed quiz;
- private/unpublished course for authorization testing.

Mock data should not contain logic inside UI components.

## 9.6 API-contract-first rule

Any stable public/server boundary uses versioned DTOs and Zod validation.

Recommended path prefix:

```text
/api/v1
```

Breaking contract changes either preserve compatibility or introduce a new version.

---

# PART 10 — DATABASE MODEL

## 10.1 General SQL conventions

- Primary keys: UUID.
- Timestamps: `timestamptz` in UTC.
- Names: snake_case in SQL.
- Foreign keys are explicit.
- Important foreign-key columns are indexed.
- Statuses use text + CHECK constraints unless a PostgreSQL enum clearly adds value.
- Soft delete is not the default; use explicit archival/status semantics when product behavior requires it.
- Public slugs are normalized and constrained.
- Every table in an exposed schema has RLS enabled.
- Database migrations are committed to Git.

## 10.2 Core user tables

### `profiles`

| Field | Type | Notes |
|---|---|---|
| `id` | uuid PK | equals `auth.users.id` |
| `display_name` | text | safe public name |
| `avatar_path` | text nullable | storage path |
| `bio` | text nullable | optional |
| `preferred_locale` | text | default `vi` |
| `theme_mode` | text | `light/dark/system` |
| `created_at` | timestamptz | server default |
| `updated_at` | timestamptz | server managed |

### `roles`

| Field | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `code` | text unique | learner/instructor/content_manager/admin |
| `name_key` | text | translation key |

### `user_roles`

| Field | Type | Notes |
|---|---|---|
| `user_id` | uuid FK | auth user/profile |
| `role_id` | uuid FK | role |
| `created_by` | uuid nullable | admin actor |
| `created_at` | timestamptz | |

Unique:

```text
(user_id, role_id)
```

## 10.3 Catalog tables

### `categories`

| Field | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `status` | text | active/inactive |
| `sort_order` | int | stable display order |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

### `category_translations`

| Field | Type | Notes |
|---|---|---|
| `category_id` | uuid FK | |
| `locale` | text | |
| `name` | text | |
| `slug` | text | localized public slug |
| `description` | text nullable | |

Unique:

```text
(category_id, locale)
(locale, slug)
```

## 10.4 Course tables

### `courses`

| Field | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `status` | text | draft/review/published/archived |
| `visibility` | text | public/unlisted/private |
| `default_locale` | text | |
| `level` | text | beginner/intermediate/advanced/all |
| `category_id` | uuid nullable FK | |
| `cover_path` | text nullable | storage path |
| `estimated_minutes` | int | >= 0 |
| `is_featured` | boolean | |
| `published_at` | timestamptz nullable | |
| `created_by` | uuid FK | |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

### `course_translations`

| Field | Type | Notes |
|---|---|---|
| `course_id` | uuid FK | |
| `locale` | text | |
| `slug` | text | localized slug |
| `title` | text | |
| `subtitle` | text nullable | |
| `summary` | text | card/detail summary |
| `description` | text | long description |
| `learning_outcomes` | jsonb | array of localized strings |
| `prerequisites` | jsonb | array of localized strings |
| `seo_title` | text nullable | |
| `seo_description` | text nullable | |
| `translation_status` | text | draft/review/published |
| `updated_at` | timestamptz | |

Unique:

```text
(course_id, locale)
(locale, slug)
```

### `course_instructors`

| Field | Type | Notes |
|---|---|---|
| `course_id` | uuid FK | |
| `user_id` | uuid FK | |
| `is_primary` | boolean | |

Unique:

```text
(course_id, user_id)
```

## 10.5 Curriculum tables

### `course_sections`

| Field | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `course_id` | uuid FK | |
| `sort_order` | int | |
| `is_preview` | boolean | whether public preview is allowed |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

### `section_translations`

| Field | Type | Notes |
|---|---|---|
| `section_id` | uuid FK | |
| `locale` | text | |
| `title` | text | |

### `lessons`

| Field | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `section_id` | uuid FK | |
| `lesson_type` | text | article/video/file/quiz |
| `sort_order` | int | |
| `estimated_minutes` | int | |
| `is_preview` | boolean | optional public preview |
| `status` | text | draft/published |
| `video_path` | text nullable | storage or provider reference |
| `file_path` | text nullable | private storage reference |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

### `lesson_translations`

| Field | Type | Notes |
|---|---|---|
| `lesson_id` | uuid FK | |
| `locale` | text | |
| `title` | text | |
| `summary` | text nullable | |
| `content_format` | text | structured_json/markdown/plain |
| `content` | jsonb/text | depending normalized implementation |
| `transcript` | text nullable | video accessibility |

The implementation should prefer structured editor JSON or sanitized Markdown instead of arbitrary stored HTML.

## 10.6 Enrollment and progress tables

### `enrollments`

| Field | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid FK | |
| `course_id` | uuid FK | |
| `status` | text | active/completed/cancelled |
| `enrolled_at` | timestamptz | |
| `completed_at` | timestamptz nullable | |
| `last_lesson_id` | uuid nullable | resume optimization |
| `last_activity_at` | timestamptz | |

Unique active enrollment policy should prevent accidental duplicate enrollment.

### `lesson_progress`

| Field | Type | Notes |
|---|---|---|
| `user_id` | uuid FK | |
| `course_id` | uuid FK | denormalized for RLS/query speed |
| `lesson_id` | uuid FK | |
| `status` | text | not_started/in_progress/completed |
| `progress_percent` | smallint | 0..100 |
| `last_position_seconds` | int nullable | video resume |
| `started_at` | timestamptz nullable | |
| `completed_at` | timestamptz nullable | |
| `updated_at` | timestamptz | |

Unique:

```text
(user_id, lesson_id)
```

Course progress can initially be calculated from lessons and `lesson_progress`, optionally surfaced through a SQL view or RPC. Do not store a second mutable percentage unless performance later justifies it.

## 10.7 Quiz tables

### `quizzes`

| Field | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `course_id` | uuid FK | |
| `lesson_id` | uuid nullable FK | |
| `passing_score` | numeric | percentage |
| `max_attempts` | int nullable | null means policy-unlimited |
| `shuffle_questions` | boolean | |
| `show_answers_after_submit` | boolean | |
| `status` | text | draft/published |

### `questions`

| Field | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `quiz_id` | uuid FK | |
| `question_type` | text | single_choice/multiple_choice/true_false |
| `sort_order` | int | |
| `points` | numeric | > 0 |

### `question_translations`

| Field | Type | Notes |
|---|---|---|
| `question_id` | uuid FK | |
| `locale` | text | |
| `prompt` | text | |
| `explanation` | text nullable | |

### `answer_options`

| Field | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `question_id` | uuid FK | |
| `is_correct` | boolean | server-protected field |
| `sort_order` | int | |

### `answer_option_translations`

| Field | Type | Notes |
|---|---|---|
| `answer_option_id` | uuid FK | |
| `locale` | text | |
| `label` | text | |

### `quiz_attempts`

| Field | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `quiz_id` | uuid FK | |
| `user_id` | uuid FK | |
| `started_at` | timestamptz | |
| `submitted_at` | timestamptz nullable | |
| `score` | numeric nullable | server-calculated |
| `passed` | boolean nullable | server-calculated |
| `status` | text | in_progress/submitted |

### `quiz_answers`

| Field | Type | Notes |
|---|---|---|
| `attempt_id` | uuid FK | |
| `question_id` | uuid FK | |
| `selected_option_ids` | uuid[]/jsonb | normalized choice IDs |
| `awarded_points` | numeric nullable | server-calculated |

Correct answer flags must not be exposed to learners before policy allows it. Grading happens server-side or inside a secured database function.

## 10.8 Certificates

Optional but low-cost schema support:

### `certificates`

| Field | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid FK | |
| `course_id` | uuid FK | |
| `verification_code` | text unique | non-secret public verifier code |
| `issued_at` | timestamptz | |

Generation can be deferred while schema remains compatible.

## 10.9 System tables

### `app_settings`

Safe configuration only. Sensitive secrets do not belong here.

### `locale_settings`

Stores enabled locales, default locale, sort order.

### `theme_settings`

Defined earlier.

### `audit_logs`

Recommended fields:

- `id`;
- `actor_user_id` nullable;
- `action_code`;
- `entity_type`;
- `entity_id` nullable;
- `request_id` nullable;
- `metadata` jsonb with safe metadata only;
- `created_at`.

Never record passwords, access tokens, refresh tokens, service keys, or raw sensitive payloads.

---

# PART 11 — INDEXES AND QUERY PERFORMANCE

Minimum indexes should follow actual query patterns.

Recommended baseline:

```text
courses(status, published_at desc)
courses(category_id, status)
course_translations(locale, slug) UNIQUE
course_translations(course_id, locale) UNIQUE
category_translations(locale, slug) UNIQUE
course_sections(course_id, sort_order)
lessons(section_id, sort_order)
enrollments(user_id, status, last_activity_at desc)
enrollments(course_id, status)
lesson_progress(user_id, course_id, updated_at desc)
lesson_progress(user_id, lesson_id) UNIQUE
course_instructors(user_id, course_id)
quiz_attempts(user_id, quiz_id, submitted_at desc)
user_roles(user_id, role_id) UNIQUE
```

Search initially uses Postgres full-text/trigram capability only if needed by actual catalog size. For a small MVP, localized `ILIKE` search may be acceptable but should be encapsulated in the repository so a dedicated search implementation can replace it later.

Use pagination for admin/course lists; do not fetch thousands of rows into the browser.

---

# PART 12 — SUPABASE SECURITY MODEL

## 12.1 RLS baseline

RLS is mandatory on all tables reachable through an exposed schema/Data API.

Policies should be restrictive by default.

A table is not considered secure because the UI does not link to it.

## 12.2 Policy intent matrix

| Resource | Anonymous | Learner | Instructor | Admin |
|---|---|---|---|---|
| Published courses/translations | Read | Read | Read | Read/manage |
| Draft courses | No | No | Own/assigned | All |
| Profiles | Minimal safe read if needed | Own write | Own write | Managed read/write |
| Enrollments | No | Own read/create by policy | Course summary where assigned | All |
| Lesson progress | No | Own read/write | Aggregated assigned-course read | All |
| Quiz attempts | No | Own | Assigned-course summary | All |
| Correct answer flags | No | Only after server policy allows | Manage own quiz | All |
| Theme settings | Safe public read | Safe read | Safe read | Write |
| Audit logs | No | No | Limited if explicitly needed | Read |

## 12.3 Role helper functions

Recommended helper concepts:

```text
is_admin(user_id)
has_role(user_id, role_code)
is_course_instructor(user_id, course_id)
is_enrolled(user_id, course_id)
```

If security-definer functions are used, they must:

- have fixed/empty safe `search_path` handling;
- reference fully qualified tables;
- expose the minimum required capability;
- never accept a user ID and blindly trust it when `auth.uid()` should be authoritative.

## 12.4 Service role

The service-role secret:

- lives only in server-only environment variables;
- is never prefixed with `NEXT_PUBLIC_`;
- is never imported from client modules;
- is used only when bypassing RLS is explicitly required for administrative/system tasks;
- every bypass operation performs independent authorization before execution.

Normal application behavior should prefer user-scoped clients and RLS.

## 12.5 SSR session security

Use the Supabase SSR cookie pattern.

Requirements:

- session cookies transmitted over HTTPS in production;
- PKCE-compatible auth flow;
- server reads verified current user/session before protected actions;
- protected route rendering remains dynamic where session refresh can occur;
- do not put authenticated session-refresh responses into shared ISR caches.

## 12.6 Authentication features

MVP:

- email/password sign-up/sign-in;
- email verification according to project policy;
- forgot/reset password;
- logout;
- session refresh;
- route protection.

Optional later:

- Google OAuth;
- magic link;
- MFA;
- enterprise SSO.

Auth provider additions must not alter the `profiles` and application role model.

---

# PART 13 — STORAGE SECURITY

## 13.1 Buckets

Suggested buckets:

```text
public-course-assets
private-course-assets
avatars
branding
```

## 13.2 Public assets

Use public read only for assets that are truly public:

- published course covers;
- public branding images;
- safe instructor avatars if product policy allows.

## 13.3 Private assets

Private lesson downloads/video files require authenticated authorization.

Use signed URLs or authorized storage access according to the selected implementation.

Do not store permanent public URLs for private learning content.

## 13.4 Upload rules

Validate:

- MIME type;
- extension where useful;
- maximum file size;
- image dimensions if relevant;
- storage object path ownership;
- authorization to upload to the target course.

Never trust browser-supplied MIME alone.

## 13.5 Rich content safety

Course article content should be stored in structured editor JSON or Markdown.

If Markdown supports embedded HTML, disable or sanitize it.

If a rich editor emits HTML, sanitize server-side and/or render from a structured AST rather than trusting raw HTML.

---

# PART 14 — API SPECIFICATION

The first-party web app may use Server Actions internally, but a stable API contract should exist for operations likely to be consumed externally or useful for integration.

Base:

```text
/api/v1
```

## 14.1 Response envelope

Success concept:

```json
{
  "data": {},
  "meta": {},
  "requestId": "..."
}
```

Error concept:

```json
{
  "error": {
    "code": "COURSE_NOT_FOUND",
    "messageKey": "errors.courseNotFound",
    "details": null
  },
  "requestId": "..."
}
```

Do not expose SQL errors or stack traces in production responses.

## 14.2 Public catalog endpoints

```text
GET /api/v1/courses
GET /api/v1/courses/:id
GET /api/v1/courses/by-slug/:slug?locale=vi
GET /api/v1/categories
```

Course list query supports:

```text
q
category
level
locale
sort
page/cursor
limit
```

## 14.3 Learner endpoints

```text
GET  /api/v1/me
GET  /api/v1/me/enrollments
POST /api/v1/enrollments
GET  /api/v1/courses/:courseId/progress
PUT  /api/v1/lessons/:lessonId/progress
POST /api/v1/quizzes/:quizId/attempts
POST /api/v1/quiz-attempts/:attemptId/submit
GET  /api/v1/quiz-attempts/:attemptId
```

## 14.4 Admin/instructor endpoints

```text
POST   /api/v1/manage/courses
PATCH  /api/v1/manage/courses/:courseId
POST   /api/v1/manage/courses/:courseId/publish
POST   /api/v1/manage/courses/:courseId/sections
PATCH  /api/v1/manage/sections/:sectionId
POST   /api/v1/manage/sections/:sectionId/lessons
PATCH  /api/v1/manage/lessons/:lessonId
POST   /api/v1/manage/quizzes
PATCH  /api/v1/manage/quizzes/:quizId
PATCH  /api/v1/manage/theme
```

The UI is not required to call every route handler if an equivalent Server Action is more efficient. Both delegate to the same use case/service.

## 14.5 Validation

Every incoming mutation:

1. authenticates actor;
2. parses input schema;
3. authorizes operation;
4. applies business rule;
5. persists through repository;
6. writes audit event where required;
7. returns safe DTO.

---

# PART 15 — COURSE BUSINESS RULES

## 15.1 Publication

A course may publish only when:

- base course metadata is valid;
- at least one publishable translation exists;
- at least one section exists;
- at least one published lesson exists;
- referenced required assets exist;
- quiz integrity checks pass if quizzes are included.

Publication sets `published_at` on first publish.

## 15.2 Visibility

- `public`: catalog/search visible.
- `unlisted`: reachable by direct URL but not listed.
- `private`: only explicitly authorized/enrolled users/admin/instructor.

## 15.3 Curriculum ordering

Section and lesson ordering use integer `sort_order` managed by application service.

Reordering should update only affected siblings where practical.

## 15.4 Lesson completion

Article/file lessons:

- explicit “complete lesson” action is acceptable.

Video lessons:

- progress position may save periodically;
- completion can require a configurable threshold such as 90%, or explicit completion if policy is simpler;
- MVP may use explicit completion plus resume position to avoid unreliable autoplay/event edge cases.

Quiz lesson:

- completion may depend on submission or passing according to quiz/course policy.

## 15.5 Course completion

Default MVP rule:

- all required published lessons are completed;
- required quizzes meet passing policy.

Course completion is derived and then persisted as enrollment completion state by a server operation.

---

# PART 16 — QUIZ BUSINESS RULES AND SECURITY

## 16.1 Grading

Grading is never done exclusively in browser code.

Learner-facing question payload excludes correct-answer metadata until allowed by result policy.

Server submission flow:

1. verify attempt belongs to current user;
2. verify attempt is open;
3. verify max attempts/time policy;
4. load authoritative question/options;
5. calculate points;
6. persist answers/result atomically where possible;
7. close attempt;
8. update progress/course completion if applicable.

## 16.2 Attempt constraints

Prevent:

- submitting another user's attempt;
- changing submitted answers;
- exceeding max attempts;
- requesting correct flags from normal learner endpoints;
- submitting options that do not belong to the question.

## 16.3 Integrity

For important grading operations, prefer a transaction/database RPC or server-side sequence that cannot leave a half-submitted attempt under normal failure conditions.

---

# PART 17 — ERROR HANDLING

## 17.1 Error taxonomy

Use stable codes such as:

```text
AUTH_REQUIRED
FORBIDDEN
VALIDATION_FAILED
COURSE_NOT_FOUND
COURSE_NOT_PUBLISHED
NOT_ENROLLED
LESSON_NOT_ACCESSIBLE
QUIZ_ATTEMPT_LIMIT_REACHED
QUIZ_ATTEMPT_ALREADY_SUBMITTED
UPLOAD_TYPE_NOT_ALLOWED
RATE_LIMITED
INTERNAL_ERROR
```

## 17.2 User experience

- field errors appear beside fields;
- page errors have retry/navigation actions;
- not-found routes use localized 404;
- unauthorized routes distinguish sign-in-required from forbidden where safe;
- destructive actions require confirmation;
- optimistic UI rolls back on failed persistence;
- raw stack traces never reach production UI.

## 17.3 Request IDs

Generate/propagate a `requestId` for server operations to connect:

- user-facing error report;
- Vercel/server logs;
- audit event;
- support investigation.

---

# PART 18 — SECURITY HARDENING CHECKLIST

## 18.1 Secrets

- `.env*` files excluded from Git except documented `.env.example`.
- Vercel environment variables scoped separately for Development/Preview/Production.
- Supabase service-role secret server-only.
- Database passwords never exposed through browser environment variables.
- Secret rotation procedure documented.

## 18.2 Headers

Production security headers should include an appropriate baseline:

```text
Content-Security-Policy
Strict-Transport-Security
X-Content-Type-Options: nosniff
Referrer-Policy
Permissions-Policy
frame-ancestors through CSP
```

CSP must be tested against Next.js/Vercel and required external media domains rather than copied blindly.

## 18.3 XSS

- React escaping remains default.
- No uncontrolled `dangerouslySetInnerHTML`.
- Rich lesson content sanitized/structured.
- URLs validated against allowed schemes.

## 18.4 CSRF/session

- use secure SSR cookie session handling;
- state-changing endpoints validate authenticated actor;
- same-site/origin protections retained;
- use framework protections for Server Actions;
- explicit HTTP endpoints used from browser must enforce origin/token strategy appropriate to their auth mode.

## 18.5 Rate limiting and abuse

At minimum protect:

- sign-in/sign-up/reset flows through Supabase Auth rate-limit/bot settings;
- expensive search endpoints if abused;
- enrollment spam;
- quiz attempt creation/submission;
- upload endpoints;
- admin mutations.

Application logic must not rely on an in-memory counter in serverless functions as the only production rate limiter.

## 18.6 Authorization tests

Security tests explicitly attempt:

- learner reads another learner's progress;
- learner updates another learner's progress;
- learner reads draft course;
- learner publishes course;
- instructor edits unassigned course;
- anonymous user reads private lesson;
- learner reads correct quiz answers early;
- client invokes admin API manually;
- storage URL/path access outside actor authorization.

All must fail at the authoritative layer.

## 18.7 Dependency security

Phase gate includes:

- lockfile committed;
- dependency audit reviewed;
- no unnecessary packages;
- major security advisory blocks release where applicable.

---

# PART 19 — REPOSITORY STRUCTURE

Recommended repository:

```text
/
├─ .github/
│  ├─ workflows/
│  │  ├─ fast-check.yml
│  │  └─ full-gate.yml
│  ├─ pull_request_template.md
│  └─ CODEOWNERS                 # optional for team use
├─ docs/
│  ├─ architecture/
│  ├─ decisions/
│  └─ runbooks/
├─ messages/
│  ├─ vi/
│  └─ en/
├─ public/
├─ src/
│  ├─ app/
│  │  ├─ [locale]/
│  │  │  ├─ (public)/
│  │  │  ├─ app/
│  │  │  └─ manage/
│  │  └─ api/v1/
│  ├─ modules/
│  │  ├─ auth/
│  │  ├─ users/
│  │  ├─ catalog/
│  │  ├─ courses/
│  │  ├─ enrollment/
│  │  ├─ learning/
│  │  ├─ progress/
│  │  ├─ quiz/
│  │  ├─ media/
│  │  ├─ localization/
│  │  ├─ theme/
│  │  ├─ admin/
│  │  └─ audit/
│  ├─ shared/
│  │  ├─ ui/
│  │  ├─ config/
│  │  ├─ errors/
│  │  ├─ i18n/
│  │  ├─ lib/
│  │  ├─ security/
│  │  └─ validation/
│  └─ test/
├─ supabase/
│  ├─ migrations/
│  ├─ seed.sql
│  └─ config.toml
├─ tests/
│  ├─ e2e/
│  ├─ integration/
│  └─ security/
├─ .env.example
├─ next.config.ts
├─ package.json
├─ pnpm-lock.yaml
└─ README.md
```

## 19.1 Example module structure

```text
src/modules/courses/
├─ domain/
│  ├─ course.ts
│  └─ course.repository.ts
├─ application/
│  ├─ create-course.ts
│  ├─ get-course.ts
│  ├─ list-courses.ts
│  └─ publish-course.ts
├─ infrastructure/
│  ├─ mock-course.repository.ts
│  ├─ supabase-course.repository.ts
│  └─ course.mapper.ts
└─ presentation/
   ├─ actions/
   ├─ components/
   ├─ schemas/
   └─ view-models/
```

## 19.2 Dependency direction

Allowed direction:

```text
presentation → application → domain
infrastructure → domain/application interfaces
composition root → chooses infrastructure implementation
```

Forbidden:

```text
domain → Next.js
domain → Supabase SDK
shared UI → course-specific database code
page component → random SQL/Supabase query
```

---

# PART 20 — CODE QUALITY RULES

## 20.1 TypeScript

- strict mode enabled;
- avoid `any` unless isolated and documented;
- parse unknown external input before use;
- stable DTOs/types owned by modules;
- database rows mapped into domain/application DTOs rather than spread everywhere.

## 20.2 File size and responsibility

Prefer small focused files.

A file growing beyond approximately 250–350 lines should trigger a responsibility review, not an automatic split by line count. Large generated schema/type files are exceptions.

## 20.3 Naming

- components: PascalCase;
- functions/variables: camelCase;
- SQL: snake_case;
- stable error/permission codes: UPPER_SNAKE_CASE;
- translation keys: namespaced semantic keys.

## 20.4 No hardcoded configuration

Do not scatter:

- API URLs;
- colors;
- role labels;
- locale labels;
- pagination limits;
- upload limits;
- supported lesson types;
- user-visible status labels.

Place them in configuration/domain constants and localize display labels.

## 20.5 Comments

Comments explain why a non-obvious decision exists. They should not narrate obvious code.

---

# PART 21 — ENVIRONMENT CONFIGURATION

## 21.1 Environment classes

Use three practical environments:

### Development

Local Next.js, local/mock/Supabase dev data.

### Preview

Created from GitHub branch/PR by Vercel.

May use:

- mock data for pure UI branches;
- dedicated staging Supabase project for integrated branches.

### Production

Production Vercel deployment + production Supabase project.

Never point an untrusted preview branch at production with privileged credentials.

## 21.2 Example environment contract

```text
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY          # server only, only if required
DATA_SOURCE
DEFAULT_LOCALE
SUPPORTED_LOCALES
```

Optional integrations gain their own server-only variables.

`.env.example` contains names and safe example values, never secrets.

---

# PART 22 — GITHUB WORKFLOW

## 22.1 Branch strategy

```text
main
feature/<short-name>
fix/<short-name>
chore/<short-name>
```

Avoid long-lived develop branches unless a real release-management need appears.

## 22.2 Protected main

Recommended protections:

- Pull Request required;
- required status checks;
- no force push;
- no branch deletion;
- stale approvals dismissed if security-sensitive changes occur;
- production deployment only from `main`.

## 22.3 Pull Request content

Each PR records:

- scope;
- affected modules;
- schema migration status;
- screenshots/preview URL for UI work;
- test level executed;
- known deferred items that are explicitly out of current scope.

## 22.4 Commit style

Conventional-style examples:

```text
feat(courses): add localized course catalog
feat(progress): persist lesson completion
fix(auth): prevent protected route cache reuse
chore(db): add course RLS policies
```

Atomic enough to review, but do not create meaningless micro-commits after every line edit.

---

# PART 23 — VERCEL DELIVERY MODEL

## 23.1 Git integration

Expected flow:

```text
feature branch push
  → GitHub PR
    → Vercel Preview Deployment
      → review/phase gate
        → merge main
          → Vercel Production Deployment
```

## 23.2 Preview deployments

Every meaningful UI change should be reviewable on a Preview URL.

Preview should have:

- preview-scoped environment variables;
- no production service-role secret unless there is a proven safe need;
- preview protection enabled for sensitive/private work where plan capability allows;
- robots/indexing considerations for non-production environments.

## 23.3 Production deploy

Production release is blocked if the required full gate fails.

Rollback strategy:

- use Vercel deployment history for application rollback;
- database migrations require forward-safe/rollback-aware planning;
- destructive migration is never coupled casually to an app deploy.

---

# PART 24 — FAST CODING + CONSOLIDATED TEST STRATEGY

## 24.1 Principle

The development strategy deliberately avoids running the entire test suite after every small edit.

The rhythm is:

```text
Design locked
→ code a coherent module/phase quickly
→ use cheap checkpoint verification only when useful
→ finish phase implementation
→ run one consolidated full gate
→ collect all failures
→ classify root causes
→ fix in batches
→ rerun affected tests
→ run final full gate once clean
```

This keeps momentum while preventing an uncontrolled multi-day divergence.

## 24.2 Test levels

### Level A — development checkpoint

Fast and optional per coherent coding chunk:

- TypeScript typecheck for affected workspace;
- targeted lint;
- one focused unit test when a risky algorithm is added;
- local page smoke check.

Goal: catch syntax/type catastrophes cheaply.

### Level B — module checkpoint

Run when a module reaches a usable boundary:

- typecheck;
- targeted module tests;
- build if routing/server boundary changed;
- database migration syntax/apply check if schema changed.

Goal: prevent a broken module from poisoning later phases.

### Level C — phase full gate

Run after the phase is functionally complete:

1. clean install/lock integrity;
2. lint;
3. TypeScript typecheck;
4. unit tests;
5. repository/service contract tests;
6. database migration reset/apply;
7. RLS/security integration tests;
8. production build;
9. Playwright E2E core flows;
10. accessibility smoke tests;
11. dependency/security review;
12. Preview smoke verification.

This is the primary consolidated quality gate.

## 24.3 Failure batching

When Level C reports many failures:

1. do not fix tests randomly one by one;
2. cluster failures by root cause;
3. fix foundational/root failures first;
4. rerun only impacted groups during repair;
5. rerun full gate after the repair batch.

Typical clusters:

- schema/migration;
- auth/session;
- RLS;
- route/locale;
- type contract;
- component rendering;
- E2E selector/timing;
- environment configuration.

This maximizes the benefit of intelligent batch fixing.

## 24.4 When immediate testing is mandatory

Do not postpone verification for changes with high blast radius:

- migration that could destroy data;
- RLS/security policy;
- authentication/session handling;
- payment if later added;
- role elevation/admin permission;
- content upload access policy.

For these, run the smallest relevant security/integration check immediately, while still reserving the full suite for the phase gate.

---

# PART 25 — TEST SPECIFICATION

## 25.1 Unit tests

Focus on pure/high-value behavior:

- validation schemas;
- course publish readiness;
- progress calculation;
- quiz score calculation;
- localization fallback selection;
- theme token validation;
- permission helper logic that is not solely database-enforced;
- mappers/adapters.

Avoid testing trivial React implementation details.

## 25.2 Repository contract tests

Run the same behavioral contract against:

- mock repository;
- Supabase repository where practical.

Example course repository contract:

- published list excludes drafts;
- locale resolution works;
- slug lookup is deterministic;
- unauthorized update fails;
- publish transition follows business rules.

## 25.3 RLS/security tests

High priority.

Use real Postgres/Supabase behavior, not mocked authorization.

Test identities:

- anonymous;
- learner A;
- learner B;
- instructor A;
- instructor B;
- admin.

Assert both allowed and forbidden operations.

## 25.4 E2E core flows

### Flow 1 — public browse

```text
home
→ catalog
→ filter/search
→ course detail
```

### Flow 2 — authentication

```text
sign up/sign in test user
→ session persists
→ protected dashboard opens
→ logout
→ protected route redirects/denies
```

### Flow 3 — learner journey

```text
sign in
→ enroll
→ open first lesson
→ complete lesson
→ navigate next
→ dashboard progress updates
```

### Flow 4 — quiz

```text
open quiz
→ submit answers
→ score generated server-side
→ result shown
→ attempt saved
```

### Flow 5 — instructor/admin course management

```text
sign in as instructor
→ create draft course
→ add translation
→ add section/lesson
→ preview
→ publish
→ public course becomes visible
```

### Flow 6 — theme/i18n

```text
switch locale
→ nav/content UI changes language
→ no route corruption
→ switch dark/light
→ tokens update without unusable contrast
```

### Flow 7 — authorization denial

```text
learner tries direct admin URL/API
→ denied
instructor tries unrelated course edit
→ denied
```

## 25.5 Responsive E2E smoke

At least:

- mobile viewport;
- standard laptop;
- wide desktop.

Focus on:

- navigation;
- catalog;
- learning player;
- admin shell;
- dialogs/drawers.

---

# PART 26 — CI WORKFLOWS

## 26.1 `fast-check.yml`

Purpose: cheap confidence on normal PR pushes.

Suggested actions:

```text
checkout
pnpm install --frozen-lockfile
lint or changed-scope lint
typecheck
unit smoke / selected fast suite
```

If user wants maximum coding speed on feature branches, this workflow can be limited to PR updates instead of every local commit.

## 26.2 `full-gate.yml`

Trigger:

- manual dispatch;
- PR marked ready for merge;
- protected merge gate;
- optionally `main` post-merge verification.

Steps:

```text
checkout
pnpm install --frozen-lockfile
lint
typecheck
unit tests
start/reset Supabase test environment
apply migrations
seed deterministic fixtures
integration tests
RLS/security tests
next production build
Playwright install/cache strategy
E2E tests
artifact upload for Playwright reports
```

## 26.3 Build vs deploy separation

A Vercel Preview build is useful product verification but should not be the only quality gate. GitHub CI validates repeatable technical checks; Vercel validates deployment behavior and visual review.

---

# PART 27 — OBSERVABILITY AND AUDIT

## 27.1 Structured logging

Server logs should use structured records with:

- level;
- timestamp;
- requestId;
- action/module;
- actor ID only where appropriate;
- entity ID;
- stable error code;
- safe metadata.

Avoid logging full request bodies by default.

## 27.2 Audit events

Audit high-value actions:

- role assignment/removal;
- course publish/unpublish;
- destructive content deletion;
- theme/settings changes;
- admin enrollment changes;
- security-sensitive account actions where appropriate.

## 27.3 Health checks

Provide a lightweight server health endpoint or internal diagnostic that can verify:

- application is running;
- required configuration exists;
- optional database connectivity check without exposing details.

Do not reveal secrets or internal stack traces in health responses.

---

# PART 28 — PERFORMANCE SPEC

## 28.1 Rendering principles

- Server Components for data-heavy screens;
- defer client JS;
- use optimized images;
- lazy-load noncritical media;
- paginate catalog/admin lists;
- keep learning player responsive;
- avoid loading full curriculum/media payload if not required.

## 28.2 Caching

Public published content may use caching/revalidation safely where user session is not involved.

Authenticated pages are treated separately and avoid shared caching of session refresh responses.

Cache keys must account for locale and relevant content visibility.

## 28.3 Performance budgets

Operational targets, not release theatre:

- public pages should achieve healthy Core Web Vitals on normal modern devices/network conditions;
- no unnecessary large client bundles on server-renderable screens;
- main dashboard should not require loading every enrollment/lesson row;
- course images use responsive sizes;
- client component boundaries reviewed when bundle size grows.

---

# PART 29 — SEO SPEC FOR PUBLIC CONTENT

Public pages only.

Requirements:

- semantic metadata;
- localized title/description;
- Open Graph image/title/description;
- canonical URL;
- hreflang alternatives;
- sitemap for published content;
- robots directives;
- structured data for courses can be added if it accurately reflects actual content and policy.

Private learner/admin routes should not be indexed.

---

# PART 30 — ADMIN UX SPEC

## 30.1 Navigation

Desktop:

```text
Dashboard
Courses
Learners/Users
Localization
Appearance
Settings
Audit
```

Course edit sub-navigation:

```text
Overview
Content
Quiz
Localization
Learners
Preview
Publish
```

Avoid one enormous edit page.

## 30.2 Course editor

Course editor must provide:

- save state indicator;
- validation summary;
- draft/published badge;
- preview link;
- locale selector;
- translation completeness indicator;
- curriculum reorder controls;
- add section/lesson actions;
- clear unsaved-change behavior.

## 30.3 Appearance editor

Provide:

- color controls;
- preset suggestions;
- live preview card/header/buttons;
- light/dark previews;
- restore-to-default action;
- validation before save.

No arbitrary CSS textarea.

---

# PART 31 — LEARNER UX SPEC

## 31.1 Dashboard priority

The learner should immediately know:

1. what to continue;
2. how much is completed;
3. what was recently active;
4. where to find all enrolled courses.

Do not lead with vanity metrics.

## 31.2 Learning player behavior

- remember sidebar state locally;
- remember video position in database on reasonable intervals, not every second;
- previous/next navigation must follow curriculum order;
- completed lessons visibly differ from current/incomplete;
- mobile curriculum uses drawer;
- article width optimized for reading;
- downloads show file type/size when available;
- lesson progress update should feel immediate.

## 31.3 Empty states

Examples:

- no enrollments → browse courses CTA;
- no quiz attempts → start quiz CTA;
- no search results → clear filters CTA;
- no completed courses → continue learning CTA.

Every empty state uses localization keys.

---

# PART 32 — IMPLEMENTATION PHASES

## Phase 0 — Foundation and control plane

### Deliverables

- Next.js 16 TypeScript project;
- pnpm lockfile;
- Tailwind/design token foundation;
- shared UI primitives;
- `next-intl` locale routing for `vi/en`;
- module directory structure;
- environment schema/validation;
- Supabase browser/server client adapters;
- mock/supabase data source selection;
- GitHub workflows skeleton;
- Vercel project linked;
- `.env.example`;
- base error model;
- base logging/requestId;
- README run instructions.

### Acceptance

- `/vi` and `/en` render;
- locale switch works;
- light/dark/system works;
- mock data source can render a simple course card;
- build passes;
- Preview Deployment works.

## Phase 1 — Public shell, catalog, theme

### Deliverables

- public header/footer;
- home page;
- catalog;
- category filters;
- course detail;
- data-driven featured/popular sections;
- global theme settings load;
- responsive design;
- public SEO baseline.

### Data mode

Begin with mock adapter if real schema is not ready, then switch repository to Supabase without changing page components.

### Acceptance

- all public screens work in both locales;
- no visible string hardcoded in page/component code;
- mobile layout valid;
- catalog query encoded in URL;
- draft/private course absent from anonymous catalog.

## Phase 2 — Supabase schema, migrations, RLS foundation

### Deliverables

- profile/role schema;
- catalog/course/curriculum schema;
- enrollment/progress schema;
- quiz schema;
- theme/settings/audit schema;
- seed data;
- indexes;
- RLS enabled;
- initial policies;
- storage buckets/policies;
- generated database types if used.

### Acceptance

- migrations apply from clean database;
- seed produces deterministic demo content;
- anonymous can read only allowed published records;
- forbidden cross-user reads fail.

## Phase 3 — Authentication and profile

### Deliverables

- sign-up;
- sign-in;
- reset flow;
- logout;
- SSR session;
- protected app shell;
- profile screen;
- role-aware navigation;
- preferred locale/theme preference.

### Acceptance

- refresh retains session;
- protected routes reject anonymous access;
- user cannot self-assign admin role;
- profile RLS prevents cross-user modification.

## Phase 4 — Enrollment and learning player

### Deliverables

- enroll action;
- my courses;
- course player;
- article/video/file renderers;
- curriculum navigation;
- lesson progress;
- resume last lesson;
- dashboard continue-learning.

### Acceptance

- learner can enroll once;
- unenrolled learner cannot access protected private lesson;
- progress belongs only to current learner;
- completion updates dashboard.

## Phase 5 — Quiz engine

### Deliverables

- quiz renderer;
- single/multiple/true-false questions;
- attempt lifecycle;
- secure server grading;
- pass/fail result;
- max attempts policy;
- progress integration.

### Acceptance

- browser payload does not expose answers prematurely;
- another user cannot submit an attempt;
- score cannot be forged by client;
- attempt result persists.

## Phase 6 — Instructor/admin management

### Deliverables

- management shell;
- course list/create/edit;
- curriculum builder;
- lesson editor;
- media upload;
- quiz editor;
- translation editor;
- preview;
- publish action;
- appearance editor;
- basic learner/enrollment view.

### Acceptance

- instructor can edit assigned course only;
- admin can manage all;
- public catalog changes only after valid publication;
- appearance changes propagate through theme tokens.

## Phase 7 — Hardening and API stabilization

### Deliverables

- `/api/v1` stable endpoints required by product;
- rate-limit/security controls;
- security headers/CSP;
- audit events;
- error normalization;
- storage policy review;
- performance review;
- accessibility fixes;
- SEO localization finalization.

### Acceptance

- security denial matrix passes;
- critical API contracts validated;
- production build clean;
- no client bundle contains server secret.

## Phase 8 — Consolidated full QA and release

### Run full gate

- clean install;
- lint;
- typecheck;
- unit;
- repository contracts;
- DB reset/migrate/seed;
- RLS/security integration;
- build;
- E2E all core flows;
- responsive smoke;
- accessibility smoke;
- Preview review;
- production environment verification;
- release.

Failures are batched by root cause and fixed together before the final rerun.

---

# PART 33 — MODULE ACCEPTANCE CONTRACTS

## 33.1 Auth module

Done when:

- SSR login/logout works;
- session refresh safe;
- protected routes work;
- role read is authoritative;
- password reset works;
- UI localized.

## 33.2 Catalog module

Done when:

- published localized courses list;
- filters/search stable;
- URL state works;
- empty/loading/error states exist;
- mock and Supabase adapters satisfy same contract.

## 33.3 Course module

Done when:

- draft create/update/publish lifecycle works;
- localized metadata persists;
- instructor ownership enforced;
- public course lookup by localized slug works.

## 33.4 Learning/progress module

Done when:

- curriculum loads in order;
- learner access checked;
- progress writes idempotently;
- resume works;
- course completion derived correctly.

## 33.5 Quiz module

Done when:

- question rendering works;
- attempt constraints enforced;
- grading server authoritative;
- score/result saved;
- correct answer leakage prevented.

## 33.6 Theme module

Done when:

- admin edits allowed tokens;
- public read safe;
- light/dark/system works;
- no arbitrary CSS injection;
- contrast guard catches unusable critical combinations.

## 33.7 Localization module

Done when:

- UI strings use dictionaries;
- content translations use DB rows;
- fallback deterministic;
- localized metadata/slugs work;
- missing translation state is visible in management UI.

---

# PART 34 — DATABASE MIGRATION POLICY

## 34.1 Migration rule

Every schema change is a new committed migration.

Do not manually mutate production schema without representing the change in Git.

## 34.2 Safe migration sequence

For breaking schema evolution:

1. expand schema;
2. deploy code compatible with old/new where necessary;
3. backfill data;
4. switch reads/writes;
5. verify;
6. remove obsolete field in later migration.

This avoids coupling irreversible destructive changes to one deploy.

## 34.3 Seed data

Seed is deterministic and development/test-only unless explicitly designed otherwise.

Seed includes:

- roles;
- locale settings;
- default theme;
- demo categories;
- at least two localized demo courses;
- curriculum;
- quiz;
- test users only through supported test setup.

---

# PART 35 — PRIVACY AND DATA HANDLING

## 35.1 Data minimization

Store only profile information needed by product.

Do not place private personal information in public course/progress tables.

## 35.2 Logs

Avoid logging:

- passwords;
- JWTs;
- refresh tokens;
- authorization headers;
- service keys;
- full private lesson submissions unless required and protected.

## 35.3 Deletion/export readiness

Even if full privacy workflow is not UI-complete in MVP, schema design should keep user-owned data identifiable through `user_id` so later export/deletion workflows are possible.

---

# PART 36 — FAILURE AND RECOVERY BEHAVIOR

## 36.1 Supabase unavailable

Public page:

- render localized graceful error state;
- optional stale/cache behavior only if designed safely.

Learner mutation:

- show retryable error;
- do not claim progress saved before confirmation;
- preserve local draft where useful.

## 36.2 Upload failure

- show per-file status;
- allow retry;
- do not persist lesson reference until object is valid;
- clean orphan objects through admin maintenance/runbook if necessary.

## 36.3 Partial quiz submission failure

Use transactional/atomic server design where possible. A retry must not create duplicate final attempts or double-grade a submission.

## 36.4 Deployment rollback

App rollback should not assume database rollback. Database evolution must therefore use backwards-compatible deployment patterns for risky changes.

---

# PART 37 — PERFORMANCE AND SCALE ESCALATION PATH

The MVP architecture remains a modular monolith until a real bottleneck appears.

Possible future extraction points:

- video processing → worker/service;
- search → dedicated search service;
- analytics → event pipeline;
- notifications → queue/worker;
- certificate PDF generation → background job;
- large public API → dedicated backend;
- enterprise tenancy → scoped tenant architecture.

Extraction is justified by measurable load/ownership boundaries, not by architectural fashion.

---

# PART 38 — FUTURE-READY EXTENSION POINTS

Potential later modules that the current design should accommodate:

- payments/subscriptions;
- coupons;
- cohorts;
- instructor revenue;
- discussion/comments;
- assignments/manual grading;
- certificates;
- notifications/email;
- learning streaks/gamification;
- AI tutor;
- recommendation engine;
- SCORM/xAPI;
- organization/tenant support;
- native mobile client consuming `/api/v1`.

None should be implemented until product demand justifies it.

---

# PART 39 — DEFINITION OF DONE FOR MVP

The MVP is not considered done merely because pages render.

It is done when all of the following are true:

## Product

- public catalog/course pages complete;
- auth complete;
- learner dashboard complete;
- enrollment complete;
- learning player complete;
- progress complete;
- quiz complete;
- course administration complete at MVP scope;
- theme customization complete;
- vi/en complete for core UI.

## Architecture

- modules separated;
- UI does not directly query Supabase;
- mock and Supabase adapters follow contracts;
- API version boundary defined;
- no arbitrary cross-module database access from components.

## Data

- migrations committed;
- seed reproducible;
- indexes present;
- constraints present;
- translation model working.

## Security

- RLS enabled and tested;
- storage policies tested;
- secret boundary verified;
- admin/role elevation protected;
- quiz answer leakage prevented;
- security headers reviewed;
- preview/production env separated.

## Quality

- full gate green;
- production build green;
- E2E core flows green;
- responsive smoke green;
- accessibility smoke acceptable;
- no high-severity unresolved release-blocking issue.

## Delivery

- GitHub `main` protected;
- Vercel linked;
- Preview Deployment works;
- production environment variables set;
- production deploy successful;
- runbook/README sufficient for another developer/agent to continue.

---

# PART 40 — AI/DEVELOPER EXECUTION RULES

This section is intentionally explicit so a coding agent can execute the project with fewer interruptions.

## 40.1 Source of truth order

1. this specification;
2. committed architecture/ADR decisions added later;
3. database migrations;
4. API/domain contracts;
5. current code and tests.

If implementation discovers a contradiction, update the spec/ADR in the same change rather than silently diverging.

## 40.2 Agent coding rules

- Do not redesign the stack without a blocking reason.
- Do not add a separate backend merely for style preference.
- Do not access Supabase directly from random components.
- Do not hardcode user-facing strings.
- Do not hardcode theme colors across feature components.
- Do not add global state management unless a concrete flow needs it.
- Do not use service-role key from browser code.
- Do not disable RLS to “make it work.”
- Do not weaken security tests to pass CI.
- Do not run the entire E2E suite after every small file edit.
- Do finish a coherent module/phase before the full gate when risk permits.
- Do run focused checks immediately for auth/RLS/destructive migrations.
- Do batch full-gate failures by root cause.
- Do keep mocks realistic and contract-compatible.
- Do preserve vi/en behavior while adding features.
- Do update `.env.example` when configuration contract changes.
- Do commit migrations and generated database type changes together when coupled.

## 40.3 Stop-and-escalate conditions

Implementation should pause for a product/security decision only when the decision would materially change architecture or data semantics, for example:

- paid course/payment model;
- tenant isolation;
- public vs private course access policy that changes RLS;
- video hosting/provider change requiring a different media architecture;
- enterprise SSO;
- irreversible production data migration.

Normal UI/component choices should follow this spec and continue without repeatedly asking for approval.

---

# PART 41 — RECOMMENDED FIRST IMPLEMENTATION ORDER

For maximum visual progress and minimum blocking:

```text
1. Repository + Next.js + i18n + theme tokens
2. Mock data contracts + public shell
3. Public home/catalog/course detail using mocks
4. Vercel Preview
5. Supabase schema/migrations/RLS
6. Supabase repository adapters
7. Auth/profile
8. Enrollment/player/progress
9. Quiz
10. Instructor/admin
11. Theme editor/localization editor
12. API stabilization/security hardening
13. Consolidated full test gate
14. Batch fixes
15. Production deploy
```

This order gives a useful modern GUI early without coupling UI progress to unfinished backend work.

---

# PART 42 — REFERENCE USER FLOWS

## 42.1 First-time learner

```text
Landing page
→ change locale if desired
→ browse catalog
→ open course detail
→ click enroll/learn
→ sign up
→ verify/login
→ enrollment created
→ learning player opens
→ complete lesson
→ progress dashboard updates
```

## 42.2 Returning learner

```text
Sign in
→ dashboard
→ Continue learning
→ last course/lesson
→ resume video/article
→ next lesson
→ quiz
→ course completion
```

## 42.3 Instructor

```text
Sign in
→ Manage
→ New course
→ fill default-locale metadata
→ add secondary translation
→ create section
→ add lessons/assets
→ add quiz
→ Preview
→ fix validation
→ Publish
→ inspect learner summary
```

## 42.4 Admin theme update

```text
Manage → Appearance
→ choose primary/accent
→ preview light/dark
→ validation/contrast check
→ save
→ theme_settings updated
→ public/app shells render new semantic tokens
→ audit event created
```

---

# PART 43 — ACCEPTANCE SCENARIO MATRIX

| Scenario | Expected |
|---|---|
| Anonymous opens published course | Allowed |
| Anonymous opens draft course ID manually | Denied/not found |
| Learner opens own enrollment | Allowed |
| Learner reads another user's enrollment by guessed ID | Denied by RLS |
| Learner edits own display name | Allowed |
| Learner changes own role | Denied |
| Instructor edits assigned course | Allowed |
| Instructor edits another instructor's course | Denied |
| Admin updates theme | Allowed + audit |
| Learner updates theme | Denied |
| Learner submits quiz score from browser | Ignored; server computes score |
| Learner requests correct answers before allowed | Not exposed |
| User switches `vi` → `en` | Route and UI content localize |
| Missing optional translation | deterministic configured fallback/admin warning |
| Mock source enabled | Same UI works without Supabase domain data |
| Supabase source enabled | Same UI works against repositories |
| Preview branch pushed | Vercel Preview available |
| Full gate fails | merge/release blocked |

---

# PART 44 — PRODUCTION READINESS CHECKLIST

## Application

- [ ] Production build succeeds from clean checkout.
- [ ] `main` points to intended release SHA.
- [ ] No development-only banners/tools exposed.
- [ ] Error pages localized.
- [ ] Public metadata correct.

## Supabase

- [ ] Production project separate from non-production.
- [ ] All migrations applied in order.
- [ ] RLS enabled on exposed tables.
- [ ] Policies reviewed for anon/authenticated roles.
- [ ] Storage bucket access reviewed.
- [ ] Auth redirect URLs include production domain.
- [ ] Email/auth templates reviewed where used.
- [ ] Backups/recovery capability understood for selected plan.

## Vercel

- [ ] GitHub project connected.
- [ ] Production branch is `main`.
- [ ] Preview and production environment variables separated.
- [ ] Sensitive values protected.
- [ ] Custom domain configured if available.
- [ ] HTTPS active.
- [ ] Preview protection configured when needed.

## Security

- [ ] Service role absent from client bundle.
- [ ] RLS negative tests pass.
- [ ] Storage negative tests pass.
- [ ] Security headers reviewed.
- [ ] Authenticated pages avoid unsafe shared caching.
- [ ] Upload restrictions active.
- [ ] Quiz answer leakage test passes.

## UX

- [ ] Mobile navigation usable.
- [ ] Learning player responsive.
- [ ] Keyboard navigation smoke passes.
- [ ] Dark/light modes usable.
- [ ] vi/en core flows complete.
- [ ] Empty/loading/error states present.

## Quality

- [ ] Full gate green.
- [ ] Playwright report clean for core flows.
- [ ] No release-blocking dependency advisory unresolved.
- [ ] Preview manually checked before merge.

---

# PART 45 — FINAL ARCHITECTURE SUMMARY

The implementation should be understood as four clean layers:

```text
┌──────────────────────────────────────────────────────────────┐
│ UX / ROUTES                                                 │
│ Next.js App Router, Server Components, client islands       │
│ localized routes, theme tokens                              │
└───────────────────────┬──────────────────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────────────────┐
│ APPLICATION MODULES                                         │
│ auth, courses, enrollment, learning, progress, quiz, admin  │
│ use cases + validation + permission orchestration           │
└───────────────────────┬──────────────────────────────────────┘
                        │ repository/service contracts
┌───────────────────────▼──────────────────────────────────────┐
│ DATA / INFRASTRUCTURE ADAPTERS                              │
│ mock | Supabase | future remote API                         │
│ storage adapters, DTO mappers                               │
└───────────────────────┬──────────────────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────────────────┐
│ AUTHORITATIVE PLATFORM                                     │
│ Supabase Postgres + Auth + Storage + RLS                    │
└──────────────────────────────────────────────────────────────┘
```

Delivery wraps those layers with:

```text
GitHub branch/PR
→ fast CI
→ Vercel Preview
→ consolidated phase gate
→ batch fixes
→ merge protected main
→ Vercel Production
```

This keeps the project fast to build, simple enough for one developer or coding agent to reason about, secure at the data boundary, and clean enough to evolve into a larger LMS without throwing away the MVP.

---

# PART 46 — CURRENT TECHNICAL BASELINE REFERENCES

The architecture above is aligned with the current official guidance available at the time this specification was prepared:

- Next.js documentation: App Router, Server Components, Server Actions and Route Handlers.
- Supabase documentation: Next.js SSR auth, publishable client configuration, Postgres Row Level Security, secure data access, Storage authorization.
- Vercel documentation: Git-based Preview Deployments, environment-specific variables, deployment protection.
- next-intl documentation: App Router internationalization, locale routing, translations and localized content patterns.

Implementation should pin dependency versions in the lockfile and treat framework upgrades as explicit changes. In particular, server-auth helper packages whose upstream API is marked unstable/beta should be wrapped behind a small local adapter so a future package change does not spread across the application.

---

# END OF SPECIFICATION
