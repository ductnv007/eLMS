export type AppUser = {
  id: string;
  name: string;
  email: string;
  role: 'learner' | 'instructor' | 'admin';
};

export const currentUser: AppUser = {
  id: 'user-1',
  name: 'Demo Learner',
  email: 'learner@elms.dev',
  role: 'learner',
};

export function getCurrentUser() {
  return currentUser;
}

export function canAccessManage(user: AppUser = currentUser) {
  return user.role === 'instructor' || user.role === 'admin';
}
