import { supabase } from './supabase-client';
import type { Course } from './course-service';

export async function getSupabaseCourses(): Promise<Course[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.warn('Supabase not configured, returning empty courses');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('status', 'published');

    if (error) {
      console.error('Error fetching courses from Supabase:', error);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      subtitle: row.title,
      summary: row.description || '',
      description: row.description || '',
      category: row.category || 'Development',
      level: 'Beginner' as const,
      language: 'English',
      duration: `${row.duration_minutes || 0} mins`,
      lessons: 1,
      cover: row.thumbnail_url || '',
      instructor: 'Instructor',
      rating: 4.5,
      students: '0',
      price: 'Free',
      learningOutcomes: [],
      curriculum: [],
    }));
  } catch (error) {
    console.error('Error fetching Supabase courses:', error);
    return [];
  }
}

export async function getSupabaseCourseBySlug(slug: string): Promise<Course | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.warn('Supabase not configured, returning null');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      console.error('Error fetching course:', error);
      return null;
    }

    return {
      id: data.id,
      title: data.title,
      slug: data.slug,
      subtitle: data.title,
      summary: data.description || '',
      description: data.description || '',
      category: data.category || 'Development',
      level: 'Beginner' as const,
      language: 'English',
      duration: `${data.duration_minutes || 0} mins`,
      lessons: 1,
      cover: data.thumbnail_url || '',
      instructor: 'Instructor',
      rating: 4.5,
      students: '0',
      price: 'Free',
      learningOutcomes: [],
      curriculum: [],
    };
  } catch (error) {
    console.error('Error fetching Supabase course:', error);
    return null;
  }
}

export async function getUserEnrollments(userId: string) {
  const { data, error } = await supabase
    .from('enrollments')
    .select('*, courses(*)')
    .eq('user_id', userId)
    .eq('status', 'active');

  if (error) {
    console.error('Error fetching enrollments:', error);
    return [];
  }

  return data || [];
}

export async function enrollCourse(userId: string, courseId: string) {
  const { data, error } = await supabase
    .from('enrollments')
    .insert([{ user_id: userId, course_id: courseId }])
    .select();

  if (error) {
    console.error('Error enrolling course:', error);
    return null;
  }

  return data?.[0] || null;
}
