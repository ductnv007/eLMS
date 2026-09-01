export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type Course = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  summary: string;
  description: string;
  level: CourseLevel;
  category: string;
  language: string;
  duration: string;
  lessons: number;
  cover: string;
  instructor: string;
  rating: number;
  students: string;
  price: string;
  featured?: boolean;
  badges?: string[];
  learningOutcomes: string[];
  curriculum: { title: string; lessons: string[] }[];
};

export const categories = [
  'Marketing',
  'Design',
  'Development',
  'Business',
  'Productivity',
  'AI & Data',
];

export const courses: Course[] = [
  {
    id: 'course-1',
    slug: 'full-stack-nextjs-bootcamp',
    title: 'Full-Stack Next.js Bootcamp',
    subtitle: 'Build production-ready apps from zero to launch',
    summary: 'Master React, Next.js, server actions, Supabase, and deployment workflows in one guided path.',
    description:
      'This course walks learners through authentication, data modeling, UI design, and shipping a modern SaaS product with production-ready workflows.',
    level: 'Beginner',
    category: 'Development',
    language: 'English',
    duration: '6 weeks',
    lessons: 28,
    cover: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?...',
    instructor: 'Mai Nguyen',
    rating: 4.9,
    students: '18.4k',
    price: 'Free',
    featured: true,
    badges: ['Popular', 'New'],
    learningOutcomes: [
      'Ship a real Next.js app with App Router',
      'Work with database models and Supabase auth',
      'Build reusable UI and clean architecture',
    ],
    curriculum: [
      { title: 'Foundation', lessons: ['Project setup', 'Routing', 'Design system'] },
      { title: 'Applications', lessons: ['Lessons and quizzes', 'Progress tracking', 'Publishing flow'] },
    ],
  },
  {
    id: 'course-2',
    slug: 'product-design-systems',
    title: 'Product Design Systems',
    subtitle: 'Design consistent experiences at scale',
    summary: 'Create elegant, reusable interfaces with tokens, patterns, accessibility, and component systems.',
    description:
      'This course helps designers and product teams build clear visual systems, maintain consistency, and improve usability for complex SaaS products.',
    level: 'Intermediate',
    category: 'Design',
    language: 'Vietnamese',
    duration: '4 weeks',
    lessons: 19,
    cover: 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?...',
    instructor: 'Huy Tran',
    rating: 4.8,
    students: '12.6k',
    price: 'Pro',
    learningOutcomes: [
      'Create token-based systems',
      'Design accessible UI patterns',
      'Scale products with UX governance',
    ],
    curriculum: [
      { title: 'System foundations', lessons: ['Color tokens', 'Type scales', 'Component library'] },
      { title: 'Delivery', lessons: ['Design QA', 'Accessibility review', 'Team handoff'] },
    ],
  },
  {
    id: 'course-3',
    slug: 'ai-workflows-for-teams',
    title: 'AI Workflows for Teams',
    subtitle: 'Turn ideas into repeatable automation',
    summary: 'Explore AI workflows, team enablement, evaluation, and responsible adoption for everyday operations.',
    description:
      'Learners will map AI opportunities, design workflows, and evaluate outputs with a practical framework grounded in business value.',
    level: 'Advanced',
    category: 'AI & Data',
    language: 'English',
    duration: '5 weeks',
    lessons: 24,
    cover: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?...',
    instructor: 'Long Pham',
    rating: 4.7,
    students: '9.2k',
    price: 'Premium',
    learningOutcomes: [
      'Map AI use cases to measurable outcomes',
      'Build lightweight AI playbooks',
      'Reduce risk through evaluation and governance',
    ],
    curriculum: [
      { title: 'AI foundations', lessons: ['Models and prompts', 'Tool selection', 'Evaluation criteria'] },
      { title: 'Operations', lessons: ['Workflow design', 'Human review', 'Scaling adoption'] },
    ],
  },
];

export const testimonials = [
  { name: 'An', role: 'Product Designer', quote: 'The lessons are clear, focused, and genuinely practical for building with teams.' },
  { name: 'Minh', role: 'Frontend Engineer', quote: 'I shipped my first real SaaS flow within a week of completing the course path.' },
  { name: 'Linh', role: 'Operations Lead', quote: 'The platform helped our team standardize learning and upskilling across departments.' },
];

export const dashboardStats = [
  { label: 'Courses in progress', value: '4' },
  { label: 'Completed lessons', value: '36' },
  { label: 'Weekly streak', value: '5 days' },
  { label: 'Certificates', value: '2' },
];

export const learnerProgress = [
  { title: 'Full-Stack Next.js Bootcamp', progress: 72, status: 'In progress' },
  { title: 'Product Design Systems', progress: 46, status: 'Continue' },
  { title: 'AI Workflows for Teams', progress: 18, status: 'New' },
];
