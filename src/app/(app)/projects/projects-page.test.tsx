import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { renderWithProviders, signInAsSeedUser } from '~/test/render';
import ProjectsPage from './page';

const props = {
  params: {},
  searchParams: { q: '', sort: 'recent' as const },
};

describe('ProjectsPage (REST suspense render)', () => {
  it('renders seeded project cards', async () => {
    signInAsSeedUser();
    renderWithProviders(<ProjectsPage {...props} />, { route: '/projects' });

    expect(await screen.findByText('Atlas Web App')).toBeInTheDocument();
    expect(screen.getByText('Beacon Mobile')).toBeInTheDocument();
  });

  it('opens the create-project dialog', async () => {
    signInAsSeedUser();
    const user = userEvent.setup();
    renderWithProviders(<ProjectsPage {...props} />, { route: '/projects' });
    await screen.findByText('Atlas Web App');

    await user.click(screen.getByRole('button', { name: /new project/i }));
    expect(
      await screen.findByRole('dialog', { name: /create project/i }),
    ).toBeInTheDocument();
  });

  it('has no detectable accessibility violations', async () => {
    signInAsSeedUser();
    const { container } = renderWithProviders(<ProjectsPage {...props} />, {
      route: '/projects',
    });
    await waitFor(() =>
      expect(screen.getByText('Atlas Web App')).toBeInTheDocument(),
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
