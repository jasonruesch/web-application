import { Badge, Card, CardContent, Heading, Text } from '@jasonruesch/react';
import { Link as RouterLink } from 'react-router';
import { generate as generateProject } from 'virtual:react-router-next/(app)/projects/[projectId]';
import { AvatarStack } from '~/components/task-meta';
import type { ProjectWithMembers } from '~/types';

export function ProjectCard({ project }: { project: ProjectWithMembers }) {
  return (
    <RouterLink
      to={generateProject({ projectId: project.id })}
      className="group block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
    >
      <Card className="h-full transition-shadow group-hover:shadow-md">
        {/* CardContent ships with pt-0 (it assumes a CardHeader above); add
            top padding back since this card uses CardContent on its own. */}
        <CardContent className="pt-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span
                className="size-3 rounded-full"
                style={{ backgroundColor: project.color }}
                aria-hidden
              />
              <Badge variant="outline">{project.key}</Badge>
            </div>
            <Text size="xs" tone="subtle">
              {project.openTaskCount} open
            </Text>
          </div>

          <Heading level={4} as="h3" className="mt-3 group-hover:text-accent">
            {project.name}
          </Heading>
          <Text tone="muted" size="sm" className="mt-1 line-clamp-2">
            {project.description}
          </Text>

          <div className="mt-4 flex items-center justify-between">
            <AvatarStack users={project.members} />
            <Text size="xs" tone="subtle">
              {project.taskCount} tasks
            </Text>
          </div>
        </CardContent>
      </Card>
    </RouterLink>
  );
}
