import { courses } from './mock-data';
import { getDataSource } from './data-source';

export type CourseQuery = {
  search?: string;
  category?: string;
};

export function listCourses(query: CourseQuery = {}) {
  const source = getDataSource();

  if (source === 'supabase') {
    return courses;
  }

  let filtered = [...courses];

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

export function getCourseBySlug(slug: string) {
  return courses.find((course) => course.slug === slug) ?? null;
}
