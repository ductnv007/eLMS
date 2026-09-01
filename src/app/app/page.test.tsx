import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import LearnerDashboardPage from './page';

describe('Learner dashboard page', () => {
  it('renders dashboard heading', async () => {
    const Component = await LearnerDashboardPage();
    render(Component);
    expect(screen.getByText('My dashboard')).toBeInTheDocument();
  });

  it('renders learner progress cards', async () => {
    const Component = await LearnerDashboardPage();
    render(Component);
    expect(screen.getByText('Enrolled courses')).toBeInTheDocument();
  });
});
