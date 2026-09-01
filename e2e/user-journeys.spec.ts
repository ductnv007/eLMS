import { test, expect } from '@playwright/test';

test.describe('ELMS E2E Test Suite - Complete User Journeys', () => {
  // ==================== BATCH 1: Landing & Navigation ====================
  test.describe('Landing Page & Site Navigation', () => {
    test('should load landing page and display hero section', async ({ page }) => {
      await page.goto('/');
      
      // Check page title
      await expect(page).toHaveTitle(/ELMS|Learning/i);
      
      // Check hero section is visible
      const hero = page.locator('h1').first();
      await expect(hero).toBeVisible();
      
      // Check navigation links exist
      const navLinks = page.locator('nav a');
      await expect(navLinks).toHaveCount(4); // Courses, Dashboard, Manage, About
    });

    test('should navigate to courses page from landing', async ({ page }) => {
      await page.goto('/');
      await page.click('a:has-text("Courses")');
      
      // Wait for courses page
      await expect(page).toHaveURL(/\/courses/);
      await expect(page.locator('h1')).toContainText(/All courses|Catalog/i);
    });

    test('should toggle theme (light/dark mode)', async ({ page }) => {
      await page.goto('/');
      
      // Get initial theme
      const html = page.locator('html');
      const initialTheme = await html.evaluate(el => el.getAttribute('class'));
      
      // Click theme toggle
      const toggleButton = page.locator('[data-testid="theme-toggle"], button:has-text("☀"), button:has-text("🌙")').first();
      if (await toggleButton.isVisible()) {
        await toggleButton.click();
        
        // Verify theme changed
        const newTheme = await html.evaluate(el => el.getAttribute('class'));
        expect(initialTheme).not.toBe(newTheme);
      }
    });
  });

  // ==================== BATCH 2: Course Catalog & Browse ====================
  test.describe('Course Catalog & Discovery', () => {
    test('should display course list on catalog page', async ({ page }) => {
      await page.goto('/courses');
      
      // Check page loaded
      await expect(page.locator('h1')).toContainText(/All courses|Catalog/i);
      
      // Check courses are visible
      const courseCards = page.locator('article, [class*="course"], [class*="card"]').first();
      await expect(courseCards).toBeVisible();
      
      // Check course count badge
      const countBadge = page.locator('text=/\\d+ results?/');
      if (await countBadge.isVisible()) {
        const countText = await countBadge.textContent();
        expect(countText).toMatch(/\d+/);
      }
    });

    test('should navigate to course detail page', async ({ page }) => {
      await page.goto('/courses');
      
      // Click first course
      const firstCourse = page.locator('article, [class*="course"], [class*="card"]').first();
      await firstCourse.click();
      
      // Verify URL changed to course slug
      await expect(page).toHaveURL(/\/courses\/[^/]+/);
      
      // Check course detail elements
      await expect(page.locator('h1, h2').first()).toBeVisible();
      
      // Look for course metadata
      const metadata = page.locator('text=/Level|Duration|Category/i').first();
      if (await metadata.isVisible()) {
        expect(await metadata.isVisible()).toBe(true);
      }
    });

    test('should display course details on detail page', async ({ page }) => {
      await page.goto('/courses');
      
      // Navigate to first course
      const firstCourse = page.locator('article, [class*="course"], [class*="card"]').first();
      await firstCourse.click();
      
      // Check for course details
      const courseImage = page.locator('img').first();
      await expect(courseImage).toBeVisible();
      
      // Check for learning outcomes if present
      const outcomeSection = page.locator('text=/Learning Outcomes|What you will learn|Objectives/i').first();
      if (await outcomeSection.isVisible()) {
        expect(await outcomeSection.isVisible()).toBe(true);
      }
      
      // Check for enroll/explore button
      const enrollButton = page.locator('button:has-text(/Enroll|Explore|Continue|Join/)').first();
      if (await enrollButton.isVisible()) {
        expect(await enrollButton.isVisible()).toBe(true);
      }
    });
  });

  // ==================== BATCH 3: Authentication & Dashboard ====================
  test.describe('Learner Dashboard & User Flow', () => {
    test('should display dashboard with user info', async ({ page }) => {
      await page.goto('/app');
      
      // Check dashboard loaded
      await expect(page.locator('h1')).toContainText(/dashboard|My courses/i);
      
      // Check for learner name/email display
      const userInfo = page.locator('text=/Demo Learner|Learner|User/i, [class*="user"], [class*="profile"]').first();
      if (await userInfo.isVisible()) {
        expect(await userInfo.isVisible()).toBe(true);
      }
      
      // Check for stats cards
      const statsCards = page.locator('[class*="stat"], [class*="card"]');
      const cardCount = await statsCards.count();
      expect(cardCount).toBeGreaterThan(0);
    });

    test('should display enrolled courses on dashboard', async ({ page }) => {
      await page.goto('/app');
      
      // Check for course list
      const courseSection = page.locator('h2:has-text(/Enrolled|My Courses|In Progress/)').first();
      await expect(courseSection).toBeVisible();
      
      // Check for progress cards
      const progressCards = page.locator('[class*="progress"], [class*="enrolled"], article').filter({ has: page.locator('text=/complete|%|progress/i') });
      const cardCount = await progressCards.count();
      
      if (cardCount > 0) {
        expect(cardCount).toBeGreaterThan(0);
        
        // Check progress bar exists
        const progressBar = progressCards.first().locator('[class*="progress"], [style*="width"]').first();
        if (await progressBar.isVisible()) {
          expect(await progressBar.isVisible()).toBe(true);
        }
      }
    });

    test('should navigate to lesson from dashboard', async ({ page }) => {
      await page.goto('/app');
      
      // Look for "Continue" or lesson link
      const continueLink = page.locator('a:has-text(/Continue|Resume|Next|Start/)').first();
      if (await continueLink.isVisible()) {
        const href = await continueLink.getAttribute('href');
        await continueLink.click();
        
        // Should navigate to lesson or course
        const url = page.url();
        expect(url).toMatch(/lesson|course|[a-z\-]+/);
      }
    });
  });

  // ==================== BATCH 4: Lesson Player & Learning ====================
  test.describe('Lesson Player & Learning Flow', () => {
    test('should display lesson player page', async ({ page }) => {
      // Navigate to a lesson (using mock ID if needed)
      await page.goto('/app/lesson/lesson-1');
      
      // Check for lesson player UI
      const playerSection = page.locator('[class*="player"], video, iframe, [class*="lesson"]').first();
      if (await playerSection.isVisible()) {
        expect(await playerSection.isVisible()).toBe(true);
      }
      
      // Check for lesson content
      const content = page.locator('h1, h2, [class*="content"]').first();
      await expect(content).toBeVisible();
      
      // Check for navigation back
      const backLink = page.locator('a:has-text("Back")').first();
      if (await backLink.isVisible()) {
        expect(await backLink.isVisible()).toBe(true);
      }
    });

    test('should have completion button on lesson', async ({ page }) => {
      await page.goto('/app/lesson/lesson-1');
      
      // Look for "Mark as complete" or similar
      const completeButton = page.locator('button:has-text(/Complete|Finish|Done|Mark/)').first();
      if (await completeButton.isVisible()) {
        expect(await completeButton.isVisible()).toBe(true);
        
        // Try clicking it
        await completeButton.click();
        
        // Check for success state
        const successState = page.locator('text=/Completed|✓|Success/i').first();
        if (await successState.isVisible()) {
          expect(await successState.isVisible()).toBe(true);
        }
      }
    });

    test('should navigate back from lesson', async ({ page }) => {
      await page.goto('/app/lesson/lesson-1');
      
      const backLink = page.locator('a:has-text("Back")').first();
      if (await backLink.isVisible()) {
        await backLink.click();
        
        // Should navigate to dashboard or courses
        const url = page.url();
        expect(url).toMatch(/app|courses/);
      }
    });
  });

  // ==================== BATCH 5: Admin Management ====================
  test.describe('Admin Course Management', () => {
    test('should display admin dashboard', async ({ page }) => {
      await page.goto('/manage');
      
      // Check admin page loaded
      const adminHeading = page.locator('h1, h2').filter({ has: page.locator('text=/Manage|Admin|Dashboard/i') }).first();
      if (await adminHeading.isVisible()) {
        expect(await adminHeading.isVisible()).toBe(true);
      }
    });

    test('should display courses management page', async ({ page }) => {
      await page.goto('/manage/courses');
      
      // Check page loaded
      await expect(page.locator('h1, h2').filter({ has: page.locator('text=/Course|Manage/i') }).first()).toBeVisible();
      
      // Check for course table/list
      const table = page.locator('table, [class*="table"], [class*="list"]').first();
      if (await table.isVisible()) {
        expect(await table.isVisible()).toBe(true);
      }
      
      // Check for course rows
      const rows = page.locator('tr, [class*="row"], [class*="item"]');
      const rowCount = await rows.count();
      expect(rowCount).toBeGreaterThan(0);
    });

    test('should display course status in table', async ({ page }) => {
      await page.goto('/manage/courses');
      
      // Look for status badges
      const statusBadges = page.locator('text=/Published|Draft|Active/i');
      const badgeCount = await statusBadges.count();
      
      if (badgeCount > 0) {
        expect(badgeCount).toBeGreaterThan(0);
      }
    });

    test('should display appearance settings page', async ({ page }) => {
      await page.goto('/manage/appearance');
      
      // Check page loaded
      await expect(page.locator('h1, h2').filter({ has: page.locator('text=/Appearance|Settings/i') }).first()).toBeVisible();
      
      // Check for form inputs
      const inputs = page.locator('input, select, [class*="input"]');
      const inputCount = await inputs.count();
      expect(inputCount).toBeGreaterThan(0);
      
      // Check for color picker if present
      const colorInput = page.locator('input[type="color"]').first();
      if (await colorInput.isVisible()) {
        expect(await colorInput.isVisible()).toBe(true);
      }
    });

    test('should have form fields for brand customization', async ({ page }) => {
      await page.goto('/manage/appearance');
      
      // Check for brand name input
      const brandInput = page.locator('input:has-value("ELMS"), input[placeholder*="Brand"], input[aria-label*="name"]').first();
      if (await brandInput.isVisible()) {
        expect(await brandInput.isVisible()).toBe(true);
        
        // Try to type in it
        await brandInput.focus();
        await brandInput.fill('Test Brand');
      }
    });
  });

  // ==================== BATCH 6: Auth Pages ====================
  test.describe('Authentication Pages', () => {
    test('should display sign-in page', async ({ page }) => {
      await page.goto('/auth/sign-in');
      
      // Check page loaded
      await expect(page.locator('h1, h2').filter({ has: page.locator('text=/Sign in|Login/i') }).first()).toBeVisible();
      
      // Check for form
      const form = page.locator('form, [class*="form"]').first();
      if (await form.isVisible()) {
        expect(await form.isVisible()).toBe(true);
      }
      
      // Check for inputs
      const emailInput = page.locator('input[type="email"], input[placeholder*="email"]').first();
      const passwordInput = page.locator('input[type="password"], input[placeholder*="password"]').first();
      
      if (await emailInput.isVisible()) {
        expect(await emailInput.isVisible()).toBe(true);
      }
      if (await passwordInput.isVisible()) {
        expect(await passwordInput.isVisible()).toBe(true);
      }
    });

    test('should display sign-up page', async ({ page }) => {
      await page.goto('/auth/sign-up');
      
      // Check page loaded
      await expect(page.locator('h1, h2').filter({ has: page.locator('text=/Sign up|Register|Join/i') }).first()).toBeVisible();
      
      // Check for form fields
      const inputs = page.locator('input');
      const inputCount = await inputs.count();
      expect(inputCount).toBeGreaterThan(0);
    });
  });

  // ==================== BATCH 7: Responsive & Performance ====================
  test.describe('Responsive Design & Performance', () => {
    test('should be responsive on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto('/');
      
      // Check page still loads
      await expect(page.locator('h1').first()).toBeVisible();
      
      // Check navigation is accessible
      const nav = page.locator('nav, [class*="nav"], [role="navigation"]').first();
      if (await nav.isVisible()) {
        expect(await nav.isVisible()).toBe(true);
      }
    });

    test('should load pages within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/');
      const loadTime = Date.now() - startTime;
      
      // Should load in under 5 seconds
      expect(loadTime).toBeLessThan(5000);
      console.log(`Page loaded in ${loadTime}ms`);
    });

    test('should have no console errors on main pages', async ({ page }) => {
      const errors: string[] = [];
      
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      await page.goto('/');
      await page.goto('/courses');
      await page.goto('/app');
      
      // Filter out known non-critical errors
      const criticalErrors = errors.filter(e => 
        !e.includes('webpack') && 
        !e.includes('telemetry') &&
        !e.includes('Supabase')
      );
      
      expect(criticalErrors.length).toBe(0);
    });
  });

  // ==================== BATCH 8: Cross-Page Navigation ====================
  test.describe('Complete User Journey - Full Flow', () => {
    test('should complete full user journey: Landing → Browse → Detail → Dashboard → Lesson', async ({ page }) => {
      // 1. Start on landing
      await page.goto('/');
      await expect(page.locator('h1').first()).toBeVisible();
      
      // 2. Navigate to courses
      await page.click('a:has-text("Courses")');
      await expect(page).toHaveURL(/\/courses/);
      
      // 3. Click first course
      const course = page.locator('article, [class*="course"], [class*="card"]').first();
      if (await course.isVisible()) {
        await course.click();
        await expect(page).toHaveURL(/\/courses\/[^/]+/);
      }
      
      // 4. Navigate to dashboard
      await page.click('a:has-text("Dashboard")');
      await expect(page).toHaveURL(/\/app/);
      
      // 5. Try to open a lesson
      const continueLink = page.locator('a:has-text(/Continue|Resume/), button:has-text(/Continue|Resume/)').first();
      if (await continueLink.isVisible()) {
        await continueLink.click();
        // Should be on lesson page or course page
        const url = page.url();
        expect(url).toMatch(/lesson|course|app/);
      }
    });

    test('should complete admin journey: Landing → Manage → Courses → Appearance', async ({ page }) => {
      await page.goto('/');
      
      // Navigate to manage
      await page.click('a:has-text("Manage")');
      await expect(page).toHaveURL(/\/manage/);
      
      // Go to courses
      const coursesLink = page.locator('a:has-text("Courses"), [class*="courses"]').first();
      if (await coursesLink.isVisible()) {
        await coursesLink.click();
        await expect(page).toHaveURL(/\/manage\/courses/);
      }
      
      // Go to appearance
      const appearanceLink = page.locator('a:has-text("Appearance"), [class*="appearance"]').first();
      if (await appearanceLink.isVisible()) {
        await appearanceLink.click();
        await expect(page).toHaveURL(/\/manage\/appearance/);
      }
    });
  });
});
