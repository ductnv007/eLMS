import { courses, Course } from './mock-data';
import { getDataSource } from './data-source';
import { getSupabaseCourses } from './supabase-data-service';

export type CourseQuery = {
  search?: string;
  category?: string;
};

export type { Course };

export async function listCourses(query: CourseQuery = {}) {
  const source = getDataSource();

  let coursesList = courses;

  if (source === 'supabase') {
    coursesList = await getSupabaseCourses();
  }

  let filtered = [...coursesList];

  if (query.search) {
    const search = query.search.toLowerCase();
    filtered = filtered.filter((course) =>
      course.title.toLowerCase().includes(search) ||
      course.summary.toLowerCase().includes(search),
    );
  }

  if (query.category) {
    filtered = filtered.filter((course) => course.category === query.category);
  }

  return filtered;
}


export async function getCourseBySlug(slug: string) {
  const source = getDataSource();

  if (source === 'supabase') {
    const { getSupabaseCourseBySlug } = await import('./supabase-data-service');
    return getSupabaseCourseBySlug(slug);
  }

  return courses.find((course) => course.slug === slug) ?? null;
}
