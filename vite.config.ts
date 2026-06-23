/// <reference types="vitest/config" />
import { fileURLToPath } from 'node:url';
import reactRouterNext from '@evolonix/react-router-next/vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// The filesystem-router plugin must run before @vitejs/plugin-react so its
// virtual modules are registered before React Fast Refresh transforms them.
// `base` is set for the GitHub Pages project-site build (via VITE_BASE in the
// deploy workflow); dev, tests, and local preview stay at the root.
// `AppRouter` reads its basename from import.meta.env.BASE_URL automatically.
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [reactRouterNext(), react(), tailwindcss()],
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./src', import.meta.url)),
    },
    // Ensure a single React copy in tests (avoids "React.act is not a function").
    dedupe: ['react', 'react-dom'],
  },
  server: { port: 5173 },
  preview: { port: 4173 },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    css: true,
    // Force a non-production env so React loads its development build (which
    // exports `act`) even when the host shell pins NODE_ENV=production.
    env: { NODE_ENV: 'test' },
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['e2e/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.{test,spec}.{ts,tsx}', 'src/mocks/**', 'src/**/*.d.ts'],
    },
  },
});
