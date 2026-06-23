import { Avatar, AvatarFallback, AvatarImage, Badge } from '@jasonruesch/react';
import { CalendarClock } from 'lucide-react';
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  type TaskPriority,
  type TaskStatus,
  type User,
} from '~/types';
import { formatShortDate, initials, isOverdue } from '~/lib/format';

const PRIORITY_VARIANT: Record<
  TaskPriority,
  'neutral' | 'warning' | 'danger' | 'accent'
> = {
  low: 'neutral',
  medium: 'accent',
  high: 'warning',
  urgent: 'danger',
};

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <Badge variant={PRIORITY_VARIANT[priority]}>{PRIORITY_LABELS[priority]}</Badge>
  );
}

const STATUS_VARIANT: Record<
  TaskStatus,
  'neutral' | 'accent' | 'warning' | 'success'
> = {
  todo: 'neutral',
  in_progress: 'accent',
  in_review: 'warning',
  done: 'success',
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABELS[status]}</Badge>;
}

export function DueDate({ date }: { date: string | null }) {
  if (!date) return null;
  const overdue = isOverdue(date);
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs ${
        overdue ? 'text-danger' : 'text-fg-subtle'
      }`}
      title={overdue ? 'Overdue' : 'Due date'}
    >
      <CalendarClock aria-hidden size={13} />
      {formatShortDate(date)}
    </span>
  );
}

export function UserAvatar({
  user,
  size = 'sm',
}: {
  user: Pick<User, 'name' | 'avatarUrl'>;
  size?: 'sm' | 'md' | 'lg';
}) {
  return (
    <Avatar size={size} title={user.name}>
      <AvatarImage src={user.avatarUrl} alt="" />
      <AvatarFallback>{initials(user.name)}</AvatarFallback>
    </Avatar>
  );
}

/** Overlapping avatar group for project members. */
export function AvatarStack({
  users,
  max = 4,
}: {
  users: Pick<User, 'id' | 'name' | 'avatarUrl'>[];
  max?: number;
}) {
  const shown = users.slice(0, max);
  const extra = users.length - shown.length;
  return (
    <div className="flex items-center -space-x-2">
      {shown.map((user) => (
        <div key={user.id} className="rounded-full ring-2 ring-canvas">
          <UserAvatar user={user} size="sm" />
        </div>
      ))}
      {extra > 0 && (
        <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-medium text-fg-muted ring-2 ring-canvas">
          +{extra}
        </div>
      )}
    </div>
  );
}
