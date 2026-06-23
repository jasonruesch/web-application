import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Spinner,
  Stack,
  Text,
} from '@jasonruesch/react';
import { Suspense } from 'react';
import {
  STATUS_LABELS,
  TASK_STATUSES,
  type ProjectStats,
  type TaskStatus,
} from '~/types';
import { useDashboardStats } from '../../projects/_lib/use-projects';

const STATUS_BAR: Record<TaskStatus, string> = {
  todo: 'bg-muted',
  in_progress: 'bg-accent',
  in_review: 'bg-warning',
  done: 'bg-success',
};

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-line bg-canvas p-3">
      <Text size="xl" weight="bold">
        {value}
      </Text>
      <Text size="xs" tone="muted">
        {label}
      </Text>
    </div>
  );
}

function StatusBreakdown({ stats }: { stats: ProjectStats }) {
  const total = stats.total || 1;
  return (
    <Stack gap={2}>
      {TASK_STATUSES.map((status) => {
        const count = stats.byStatus[status];
        const pct = Math.round((count / total) * 100);
        return (
          <div key={status}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <Text size="xs" tone="muted">
                {STATUS_LABELS[status]}
              </Text>
              <Text size="xs" tone="subtle">
                {count}
              </Text>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full ${STATUS_BAR[status]}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </Stack>
  );
}

function Analytics() {
  const { data: stats } = useDashboardStats();
  return (
    <Stack gap={4}>
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Total tasks" value={stats.total} />
        <Stat label="Done this week" value={stats.completedThisWeek} />
        <Stat label="In progress" value={stats.byStatus.in_progress} />
        <Stat label="Overdue" value={stats.overdue} />
      </div>
      <StatusBreakdown stats={stats} />
    </Stack>
  );
}

export default function AnalyticsPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <Suspense
          fallback={
            <div className="flex justify-center py-8">
              <Spinner label="Loading analytics…" />
            </div>
          }
        >
          <Analytics />
        </Suspense>
      </CardContent>
    </Card>
  );
}
