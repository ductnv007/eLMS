export type CourseAdminRow = {
  id: string;
  title: string;
  status: 'Draft' | 'Published';
  learners: number;
  revenue: string;
};

export const adminCourseRows: CourseAdminRow[] = [
  { id: 'c1', title: 'Full-Stack Next.js Bootcamp', status: 'Published', learners: 1240, revenue: '$4,200' },
  { id: 'c2', title: 'Product Design Systems', status: 'Draft', learners: 260, revenue: '$1,150' },
  { id: 'c3', title: 'AI Workflows for Teams', status: 'Published', learners: 890, revenue: '$2,780' },
];

export function getAdminCourseRows() {
  return adminCourseRows;
}
