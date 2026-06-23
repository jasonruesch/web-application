import { Badge, Heading, Text, cn } from '@jasonruesch/react';
import type { ReactNode } from 'react';
import { NavLink as RouterNavLink, Outlet } from 'react-router';
import {
  generate as generateBoard,
  useRouteParams,
} from 'virtual:react-router-next/(app)/projects/[projectId]';
import { generate as generateSettings } from 'virtual:react-router-next/(app)/projects/[projectId]/settings';
import { AvatarStack } from '~/components/task-meta';
import { useProject } from '../_lib/use-projects';

function ProjectTab({ to, end, children }: { to: string; end?: boolean; children: ReactNode }) {
  return (
    <RouterNavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          '-mb-px border-b-2 px-1 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'border-accent text-accent'
            : 'border-transparent text-fg-muted hover:text-fg',
        )
      }
    >
      {children}
    </RouterNavLink>
  );
}

/**
 * Project chrome shared by the board and settings tabs. The `@modal` parallel
 * slot renders over this layout when a task is opened via in-app navigation.
 */
export default function ProjectLayout({ modal }: { modal: ReactNode }) {
  const { projectId } = useRouteParams();
  const { data: project } = useProject(projectId);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2">
            <span
              className="size-3 rounded-full"
              style={{ backgroundColor: project.color }}
              aria-hidden
            />
            <Badge variant="outline">{project.key}</Badge>
          </div>
          <Heading level={2}>{project.name}</Heading>
          {project.description && (
            <Text tone="muted" className="mt-1 max-w-2xl">
              {project.description}
            </Text>
          )}
        </div>
        <AvatarStack users={project.members} max={6} />
      </div>

      <div className="mb-6 flex gap-4 border-b border-line">
        <ProjectTab to={generateBoard({ projectId })} end>
          Board
        </ProjectTab>
        <ProjectTab to={generateSettings({ projectId })}>Settings</ProjectTab>
      </div>

      <Outlet />
      {modal}
    </div>
  );
}
