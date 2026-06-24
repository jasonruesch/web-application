import { Button, Heading, Stack, Text } from '@jasonruesch/react';
import { useNavigate } from 'react-router';
import { useDocumentTitle } from '~/lib/a11y';

/** Root 404 boundary for unmatched URLs. */
export default function RootNotFound() {
  const navigate = useNavigate();
  useDocumentTitle('Page not found');
  return (
    <div className="flex min-h-dvh items-center justify-center p-6 text-center">
      <Stack gap={3} align="center">
        <Text size="xl" weight="bold" tone="accent">
          404
        </Text>
        <Heading level={2}>Page not found</Heading>
        <Text tone="muted" className="max-w-sm">
          We couldn&apos;t find the page you&apos;re looking for. It may have been
          moved or deleted.
        </Text>
        <Button className="mt-2" onClick={() => navigate('/')}>
          Back to home
        </Button>
      </Stack>
    </div>
  );
}
