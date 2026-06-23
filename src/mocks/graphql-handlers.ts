import { HttpResponse, graphql } from 'msw';
import type { Comment, Task, TaskPriority, TaskStatus, User } from '~/types';
import { authenticate } from './auth';
import { db, findUser, nextId } from './db';
import { networkDelay } from './latency';

/**
 * Build a GraphQL error body. Returned as a plain object so the wrapping
 * `HttpResponse.json(...)` at each call site is typed by the resolver's
 * expected response shape (MSW's `HttpResponse.json` blocks arg inference).
 */
function errorBody(message: string, code = 'BAD_REQUEST') {
  return { errors: [{ message, extensions: { code } }] };
}

function serializeUser(user: User | null) {
  return user ? { __typename: 'User' as const, ...user } : null;
}

function serializeTask(task: Task) {
  return {
    __typename: 'Task' as const,
    ...task,
    assignee: serializeUser(findUser(task.assigneeId)),
  };
}

function serializeComment(comment: Comment) {
  return {
    __typename: 'Comment' as const,
    ...comment,
    author: serializeUser(findUser(comment.authorId)),
  };
}

interface CreateTaskInput {
  projectId: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  assigneeId?: string | null;
  dueDate?: string | null;
}

interface UpdateTaskInput {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  assigneeId?: string | null;
  dueDate?: string | null;
  status?: TaskStatus;
}

export const graphqlHandlers = [
  // --- Queries ----------------------------------------------------------
  graphql.query('ProjectTasks', async ({ variables, request }) => {
    await networkDelay();
    if (!authenticate(request)) return HttpResponse.json(errorBody('Unauthorized', 'UNAUTHENTICATED'));
    const tasks = db.tasks
      .filter((t) => t.projectId === variables.projectId)
      .sort((a, b) => a.order - b.order)
      .map(serializeTask);
    return HttpResponse.json({ data: { tasks } });
  }),

  graphql.query('TaskDetail', async ({ variables, request }) => {
    await networkDelay();
    if (!authenticate(request)) return HttpResponse.json(errorBody('Unauthorized', 'UNAUTHENTICATED'));
    const task = db.tasks.find((t) => t.id === variables.id);
    if (!task) return HttpResponse.json({ data: { task: null } });
    const comments = db.comments
      .filter((c) => c.taskId === task.id)
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      )
      .map(serializeComment);
    return HttpResponse.json({
      data: { task: { ...serializeTask(task), comments } },
    });
  }),

  graphql.query('MyTasks', async ({ variables, request }) => {
    await networkDelay();
    if (!authenticate(request)) return HttpResponse.json(errorBody('Unauthorized', 'UNAUTHENTICATED'));
    const tasks = db.tasks
      .filter(
        (t) => t.assigneeId === variables.assigneeId && t.status !== 'done',
      )
      .sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      })
      .slice(0, 8)
      .map((t) => {
        const project = db.projects.find((p) => p.id === t.projectId);
        return {
          ...serializeTask(t),
          project: project
            ? {
                __typename: 'Project' as const,
                id: project.id,
                name: project.name,
                key: project.key,
                color: project.color,
              }
            : null,
        };
      });
    return HttpResponse.json({ data: { myTasks: tasks } });
  }),

  // --- Mutations --------------------------------------------------------
  graphql.mutation('CreateTask', async ({ variables, request }) => {
    await networkDelay();
    if (!authenticate(request)) return HttpResponse.json(errorBody('Unauthorized', 'UNAUTHENTICATED'));
    const input = variables.input as CreateTaskInput;
    const status: TaskStatus = 'todo';
    const order =
      db.tasks.filter(
        (t) => t.projectId === input.projectId && t.status === status,
      ).length;
    const ts = new Date().toISOString();
    const task: Task = {
      id: nextId('task'),
      projectId: input.projectId,
      title: input.title,
      description: input.description ?? '',
      status,
      priority: input.priority ?? 'medium',
      assigneeId: input.assigneeId ?? null,
      dueDate: input.dueDate ?? null,
      order,
      createdAt: ts,
      updatedAt: ts,
    };
    db.tasks.push(task);
    return HttpResponse.json({ data: { createTask: serializeTask(task) } });
  }),

  graphql.mutation('UpdateTask', async ({ variables, request }) => {
    await networkDelay();
    if (!authenticate(request)) return HttpResponse.json(errorBody('Unauthorized', 'UNAUTHENTICATED'));
    const task = db.tasks.find((t) => t.id === variables.id);
    if (!task) return HttpResponse.json(errorBody('Task not found', 'NOT_FOUND'));
    const input = variables.input as UpdateTaskInput;
    Object.assign(task, {
      title: input.title ?? task.title,
      description: input.description ?? task.description,
      priority: input.priority ?? task.priority,
      status: input.status ?? task.status,
      assigneeId:
        input.assigneeId === undefined ? task.assigneeId : input.assigneeId,
      dueDate: input.dueDate === undefined ? task.dueDate : input.dueDate,
      updatedAt: new Date().toISOString(),
    });
    return HttpResponse.json({ data: { updateTask: serializeTask(task) } });
  }),

  graphql.mutation('MoveTask', async ({ variables, request }) => {
    await networkDelay();
    if (!authenticate(request)) return HttpResponse.json(errorBody('Unauthorized', 'UNAUTHENTICATED'));
    const task = db.tasks.find((t) => t.id === variables.id);
    if (!task) return HttpResponse.json(errorBody('Task not found', 'NOT_FOUND'));
    const status = variables.status as TaskStatus;
    const order = variables.order as number;
    // Re-pack ordering within the destination column.
    const siblings = db.tasks
      .filter((t) => t.projectId === task.projectId && t.status === status && t.id !== task.id)
      .sort((a, b) => a.order - b.order);
    siblings.splice(order, 0, task);
    task.status = status;
    task.updatedAt = new Date().toISOString();
    siblings.forEach((t, i) => {
      t.order = i;
    });
    return HttpResponse.json({ data: { moveTask: serializeTask(task) } });
  }),

  graphql.mutation('DeleteTask', async ({ variables, request }) => {
    await networkDelay();
    if (!authenticate(request)) return HttpResponse.json(errorBody('Unauthorized', 'UNAUTHENTICATED'));
    const idx = db.tasks.findIndex((t) => t.id === variables.id);
    if (idx === -1) return HttpResponse.json(errorBody('Task not found', 'NOT_FOUND'));
    db.tasks.splice(idx, 1);
    db.comments = db.comments.filter((c) => c.taskId !== variables.id);
    return HttpResponse.json({ data: { deleteTask: { id: variables.id } } });
  }),

  graphql.mutation('AddComment', async ({ variables, request }) => {
    await networkDelay();
    const user = authenticate(request);
    if (!user) return HttpResponse.json(errorBody('Unauthorized', 'UNAUTHENTICATED'));
    const task = db.tasks.find((t) => t.id === variables.taskId);
    if (!task) return HttpResponse.json(errorBody('Task not found', 'NOT_FOUND'));
    const comment: Comment = {
      id: nextId('comment'),
      taskId: variables.taskId as string,
      authorId: user.id,
      body: variables.body as string,
      createdAt: new Date().toISOString(),
    };
    db.comments.push(comment);
    return HttpResponse.json({
      data: { addComment: serializeComment(comment) },
    });
  }),
];
