import { getDataSource } from './data-source';
import { getSupabaseUser, supabase } from './supabase-client';

export type AppUser = {
  id: string;
  name: string;
  email: string;
  role: 'learner' | 'instructor' | 'admin';
};

export const mockUser: AppUser = {
  id: 'user-1',
  name: 'Demo Learner',
  email: 'learner@elms.dev',
  role: 'learner',
};

export async function getCurrentUser(): Promise<AppUser> {
  const source = getDataSource();

  if (source === 'supabase' && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const user = await getSupabaseUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        return {
          id: user.id,
          name: profile?.full_name || user.user_metadata?.name || '',
          email: user.email || '',
          role: (profile?.role as any) || 'learner',
        };
      }
    } catch (error) {
      console.error('Error fetching user from Supabase:', error);
    }
  }

  return mockUser;
}

export function canAccessManage(user: AppUser = mockUser) {
  return user.role === 'instructor' || user.role === 'admin';
}
