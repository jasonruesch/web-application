import './styles/app.css';
import { AppRouter } from '@evolonix/react-router-next/vite-client';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// No real backend: always start the MSW mock server before mounting, so the
// very first route render already has its API available to intercept.
async function bootstrap() {
  const { startMockServer } = await import('./mocks/browser');
  await startMockServer();

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <AppRouter />
    </StrictMode>,
  );
}

void bootstrap();
