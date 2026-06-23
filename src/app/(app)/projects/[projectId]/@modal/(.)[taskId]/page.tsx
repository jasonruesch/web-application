import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Spinner,
} from '@jasonruesch/react';
import { Suspense, useState } from 'react';
import { useNavigate } from 'react-router';
import { generate as generateBoard } from 'virtual:react-router-next/(app)/projects/[projectId]';
import type { RouteProps } from 'virtual:react-router-next/(app)/projects/[projectId]/[taskId]';
import { useProject } from '../../../_lib/use-projects';
import { TaskDetail } from '../../_components/task-detail';

/**
 * Intercepting route: when a task is opened by in-app navigation (clicking a
 * board card), this renders the detail as a modal overlaying the board, which
 * stays mounted behind it. On refresh/deep-link the full-page route renders
 * instead. Same routeKey/params as the target `tasks/[taskId]` route.
 */
export default function TaskModal({ params }: RouteProps) {
  const { projectId, taskId } = params;
  const { data: project } = useProject(projectId);
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  const close = () => {
    setOpen(false);
    // Let the close animation start, then return to the board.
    navigate(generateBoard({ projectId }));
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && close()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader className="sr-only">
          <DialogTitle>Task details</DialogTitle>
          <DialogDescription>View and edit this task</DialogDescription>
        </DialogHeader>
        <Suspense
          fallback={
            <div className="flex justify-center py-12">
              <Spinner label="Loading task…" />
            </div>
          }
        >
          <TaskDetail
            taskId={taskId}
            projectId={projectId}
            members={project.members}
            onClose={close}
          />
        </Suspense>
      </DialogContent>
    </Dialog>
  );
}
