import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// Service-worker request interceptor for the browser (dev + production preview).
export const worker = setupWorker(...handlers);

/** Start mocking. Resolves once the worker is ready to intercept requests. */
export async function startMockServer(): Promise<void> {
  await worker.start({
    onUnhandledRequest: 'bypass',
    quiet: true,
    serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` },
  });
}
