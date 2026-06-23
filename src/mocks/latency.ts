import { delay } from 'msw';

// Simulate realistic network latency in the browser so loading states are
// visible, but stay instant under tests (jsdom + node) to keep them fast and
// stable. jsdom defines `window`, so gate on the test env too.
const isTest = import.meta.env.MODE === 'test';
const inBrowser = typeof window !== 'undefined';

export function networkDelay(): Promise<void> | undefined {
  if (isTest || !inBrowser) return undefined;
  return delay(250 + Math.random() * 350);
}
