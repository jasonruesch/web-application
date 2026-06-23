import { Spinner } from '@jasonruesch/react';
import { Suspense } from 'react';
import type { RouteProps } from 'virtual:react-router-next/(app)/projects/[projectId]';
import { useProject } from '../_lib/use-projects';
import { Board } from './_components/board';

export default function ProjectBoardPage({ params }: RouteProps) {
  const { projectId } = params;
  const { data: project } = useProject(projectId);

  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-16">
          <Spinner label="Loading board…" />
        </div>
      }
    >
      <Board projectId={projectId} members={project.members} />
    </Suspense>
  );
}
