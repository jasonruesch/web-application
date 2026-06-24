import { Card, Text } from '@jasonruesch/react';
import { Link as RouterLink } from 'react-router';
import { generate as generateTask } from 'virtual:react-router-next/(app)/projects/[projectId]/[taskId]';
import { DueDate, PriorityBadge, UserAvatar } from '~/components/task-meta';
import type { TaskWithAssignee } from '~/types';

export function TaskCard({
  task,
  projectId,
  onDragStart,
}: {
  task: TaskWithAssignee;
  projectId: string;
  onDragStart: (taskId: string) => void;
}) {
  return (
    <RouterLink
      to={generateTask({ projectId, taskId: task.id })}
      draggable
      onDragStart={() => onDragStart(task.id)}
      data-task-id={task.id}
      className="block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
    >
      <Card className="cursor-grab p-3 transition-shadow hover:shadow-md active:cursor-grabbing">
        <Text weight="medium" size="sm" className="line-clamp-2">
          {task.title}
        </Text>
        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <PriorityBadge priority={task.priority} />
            <DueDate date={task.dueDate} />
          </div>
          <UserAvatar user={task.assignee} size="sm" />
        </div>
      </Card>
    </RouterLink>
  );
}
