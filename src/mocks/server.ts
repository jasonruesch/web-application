import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Node request interceptor used by Vitest (see vitest.setup.ts).
export const server = setupServer(...handlers);
