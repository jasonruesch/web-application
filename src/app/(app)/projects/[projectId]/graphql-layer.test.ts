import { type ApolloClient, gql } from '@apollo/client';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApolloClient } from '~/lib/apollo';
import { createToken } from '~/mocks/auth';
import { db } from '~/mocks/db';
import { useSessionStore } from '~/stores/session.store';

/**
 * Exercises the GraphQL transport end-to-end (Apollo client → MSW handlers →
 * shared in-memory DB) without React suspense rendering, which Apollo 4 does
 * not drive under jsdom. The rendered suspense path is covered by E2E.
 */

const PROJECT_TASKS = gql`
  query ProjectTasks($projectId: ID!) {
    tasks(projectId: $projectId) {
      id
      title
      status
      order
      assigneeId
    }
  }
`;
const CREATE_TASK = gql`
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      id
      title
      status
    }
  }
`;
const MOVE_TASK = gql`
  mutation MoveTask($id: ID!, $status: TaskStatus!, $order: Int!) {
    moveTask(id: $id, status: $status, order: $order) {
      id
      status
    }
  }
`;
const ADD_COMMENT = gql`
  mutation AddComment($taskId: ID!, $body: String!) {
    addComment(taskId: $taskId, body: $body) {
      id
      body
      author {
        id
        name
      }
    }
  }
`;
const DELETE_TASK = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id) {
      id
    }
  }
`;

function firstTaskOf(projectId: string) {
  return db.tasks.find((t) => t.projectId === projectId)!;
}

describe('GraphQL layer (Apollo ↔ MSW ↔ shared DB)', () => {
  let client: ApolloClient;

  beforeEach(() => {
    const user = db.users.find((u) => u.id === 'user-1')!;
    useSessionStore.getState().setSession(user, createToken(user.id));
    client = createApolloClient();
  });

  it('queries a project board of tasks', async () => {
    const { data } = await client.query<{ tasks: { id: string }[] }>({
      query: PROJECT_TASKS,
      variables: { projectId: 'project-1' },
    });
    const seeded = db.tasks.filter((t) => t.projectId === 'project-1').length;
    expect(data?.tasks).toHaveLength(seeded);
  });

  it('creates a task into the todo column', async () => {
    const before = db.tasks.length;
    const { data } = await client.mutate<{
      createTask: { title: string; status: string };
    }>({
      mutation: CREATE_TASK,
      variables: { input: { projectId: 'project-1', title: 'Wire up billing' } },
    });
    expect(data?.createTask.title).toBe('Wire up billing');
    expect(data?.createTask.status).toBe('todo');
    expect(db.tasks).toHaveLength(before + 1);
  });

  it('moves a task to a new status column', async () => {
    const task = firstTaskOf('project-1');
    const { data } = await client.mutate<{ moveTask: { status: string } }>({
      mutation: MOVE_TASK,
      variables: { id: task.id, status: 'done', order: 0 },
    });
    expect(data?.moveTask.status).toBe('done');
    expect(db.tasks.find((t) => t.id === task.id)?.status).toBe('done');
  });

  it('adds a comment authored by the current user', async () => {
    const task = firstTaskOf('project-1');
    const before = db.comments.filter((c) => c.taskId === task.id).length;
    const { data } = await client.mutate<{
      addComment: { body: string; author: { id: string } };
    }>({
      mutation: ADD_COMMENT,
      variables: { taskId: task.id, body: 'Shipping today' },
    });
    expect(data?.addComment.body).toBe('Shipping today');
    expect(data?.addComment.author.id).toBe('user-1');
    expect(db.comments.filter((c) => c.taskId === task.id)).toHaveLength(
      before + 1,
    );
  });

  it('deletes a task and its comments', async () => {
    const task = firstTaskOf('project-1');
    await client.mutate({ mutation: DELETE_TASK, variables: { id: task.id } });
    expect(db.tasks.find((t) => t.id === task.id)).toBeUndefined();
    expect(db.comments.filter((c) => c.taskId === task.id)).toHaveLength(0);
  });

  it('rejects unauthenticated GraphQL requests', async () => {
    useSessionStore.getState().clear();
    const anon = createApolloClient();
    await expect(
      anon.query({
        query: PROJECT_TASKS,
        variables: { projectId: 'project-1' },
      }),
    ).rejects.toThrow(/unauthorized/i);
  });
});
