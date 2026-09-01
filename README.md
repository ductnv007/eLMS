# ELMS - E-Learning Management System

A modern, full-stack e-learning platform built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Course Catalog** - Browse and search available courses
- **Learner Dashboard** - Track enrollment and learning progress
- **Lesson Player** - Interactive lesson viewing with progress tracking
- **Admin Management** - Course and appearance settings
- **Authentication** - Supabase auth integration (with mock fallback)
- **Dark Mode** - Theme toggle support
- **Responsive Design** - Mobile-first Tailwind CSS styling

## 🏗️ Architecture

- **Mock-first architecture** - Works without backend configuration
- **Data source abstraction** - Easy swap between mock, Supabase, and APIs
- **Service layer** - Clean separation of concerns
- **Type-safe** - Full TypeScript support

## 📋 Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### Production Build

```bash
npm run build
npm run start
```

## 🧪 Testing & Quality

```bash
# Run tests
npm run test:run

# Type checking
npm run typecheck

# Linting
npm run lint
```

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

```env
# Data source: mock, supabase, or remote-api
DATA_SOURCE=mock

# Supabase (optional - app works without these)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App URL (auto-set in production)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📦 Deployment

### Deploy to Vercel

The easiest way to deploy:

```bash
npm i -g vercel
vercel
```

Or connect your GitHub repository directly to Vercel:
1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Select your GitHub repository
4. Configure environment variables
5. Click "Deploy"

### Environment Variables in Production

Add these in Vercel Dashboard → Settings → Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATA_SOURCE` (set to "supabase" for real backend)

## 📚 Project Structure

```
eLMS/
├── src/
│   ├── app/              # Next.js app routes
│   ├── components/       # Reusable React components
│   ├── lib/
│   │   ├── mock-data.ts        # Mock data for demo
│   │   ├── data-source.ts      # Source abstraction
│   │   ├── course-service.ts   # Course business logic
│   │   ├── auth-service.ts     # Auth & user logic
│   │   ├── enrollment-service.ts  # Enrollment logic
│   │   ├── lesson-service.ts   # Lesson logic
│   │   └── supabase-*          # Supabase integration
│   └── test/            # Test setup
├── public/              # Static assets
├── supabase/            # Database migrations
├── vercel.json         # Vercel deployment config
└── package.json
```

## 🎯 Phase Status

- **v0.1** - Core mock app foundation
- **v0.2** - Data source abstraction
- **v0.3** - Auth-aware shell & theme
- **v0.4** - Quality gates & CI/CD
- **v0.5** - Admin flows (courses, appearance)
- **v0.6** - Supabase integration
- **v0.7** - Learner enrollment & lesson player
- **v0.8** - Quiz system & production deployment

## 📝 License

MIT
