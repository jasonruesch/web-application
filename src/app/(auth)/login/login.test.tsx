import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { DEMO_EMAIL } from '~/mocks/db';
import { useSessionStore } from '~/stores/session.store';
import { renderWithProviders } from '~/test/render';
import LoginPage, { searchSchema } from './page';

describe('LoginPage', () => {
  it('applies search-param defaults', () => {
    expect(searchSchema.parse({})).toEqual({});
    expect(searchSchema.parse({ redirect: '/projects' })).toEqual({
      redirect: '/projects',
    });
  });

  it('signs in with the demo account button', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage params={{}} searchParams={{}} />);

    await user.click(screen.getByRole('button', { name: /use demo account/i }));

    await waitFor(() => {
      expect(useSessionStore.getState().user?.email).toBe(DEMO_EMAIL);
    });
  });

  it('shows an error for invalid credentials', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage params={{}} searchParams={{}} />);

    await user.type(screen.getByLabelText(/email/i), 'avery@taskflow.app');
    await user.type(screen.getByLabelText(/password/i), 'nope');
    await user.click(screen.getByRole('button', { name: /^sign in$/i }));

    expect(await screen.findByText(/invalid email or password/i)).toBeVisible();
    expect(useSessionStore.getState().user).toBeNull();
  });
});
