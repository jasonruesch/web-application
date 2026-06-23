import { HttpResponse, http } from 'msw';
import type {
  Project,
  ProjectStats,
  ProjectWithMembers,
  TaskStatus,
  User,
} from '~/types';
import { TASK_STATUSES } from '~/types';
import { authenticate, createToken } from './auth';
import { DEMO_PASSWORD, db, findUser, nextId, seedDb } from './db';
import { networkDelay } from './latency';

const API = '/api';

function unauthorized() {
  return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
}

function withMembers(project: Project): ProjectWithMembers {
  const tasks = db.tasks.filter((t) => t.projectId === project.id);
  return {
    ...project,
    owner: findUser(project.ownerId) as User,
    members: project.memberIds
      .map((id) => findUser(id))
      .filter((u): u is User => Boolean(u)),
    taskCount: tasks.length,
    openTaskCount: tasks.filter((t) => t.status !== 'done').length,
  };
}

function computeStats(projectIds: string[]): ProjectStats {
  const tasks = db.tasks.filter((t) => projectIds.includes(t.projectId));
  const byStatus = Object.fromEntries(
    TASK_STATUSES.map((s) => [s, 0]),
  ) as Record<TaskStatus, number>;
  let overdue = 0;
  let completedThisWeek = 0;
  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  for (const t of tasks) {
    byStatus[t.status] += 1;
    if (t.dueDate && t.status !== 'done' && new Date(t.dueDate).getTime() < now) {
      overdue += 1;
    }
    if (
      t.status === 'done' &&
      new Date(t.updatedAt).getTime() >= weekAgo
    ) {
      completedThisWeek += 1;
    }
  }
  return { total: tasks.length, byStatus, overdue, completedThisWeek };
}

export const restHandlers = [
  // --- Auth -------------------------------------------------------------
  http.post(`${API}/auth/login`, async ({ request }) => {
    await networkDelay();
    const { email, password } = (await request.json()) as {
      email?: string;
      password?: string;
    };
    const user = db.users.find(
      (u) => u.email.toLowerCase() === email?.toLowerCase(),
    );
    if (!user || password !== DEMO_PASSWORD) {
      return HttpResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 },
      );
    }
    return HttpResponse.json({ token: createToken(user.id), user });
  }),

  http.post(`${API}/auth/logout`, async () => {
    await networkDelay();
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`${API}/auth/me`, async ({ request }) => {
    await networkDelay();
    const user = authenticate(request);
    return user ? HttpResponse.json(user) : unauthorized();
  }),

  // --- Users (members directory) ---------------------------------------
  http.get(`${API}/users`, async ({ request }) => {
    await networkDelay();
    if (!authenticate(request)) return unauthorized();
    return HttpResponse.json(db.users);
  }),

  // --- Projects ---------------------------------------------------------
  http.get(`${API}/projects`, async ({ request }) => {
    await networkDelay();
    const user = authenticate(request);
    if (!user) return unauthorized();

    const url = new URL(request.url);
    const q = url.searchParams.get('q')?.toLowerCase() ?? '';
    const sort = url.searchParams.get('sort') ?? 'recent';

    let projects = db.projects.filter((p) => p.memberIds.includes(user.id));
    if (q) {
      projects = projects.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.key.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      );
    }
    projects = [...projects].sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      return (
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    });
    return HttpResponse.json(projects.map(withMembers));
  }),

  http.post(`${API}/projects`, async ({ request }) => {
    await networkDelay();
    const user = authenticate(request);
    if (!user) return unauthorized();
    const body = (await request.json()) as Partial<Project>;
    if (!body.name || !body.key) {
      return HttpResponse.json(
        { message: 'Name and key are required' },
        { status: 422 },
      );
    }
    const ts = new Date().toISOString();
    const project: Project = {
      id: nextId('project'),
      name: body.name,
      key: body.key.toUpperCase().slice(0, 4),
      description: body.description ?? '',
      color: body.color ?? '#6366f1',
      ownerId: user.id,
      memberIds: [user.id],
      createdAt: ts,
      updatedAt: ts,
    };
    db.projects.unshift(project);
    return HttpResponse.json(withMembers(project), { status: 201 });
  }),

  http.get(`${API}/projects/:id`, async ({ request, params }) => {
    await networkDelay();
    const user = authenticate(request);
    if (!user) return unauthorized();
    const project = db.projects.find((p) => p.id === params.id);
    if (!project) {
      return HttpResponse.json({ message: 'Project not found' }, { status: 404 });
    }
    return HttpResponse.json(withMembers(project));
  }),

  http.patch(`${API}/projects/:id`, async ({ request, params }) => {
    await networkDelay();
    const user = authenticate(request);
    if (!user) return unauthorized();
    const project = db.projects.find((p) => p.id === params.id);
    if (!project) {
      return HttpResponse.json({ message: 'Project not found' }, { status: 404 });
    }
    const body = (await request.json()) as Partial<Project>;
    Object.assign(project, {
      name: body.name ?? project.name,
      description: body.description ?? project.description,
      color: body.color ?? project.color,
      memberIds: body.memberIds ?? project.memberIds,
      updatedAt: new Date().toISOString(),
    });
    return HttpResponse.json(withMembers(project));
  }),

  http.delete(`${API}/projects/:id`, async ({ request, params }) => {
    await networkDelay();
    const user = authenticate(request);
    if (!user) return unauthorized();
    const idx = db.projects.findIndex((p) => p.id === params.id);
    if (idx === -1) {
      return HttpResponse.json({ message: 'Project not found' }, { status: 404 });
    }
    const [removed] = db.projects.splice(idx, 1);
    db.tasks = db.tasks.filter((t) => t.projectId !== removed.id);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`${API}/projects/:id/stats`, async ({ request, params }) => {
    await networkDelay();
    const user = authenticate(request);
    if (!user) return unauthorized();
    const project = db.projects.find((p) => p.id === params.id);
    if (!project) {
      return HttpResponse.json({ message: 'Project not found' }, { status: 404 });
    }
    return HttpResponse.json(computeStats([project.id]));
  }),

  // Dashboard analytics across the current user's projects.
  http.get(`${API}/stats`, async ({ request }) => {
    await networkDelay();
    const user = authenticate(request);
    if (!user) return unauthorized();
    const projectIds = db.projects
      .filter((p) => p.memberIds.includes(user.id))
      .map((p) => p.id);
    return HttpResponse.json(computeStats(projectIds));
  }),

  // Test/E2E helper: reset the database to its seeded state.
  http.post(`${API}/__reset`, async () => {
    seedDb();
    return new HttpResponse(null, { status: 204 });
  }),
];
