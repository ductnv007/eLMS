import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import LearnerDashboardPage from './page';

describe('Learner dashboard page', () => {
  it('renders dashboard heading', () => {
    render(<LearnerDashboardPage />);
    expect(screen.getByText('My dashboard')).toBeInTheDocument();
  });

  it('renders learner progress cards', () => {
    render(<LearnerDashboardPage />);
    expect(screen.getByText('Full-Stack Next.js Bootcamp')).toBeInTheDocument();
  });
});
