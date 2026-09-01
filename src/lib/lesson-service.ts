import { supabase } from './supabase-client';

export type Lesson = {
  id: string;
  courseId: string;
  title: string;
  description: string;
  orderIndex: number;
  contentType: 'video' | 'text' | 'quiz';
  contentUrl: string;
  durationMinutes: number;
};

export async function getCourseLessons(courseId: string): Promise<Lesson[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.warn('Supabase not configured');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching lessons:', error);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      courseId: row.course_id,
      title: row.title,
      description: row.description || '',
      orderIndex: row.order_index || 0,
      contentType: row.content_type || 'text',
      contentUrl: row.content_url || '',
      durationMinutes: row.duration_minutes || 0,
    }));
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return [];
  }
}

export async function getLessonById(lessonId: string): Promise<Lesson | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', lessonId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      courseId: data.course_id,
      title: data.title,
      description: data.description || '',
      orderIndex: data.order_index || 0,
      contentType: data.content_type || 'text',
      contentUrl: data.content_url || '',
      durationMinutes: data.duration_minutes || 0,
    };
  } catch (error) {
    console.error('Error fetching lesson:', error);
    return null;
  }
}
