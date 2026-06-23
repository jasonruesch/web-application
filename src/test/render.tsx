import { ApolloProvider } from '@apollo/client/react';
import { TooltipProvider } from '@jasonruesch/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { type ReactElement, type ReactNode, Suspense } from 'react';
import { MemoryRouter } from 'react-router';
import { createApolloClient } from '~/lib/apollo';
import { createToken } from '~/mocks/auth';
import { db } from '~/mocks/db';
import { useSessionStore } from '~/stores/session.store';

/** Sign in as a seeded user so MSW authenticates requests during a test. */
export function signInAsSeedUser(userId = 'user-1') {
  const user = db.users.find((u) => u.id === userId)!;
  useSessionStore.getState().setSession(user, createToken(user.id));
  return user;
}

function TestProviders({ children, route }: { children: ReactNode; route: string }) {
  // Fresh clients per render so caches never bleed across tests.
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const apollo = createApolloClient();
  return (
    <ApolloProvider client={apollo}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <MemoryRouter initialEntries={[route]}>
            <Suspense fallback={<div>Loading…</div>}>{children}</Suspense>
          </MemoryRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ApolloProvider>
  );
}

export function renderWithProviders(
  ui: ReactElement,
  { route = '/' }: { route?: string } = {},
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <TestProviders route={route}>{children}</TestProviders>
    ),
  });
}
