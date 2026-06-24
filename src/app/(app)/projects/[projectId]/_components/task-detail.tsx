import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Heading,
  Inline,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Stack,
  Text,
  Textarea,
} from '@jasonruesch/react';
import { Trash2 } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  TASK_PRIORITIES,
  TASK_STATUSES,
  type TaskPriority,
  type TaskStatus,
  type User,
} from '~/types';
import { DueDate } from '~/components/task-meta';
import { useDocumentTitle } from '~/lib/a11y';
import { formatRelative, initials } from '~/lib/format';
import {
  useAddComment,
  useDeleteTask,
  useTask,
  useUpdateTask,
} from '../_lib/use-tasks';

const UNASSIGNED = 'unassigned';

export function TaskDetail({
  taskId,
  projectId,
  members,
  onClose,
}: {
  taskId: string;
  projectId: string;
  members: User[];
  onClose: () => void;
}) {
  const { data } = useTask(taskId);
  const task = data.task;
  useDocumentTitle(task.title);
  const [updateTask, { loading: updating }] = useUpdateTask();
  const [deleteTask, { loading: deleting }] = useDeleteTask(projectId);
  const [addComment, { loading: commenting }] = useAddComment();
  const [comment, setComment] = useState('');

  const patch = (input: Record<string, unknown>) =>
    void updateTask({
      variables: { id: task.id, input },
      optimisticResponse: {
        updateTask: { ...task, ...input, updatedAt: new Date().toISOString() },
      },
    });

  const onAddComment = async (event: FormEvent) => {
    event.preventDefault();
    if (!comment.trim()) return;
    await addComment({ variables: { taskId: task.id, body: comment.trim() } });
    setComment('');
  };

  const onDelete = async () => {
    await deleteTask({ variables: { id: task.id } });
    onClose();
  };

  return (
    <Stack gap={6}>
      <div>
        <Heading level={3}>{task.title}</Heading>
        <Text tone="subtle" size="xs" className="mt-1">
          Updated {formatRelative(task.updatedAt)}
        </Text>
      </div>

      {/* Editable fields */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Stack gap={1}>
          <Text size="xs" tone="muted">
            Status
          </Text>
          <Select
            value={task.status}
            onValueChange={(v) => patch({ status: v as TaskStatus })}
          >
            <SelectTrigger aria-label="Status" disabled={updating}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TASK_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Stack>

        <Stack gap={1}>
          <Text size="xs" tone="muted">
            Priority
          </Text>
          <Select
            value={task.priority}
            onValueChange={(v) => patch({ priority: v as TaskPriority })}
          >
            <SelectTrigger aria-label="Priority" disabled={updating}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TASK_PRIORITIES.map((p) => (
                <SelectItem key={p} value={p}>
                  {PRIORITY_LABELS[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Stack>

        <Stack gap={1}>
          <Text size="xs" tone="muted">
            Assignee
          </Text>
          <Select
            value={task.assigneeId ?? UNASSIGNED}
            onValueChange={(v) =>
              patch({ assigneeId: v === UNASSIGNED ? null : v })
            }
          >
            <SelectTrigger aria-label="Assignee" disabled={updating}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
              {members.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Stack>
      </div>

      {task.dueDate && (
        <div>
          <Text size="xs" tone="muted" className="mb-1">
            Due
          </Text>
          <DueDate date={task.dueDate} />
        </div>
      )}

      {task.description && (
        <div>
          <Text size="xs" tone="muted" className="mb-1">
            Description
          </Text>
          <Text size="sm" className="whitespace-pre-wrap">
            {task.description}
          </Text>
        </div>
      )}

      <Separator />

      {/* Comments */}
      <Stack gap={3}>
        <Text weight="semibold" size="sm">
          Comments ({task.comments.length})
        </Text>
        {task.comments.map((c) => (
          <Inline key={c.id} gap={2} align="start">
            <Avatar size="sm">
              <AvatarImage src={c.author.avatarUrl} alt="" />
              <AvatarFallback>{initials(c.author.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <Text size="sm">
                <span className="font-medium">{c.author.name}</span>{' '}
                <span className="text-fg-subtle">
                  · {formatRelative(c.createdAt)}
                </span>
              </Text>
              <Text size="sm" tone="muted" className="whitespace-pre-wrap">
                {c.body}
              </Text>
            </div>
          </Inline>
        ))}

        <form onSubmit={onAddComment}>
          <Stack gap={2}>
            <Textarea
              aria-label="Add a comment"
              placeholder="Add a comment…"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                size="sm"
                loading={commenting}
                disabled={!comment.trim()}
              >
                Comment
              </Button>
            </div>
          </Stack>
        </form>
      </Stack>

      <Separator />

      <div className="flex justify-end">
        <Button
          variant="danger"
          size="sm"
          loading={deleting}
          onClick={onDelete}
        >
          <Trash2 size={16} aria-hidden /> Delete task
        </Button>
      </div>
    </Stack>
  );
}
