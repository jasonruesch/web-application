import { Card, CardContent } from '@jasonruesch/react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { generate as generateBoard } from 'virtual:react-router-next/(app)/projects/[projectId]';
import type { RouteProps } from 'virtual:react-router-next/(app)/projects/[projectId]/[taskId]';
import { AppLink } from '~/components/app-link';
import { useProject } from '../../_lib/use-projects';
import { TaskDetail } from '../_components/task-detail';

/** Full-page task detail — shown on refresh, deep-link, or back/forward. */
export default function TaskDetailPage({ params }: RouteProps) {
  const { projectId, taskId } = params;
  const { data: project } = useProject(projectId);
  const navigate = useNavigate();
  const boardUrl = generateBoard({ projectId });

  return (
    <div className="mx-auto max-w-2xl">
      <AppLink to={boardUrl} variant="quiet" className="mb-4 inline-flex items-center gap-1">
        <ArrowLeft size={16} aria-hidden /> Back to board
      </AppLink>
      <Card>
        <CardContent>
          <TaskDetail
            taskId={taskId}
            projectId={projectId}
            members={project.members}
            onClose={() => navigate(boardUrl, { replace: true })}
          />
        </CardContent>
      </Card>
    </div>
  );
}
