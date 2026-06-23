import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, expect } from 'vitest';
import * as matchers from 'vitest-axe/matchers';
import { seedDb } from './src/mocks/db';
import { server } from './src/mocks/server';
import { useSessionStore } from './src/stores/session.store';

expect.extend(matchers);

// Start the MSW request-mocking server for the whole test run.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
  // Reset shared state so each test starts from the same deterministic seed.
  seedDb();
  useSessionStore.getState().clear();
  localStorage.clear();
});
afterAll(() => server.close());
