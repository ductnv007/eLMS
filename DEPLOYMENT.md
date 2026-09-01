# ELMS Production Deployment Guide

## Prerequisites

- GitHub repository with code pushed
- Vercel account (free tier is sufficient)
- Supabase project (optional, app works with mock data)

## Step 1: Prepare for Deployment

### Local Validation

```bash
# Make sure everything is committed
git status

# Run all quality checks
npm run typecheck
npm run test:run
npm run build
```

### Environment Variables

Create or update `.env.production` with your production settings:

```env
DATA_SOURCE=mock  # Or 'supabase' if using Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Step 2: Deploy to Vercel

### Option A: CLI Deployment (Recommended for quick setup)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# For production deployment
vercel --prod
```

### Option B: GitHub Integration (Recommended for continuous deployment)

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Click "Import Git Repository"
4. Select your GitHub repository
5. Click "Import"
6. Configure project settings:
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
7. Add Environment Variables (see below)
8. Click "Deploy"

### Environment Variables Setup in Vercel

1. After project is created, go to Settings → Environment Variables
2. Add each variable for appropriate environments:
   - All: `DATA_SOURCE`, `NEXT_PUBLIC_APP_URL`
   - Production/Preview: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Production only: `SUPABASE_SERVICE_ROLE_KEY`

3. Click "Save"

## Step 3: Verify Deployment

After deployment completes:

1. Visit your Vercel project URL
2. Test key flows:
   - Landing page loads
   - Course catalog works
   - Can navigate to course details
   - Admin pages accessible
   - Theme toggle works

## Step 4: Setup Custom Domain (Optional)

1. In Vercel Dashboard → Project Settings → Domains
2. Click "Add"
3. Enter your domain
4. Follow DNS configuration instructions for your registrar

## Step 5: Monitor Production

### Vercel Analytics

Monitor performance in Vercel Dashboard:
- Deployments
- Analytics
- Error logs
- Build times

### Production Debugging

View logs:
```bash
vercel logs --prod
```

View real-time deployment status:
```bash
vercel status
```

## Troubleshooting

### Build Fails

Check Vercel build logs:
1. Go to Vercel Dashboard
2. Click your project
3. Go to "Deployments"
4. Click recent deployment
5. Check "Build Logs"

Common issues:
- Missing environment variables → Add in Settings → Environment Variables
- Type errors → Run `npm run typecheck` locally
- Module not found → Ensure all imports are correct

### Application Crashes After Deploy

1. Check Vercel function logs
2. Verify environment variables are set correctly
3. Test locally: `npm run build && npm run start`
4. Check browser console for client-side errors

### Supabase Connection Issues

1. Verify `NEXT_PUBLIC_SUPABASE_URL` and key are correct
2. Check Supabase project is active
3. Verify Row Level Security policies allow access
4. App works without Supabase when variables not set (falls back to mock)

## Continuous Deployment

Once GitHub integration is set up:

1. Push to main branch
2. Vercel automatically builds and deploys
3. PR deployments created for preview
4. Monitor in Vercel Dashboard

## Rollback

If deployment has issues:

```bash
# Via CLI
vercel rollback

# Or in Dashboard: Deployments → Click previous version → Promote
```

## Performance Optimization

For production:

1. Enable caching in vercel.json
2. Use Vercel Analytics to monitor Core Web Vitals
3. Optimize images with Next.js Image component
4. Enable automatic ISR (Incremental Static Regeneration)

## Security Checklist

- [ ] Environment variables don't contain secrets in code
- [ ] `.env.local` and `.env.production` are in `.gitignore`
- [ ] Supabase Row Level Security policies are configured
- [ ] CORS is properly configured if using API routes
- [ ] Authentication is working as expected

## Next Steps

After initial deployment:

1. Setup monitoring and alerts
2. Configure CI/CD for automated tests
3. Implement feature flags for gradual rollouts
4. Setup database backups (if using Supabase)
5. Document deployment procedures for team
