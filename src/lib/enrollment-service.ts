import { supabase } from './supabase-client';

export type Enrollment = {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  progressPercent: number;
  status: 'active' | 'completed' | 'dropped';
};

export async function enrollCourse(userId: string, courseId: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.warn('Supabase not configured');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('enrollments')
      .insert([{ user_id: userId, course_id: courseId, status: 'active' }])
      .select();

    if (error) {
      console.error('Error enrolling course:', error);
      return null;
    }

    return data?.[0] || null;
  } catch (error) {
    console.error('Error enrolling course:', error);
    return null;
  }
}

export async function getUserEnrollments(userId: string): Promise<Enrollment[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.warn('Supabase not configured');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('enrollments')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active');

    if (error) {
      console.error('Error fetching enrollments:', error);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      courseId: row.course_id,
      enrolledAt: row.enrolled_at,
      progressPercent: row.progress_percent || 0,
      status: row.status,
    }));
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return [];
  }
}

export async function getEnrollmentById(enrollmentId: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('enrollments')
      .select('*')
      .eq('id', enrollmentId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
      courseId: data.course_id,
      enrolledAt: data.enrolled_at,
      progressPercent: data.progress_percent || 0,
      status: data.status,
    };
  } catch (error) {
    console.error('Error fetching enrollment:', error);
    return null;
  }
}

export async function updateProgressPercent(enrollmentId: string, percent: number) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('enrollments')
      .update({ progress_percent: percent })
      .eq('id', enrollmentId)
      .select();

    if (error) {
      console.error('Error updating progress:', error);
      return null;
    }

    return data?.[0] || null;
  } catch (error) {
    console.error('Error updating progress:', error);
    return null;
  }
}
