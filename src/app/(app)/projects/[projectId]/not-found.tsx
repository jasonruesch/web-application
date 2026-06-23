import { Button, Heading, Stack, Text } from '@jasonruesch/react';
import { useNavigate } from 'react-router';

/** Rendered when a project id doesn't exist (notFound() in useProject). */
export default function ProjectNotFound() {
  const navigate = useNavigate();
  return (
    <Stack gap={3} align="center" className="py-16 text-center">
      <Heading level={3}>Project not found</Heading>
      <Text tone="muted" className="max-w-sm">
        This project may have been deleted or you don&apos;t have access to it.
      </Text>
      <Button className="mt-2" onClick={() => navigate('/projects')}>
        Back to projects
      </Button>
    </Stack>
  );
}
