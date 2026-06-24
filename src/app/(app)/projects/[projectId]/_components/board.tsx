import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Text,
  cn,
} from '@jasonruesch/react';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  TASK_PRIORITIES,
  TASK_STATUSES,
  type TaskPriority,
  type TaskStatus,
  type TaskWithAssignee,
  type User,
} from '~/types';
import { useBoardUiStore } from '~/stores/board-ui.store';
import { CreateTaskDialog } from './create-task-dialog';
import { TaskCard } from './task-card';
import { useMoveTask, useProjectTasks } from '../_lib/use-tasks';

const ALL = 'all';

function BoardColumn({
  status,
  tasks,
  projectId,
  onDropTask,
  onDragStart,
}: {
  status: TaskStatus;
  tasks: TaskWithAssignee[];
  projectId: string;
  onDropTask: (status: TaskStatus, order: number) => void;
  onDragStart: (taskId: string) => void;
}) {
  const [over, setOver] = useState(false);
  return (
    <div
      className="flex min-w-64 flex-1 flex-col"
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={() => {
        setOver(false);
        onDropTask(status, tasks.length);
      }}
    >
      <div className="mb-3 flex items-center justify-between">
        <Text weight="semibold" size="sm">
          {STATUS_LABELS[status]}
        </Text>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-fg-muted">
          {tasks.length}
        </span>
      </div>
      <div
        className={cn(
          'flex min-h-32 flex-1 flex-col gap-2 rounded-lg border border-transparent p-2 transition-colors',
          over ? 'border-accent bg-accent-subtle/40' : 'bg-surface/60',
        )}
        data-status={status}
      >
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            projectId={projectId}
            onDragStart={onDragStart}
          />
        ))}
        {tasks.length === 0 && (
          <Text tone="subtle" size="xs" className="px-1 py-6 text-center">
            Drop tasks here
          </Text>
        )}
      </div>
    </div>
  );
}

export function Board({
  projectId,
  members,
}: {
  projectId: string;
  members: User[];
}) {
  const { data } = useProjectTasks(projectId);
  const [moveTask] = useMoveTask();
  const [draggedId, setDraggedId] = useState<string | null>(null);
  // Politely announce drag-and-drop moves, which change content without moving
  // focus and so are otherwise silent to screen readers (WCAG 4.1.3).
  const [moveAnnouncement, setMoveAnnouncement] = useState('');
  const { filters, setQuery, setAssignee, setPriority } = useBoardUiStore();

  const filtered = useMemo(() => {
    const q = filters.query.toLowerCase();
    return data.tasks.filter((task) => {
      if (q && !task.title.toLowerCase().includes(q)) return false;
      if (filters.assigneeId && task.assigneeId !== filters.assigneeId)
        return false;
      if (filters.priority && task.priority !== filters.priority) return false;
      return true;
    });
  }, [data.tasks, filters]);

  const columns = useMemo(() => {
    const grouped = Object.fromEntries(
      TASK_STATUSES.map((s) => [s, [] as TaskWithAssignee[]]),
    ) as Record<TaskStatus, TaskWithAssignee[]>;
    for (const task of filtered) grouped[task.status].push(task);
    for (const status of TASK_STATUSES) {
      grouped[status].sort((a, b) => a.order - b.order);
    }
    return grouped;
  }, [filtered]);

  const handleDrop = (status: TaskStatus, order: number) => {
    const task = draggedId
      ? data.tasks.find((t) => t.id === draggedId)
      : undefined;
    setDraggedId(null);
    if (!task || task.status === status) return;
    setMoveAnnouncement(`Moved “${task.title}” to ${STATUS_LABELS[status]}`);
    void moveTask({
      variables: { id: task.id, status, order },
      optimisticResponse: {
        moveTask: { ...task, status, order, updatedAt: new Date().toISOString() },
      },
    });
  };

  return (
    <div>
      <div aria-live="polite" className="sr-only">
        {moveAnnouncement}
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-48 flex-1">
          <Search
            size={16}
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle"
          />
          <Input
            type="search"
            aria-label="Filter tasks"
            placeholder="Filter tasks…"
            value={filters.query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={filters.assigneeId ?? ALL}
          onValueChange={(v) => setAssignee(v === ALL ? null : v)}
        >
          <SelectTrigger className="w-44" aria-label="Filter by assignee">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All assignees</SelectItem>
            {members.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.priority ?? ALL}
          onValueChange={(v) =>
            setPriority(v === ALL ? null : (v as TaskPriority))
          }
        >
          <SelectTrigger className="w-40" aria-label="Filter by priority">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All priorities</SelectItem>
            {TASK_PRIORITIES.map((p) => (
              <SelectItem key={p} value={p}>
                {PRIORITY_LABELS[p]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <CreateTaskDialog projectId={projectId} members={members} />
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {TASK_STATUSES.map((status) => (
          <BoardColumn
            key={status}
            status={status}
            tasks={columns[status]}
            projectId={projectId}
            onDragStart={setDraggedId}
            onDropTask={handleDrop}
          />
        ))}
      </div>
    </div>
  );
}
