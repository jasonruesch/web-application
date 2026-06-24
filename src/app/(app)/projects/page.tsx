import {
  Grid,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
} from '@jasonruesch/react';
import { FolderKanban, Search } from 'lucide-react';
import { Suspense, useEffect, useState } from 'react';
import { z } from 'zod';
import {
  type RouteProps,
  useSearchParams,
} from 'virtual:react-router-next/(app)/projects';
import { EmptyState } from '~/components/feedback';
import { PageHeader } from '~/components/page-header';
import { CreateProjectDialog } from './_components/create-project-dialog';
import { ProjectCard } from './_components/project-card';
import { useProjects } from './_lib/use-projects';

export const searchSchema = z.object({
  q: z.string().default(''),
  sort: z.enum(['recent', 'name']).default('recent'),
});

function ProjectGrid({ q, sort }: { q: string; sort: 'recent' | 'name' }) {
  const { data: projects } = useProjects({ q, sort });

  if (projects.length === 0) {
    return (
      <EmptyState
        icon={<FolderKanban size={32} aria-hidden />}
        title={q ? 'No matching projects' : 'No projects yet'}
        description={
          q
            ? 'Try a different search term.'
            : 'Create your first project to start tracking work.'
        }
        action={!q && <CreateProjectDialog />}
      />
    );
  }

  return (
    <Grid cols={1} gap={4} className="sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </Grid>
  );
}

export default function ProjectsPage({ searchParams }: RouteProps) {
  const { q, sort } = searchParams;
  const [, setSearch] = useSearchParams();
  const [query, setQuery] = useState(q);

  // Debounce search input into the URL so the query string stays shareable
  // without re-fetching on every keystroke.
  useEffect(() => {
    const id = setTimeout(() => {
      if (query !== q) {
        setSearch({ q: query, sort }, { replace: true, preventScrollReset: true });
      }
    }, 300);
    return () => clearTimeout(id);
  }, [query, q, sort, setSearch]);

  return (
    <div>
      <PageHeader
        title="Projects"
        description="Boards your team is actively working from."
        actions={<CreateProjectDialog />}
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1">
          <Search
            size={16}
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle"
          />
          <Input
            type="search"
            aria-label="Search projects"
            placeholder="Search projects…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={sort}
          onValueChange={(value) =>
            setSearch({ q: query, sort: value as 'recent' | 'name' }, {
              replace: true,
            })
          }
        >
          <SelectTrigger className="w-44" aria-label="Sort projects">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Recently updated</SelectItem>
            <SelectItem value="name">Name (A–Z)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Suspense
        fallback={
          <div className="flex justify-center py-16">
            <Spinner label="Loading projects…" />
          </div>
        }
      >
        <ProjectGrid q={q} sort={sort} />
      </Suspense>
    </div>
  );
}
