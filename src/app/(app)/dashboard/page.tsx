import { Badge, Card, Grid, Heading, Stack, Text } from '@jasonruesch/react';
import { CheckCircle2 } from 'lucide-react';
import { Link as RouterLink } from 'react-router';
import { generate as generateTask } from 'virtual:react-router-next/(app)/projects/[projectId]/[taskId]';
import { AppLink } from '~/components/app-link';
import { EmptyState } from '~/components/feedback';
import { DueDate, PriorityBadge } from '~/components/task-meta';
import { useCurrentUser } from '~/lib/use-auth';
import { ProjectCard } from '../projects/_components/project-card';
import { useProjects } from '../projects/_lib/use-projects';
import { useMyTasks } from '../projects/[projectId]/_lib/use-tasks';

function MyTasks({ userId }: { userId: string }) {
  const { data } = useMyTasks(userId);

  if (data.myTasks.length === 0) {
    return (
      <EmptyState
        icon={<CheckCircle2 size={32} aria-hidden />}
        title="You're all caught up"
        description="No open tasks are assigned to you right now."
      />
    );
  }

  return (
    <Stack gap={2} as="ul">
      {data.myTasks.map((task) => (
        <li key={task.id}>
          <RouterLink
            to={generateTask({
              projectId: task.projectId,
              taskId: task.id,
            })}
            className="block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            <Card className="p-3 transition-shadow hover:shadow-md">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <Text weight="medium" size="sm" truncate>
                    {task.title}
                  </Text>
                  <div className="mt-1 flex items-center gap-2">
                    {task.project && (
                      <Badge variant="outline">{task.project.key}</Badge>
                    )}
                    <DueDate date={task.dueDate} />
                  </div>
                </div>
                <PriorityBadge priority={task.priority} />
              </div>
            </Card>
          </RouterLink>
        </li>
      ))}
    </Stack>
  );
}

function RecentProjects() {
  const { data: projects } = useProjects({ sort: 'recent' });
  const recent = projects.slice(0, 4);
  return (
    <Grid cols={2} gap={4} className="sm:grid-cols-2">
      {recent.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </Grid>
  );
}

export default function DashboardPage() {
  const user = useCurrentUser();
  if (!user) return null;

  return (
    <Stack gap={8}>
      <section>
        <div className="mb-3 flex items-center justify-between">
          <Heading level={4} as="h3">My tasks</Heading>
        </div>
        <MyTasks userId={user.id} />
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <Heading level={4} as="h3">Recent projects</Heading>
          <AppLink to="/projects" variant="subtle">
            View all
          </AppLink>
        </div>
        <RecentProjects />
      </section>
    </Stack>
  );
}
