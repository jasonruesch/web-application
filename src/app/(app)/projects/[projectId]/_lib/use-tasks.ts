import { gql } from '@apollo/client';
import { useMutation, useSuspenseQuery } from '@apollo/client/react';
import { notFound } from '@evolonix/react-router-next';
import type {
  CommentWithAuthor,
  Project,
  TaskPriority,
  TaskWithAssignee,
} from '~/types';

const TASK_FIELDS = gql`
  fragment TaskFields on Task {
    id
    projectId
    title
    description
    status
    priority
    assigneeId
    dueDate
    order
    createdAt
    updatedAt
    assignee {
      id
      name
      email
      avatarUrl
      jobTitle
    }
  }
`;

const PROJECT_TASKS = gql`
  ${TASK_FIELDS}
  query ProjectTasks($projectId: ID!) {
    tasks(projectId: $projectId) {
      ...TaskFields
    }
  }
`;

const TASK_DETAIL = gql`
  ${TASK_FIELDS}
  query TaskDetail($id: ID!) {
    task(id: $id) {
      ...TaskFields
      comments {
        id
        taskId
        body
        createdAt
        author {
          id
          name
          email
          avatarUrl
          jobTitle
        }
      }
    }
  }
`;

const MY_TASKS = gql`
  ${TASK_FIELDS}
  query MyTasks($assigneeId: ID!) {
    myTasks(assigneeId: $assigneeId) {
      ...TaskFields
      project {
        id
        name
        key
        color
      }
    }
  }
`;

const CREATE_TASK = gql`
  ${TASK_FIELDS}
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      ...TaskFields
    }
  }
`;

const UPDATE_TASK = gql`
  ${TASK_FIELDS}
  mutation UpdateTask($id: ID!, $input: UpdateTaskInput!) {
    updateTask(id: $id, input: $input) {
      ...TaskFields
    }
  }
`;

const MOVE_TASK = gql`
  ${TASK_FIELDS}
  mutation MoveTask($id: ID!, $status: TaskStatus!, $order: Int!) {
    moveTask(id: $id, status: $status, order: $order) {
      ...TaskFields
    }
  }
`;

const ADD_COMMENT = gql`
  mutation AddComment($taskId: ID!, $body: String!) {
    addComment(taskId: $taskId, body: $body) {
      id
      taskId
      body
      createdAt
      author {
        id
        name
        email
        avatarUrl
        jobTitle
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

type TaskDetailData = TaskWithAssignee & { comments: CommentWithAuthor[] };
type MyTask = TaskWithAssignee & {
  project: Pick<Project, 'id' | 'name' | 'key' | 'color'> | null;
};

/** GraphQL: all tasks for a project board (suspends). */
export function useProjectTasks(projectId: string) {
  return useSuspenseQuery<{ tasks: TaskWithAssignee[] }>(PROJECT_TASKS, {
    variables: { projectId },
  });
}

/** GraphQL: a task with its comments. Missing → not-found boundary. */
export function useTask(id: string) {
  const result = useSuspenseQuery<{ task: TaskDetailData | null }>(TASK_DETAIL, {
    variables: { id },
  });
  if (result.data.task === null) notFound();
  return result as typeof result & { data: { task: TaskDetailData } };
}

/** GraphQL: tasks assigned to a user for the dashboard. */
export function useMyTasks(assigneeId: string) {
  return useSuspenseQuery<{ myTasks: MyTask[] }>(MY_TASKS, {
    variables: { assigneeId },
  });
}

export interface CreateTaskInput {
  projectId: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  assigneeId?: string | null;
  dueDate?: string | null;
}

export function useCreateTask(projectId: string) {
  return useMutation<{ createTask: TaskWithAssignee }>(CREATE_TASK, {
    // Add the new task into the board's cached list.
    update(cache, { data }) {
      if (!data) return;
      cache.updateQuery<{ tasks: TaskWithAssignee[] }>(
        { query: PROJECT_TASKS, variables: { projectId } },
        (existing) =>
          existing
            ? { tasks: [...existing.tasks, data.createTask] }
            : existing,
      );
    },
  });
}

export function useUpdateTask() {
  return useMutation(UPDATE_TASK);
}

export function useMoveTask() {
  return useMutation(MOVE_TASK);
}

export function useDeleteTask(projectId: string) {
  return useMutation<{ deleteTask: { id: string } }>(DELETE_TASK, {
    update(cache, { data }) {
      if (!data) return;
      cache.updateQuery<{ tasks: TaskWithAssignee[] }>(
        { query: PROJECT_TASKS, variables: { projectId } },
        (existing) =>
          existing
            ? { tasks: existing.tasks.filter((t) => t.id !== data.deleteTask.id) }
            : existing,
      );
      cache.evict({ id: cache.identify({ __typename: 'Task', id: data.deleteTask.id }) });
      cache.gc();
    },
  });
}

export function useAddComment() {
  return useMutation<{ addComment: CommentWithAuthor }>(ADD_COMMENT, {
    update(cache, { data }, { variables }) {
      if (!data || !variables) return;
      cache.updateQuery<{ task: TaskDetailData | null }>(
        { query: TASK_DETAIL, variables: { id: variables.taskId } },
        (existing) =>
          existing?.task
            ? {
                task: {
                  ...existing.task,
                  comments: [...existing.task.comments, data.addComment],
                },
              }
            : existing,
      );
    },
  });
}

export { MOVE_TASK, PROJECT_TASKS };
