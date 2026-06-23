import { faker } from '@faker-js/faker';
import type {
  Comment,
  Project,
  Task,
  TaskPriority,
  TaskStatus,
  User,
} from '~/types';
import { TASK_STATUSES } from '~/types';

/**
 * A single in-memory database shared by BOTH the REST handlers (auth, projects)
 * and the GraphQL handlers (tasks, comments). Seeded deterministically so the
 * UI, unit/integration tests, and Playwright E2E all see identical data.
 */
interface Db {
  users: User[];
  projects: Project[];
  tasks: Task[];
  comments: Comment[];
}

export const db: Db = {
  users: [],
  projects: [],
  tasks: [],
  comments: [],
};

/** Credentials accepted by the mock auth endpoint (any seeded user + this). */
export const DEMO_PASSWORD = 'password';
export const DEMO_EMAIL = 'avery@taskflow.app';

const PROJECT_COLORS = [
  '#6366f1',
  '#0ea5e9',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
];

const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];

function iso(date: Date): string {
  return date.toISOString();
}

/** Populate (or repopulate) the database from scratch, deterministically. */
export function seedDb(): void {
  faker.seed(20240617);

  const users: User[] = [
    {
      id: 'user-1',
      name: 'Avery Quinn',
      email: DEMO_EMAIL,
      avatarUrl: `https://i.pravatar.cc/120?img=12`,
      jobTitle: 'Product Lead',
    },
    {
      id: 'user-2',
      name: 'Jordan Reyes',
      email: 'jordan@taskflow.app',
      avatarUrl: `https://i.pravatar.cc/120?img=33`,
      jobTitle: 'Frontend Engineer',
    },
    {
      id: 'user-3',
      name: 'Sam Okafor',
      email: 'sam@taskflow.app',
      avatarUrl: `https://i.pravatar.cc/120?img=5`,
      jobTitle: 'Designer',
    },
    {
      id: 'user-4',
      name: 'Riley Chen',
      email: 'riley@taskflow.app',
      avatarUrl: `https://i.pravatar.cc/120?img=47`,
      jobTitle: 'Backend Engineer',
    },
    {
      id: 'user-5',
      name: 'Morgan Patel',
      email: 'morgan@taskflow.app',
      avatarUrl: `https://i.pravatar.cc/120?img=8`,
      jobTitle: 'QA Engineer',
    },
  ];

  const projectSeeds = [
    { name: 'Atlas Web App', key: 'ATL' },
    { name: 'Beacon Mobile', key: 'BCN' },
    { name: 'Comet Design System', key: 'CMT' },
    { name: 'Delta Analytics', key: 'DLT' },
    { name: 'Echo Marketing Site', key: 'ECH' },
  ];

  const now = new Date('2026-06-22T12:00:00.000Z');

  const projects: Project[] = projectSeeds.map((seed, i) => {
    const createdAt = faker.date.recent({ days: 90, refDate: now });
    const memberCount = faker.number.int({ min: 2, max: users.length });
    const memberIds = faker.helpers
      .arrayElements(users, memberCount)
      .map((u) => u.id);
    if (!memberIds.includes('user-1')) memberIds.unshift('user-1');
    return {
      id: `project-${i + 1}`,
      name: seed.name,
      key: seed.key,
      description: faker.company.catchPhrase(),
      color: PROJECT_COLORS[i % PROJECT_COLORS.length],
      ownerId: memberIds[0],
      memberIds,
      createdAt: iso(createdAt),
      updatedAt: iso(createdAt),
    };
  });

  const tasks: Task[] = [];
  const comments: Comment[] = [];
  let taskCounter = 0;
  let commentCounter = 0;

  for (const project of projects) {
    const taskCount = faker.number.int({ min: 8, max: 16 });
    // Track per-status ordering so the board has a stable sort.
    const orderByStatus: Record<TaskStatus, number> = {
      todo: 0,
      in_progress: 0,
      in_review: 0,
      done: 0,
    };
    for (let t = 0; t < taskCount; t++) {
      const status = faker.helpers.arrayElement(TASK_STATUSES);
      const createdAt = faker.date.between({
        from: project.createdAt,
        to: now,
      });
      const hasAssignee = faker.datatype.boolean(0.8);
      const hasDue = faker.datatype.boolean(0.6);
      taskCounter += 1;
      const task: Task = {
        id: `task-${taskCounter}`,
        projectId: project.id,
        title: faker.helpers
          .arrayElement([
            faker.hacker.phrase(),
            `${faker.hacker.verb()} the ${faker.hacker.noun()}`,
            faker.company.buzzPhrase(),
          ])
          .replace(/^./, (c) => c.toUpperCase()),
        description: faker.lorem.paragraph(),
        status,
        priority: faker.helpers.arrayElement(PRIORITIES),
        assigneeId: hasAssignee
          ? faker.helpers.arrayElement(project.memberIds)
          : null,
        dueDate: hasDue
          ? iso(faker.date.soon({ days: 21, refDate: now }))
          : null,
        order: orderByStatus[status]++,
        createdAt: iso(createdAt),
        updatedAt: iso(createdAt),
      };
      tasks.push(task);

      const commentCount = faker.number.int({ min: 0, max: 4 });
      for (let c = 0; c < commentCount; c++) {
        commentCounter += 1;
        comments.push({
          id: `comment-${commentCounter}`,
          taskId: task.id,
          authorId: faker.helpers.arrayElement(project.memberIds),
          body: faker.lorem.sentence(),
          createdAt: iso(
            faker.date.between({ from: task.createdAt, to: now }),
          ),
        });
      }
    }
  }

  db.users = users;
  db.projects = projects;
  db.tasks = tasks;
  db.comments = comments;
}

// Seed immediately on import so handlers have data from the first request.
seedDb();

/** Resolve a user by id (used by both transports to embed authors/assignees). */
export function findUser(id: string | null | undefined): User | null {
  if (!id) return null;
  return db.users.find((u) => u.id === id) ?? null;
}

let idSeq = 10_000;
export function nextId(prefix: string): string {
  idSeq += 1;
  return `${prefix}-${idSeq}`;
}
