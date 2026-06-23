/**
 * Shared domain models. These are the canonical shapes used across both the
 * REST layer (auth, projects) and the GraphQL layer (tasks, comments), so the
 * UI works with one consistent set of types regardless of transport.
 */

export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ProjectRole = 'owner' | 'admin' | 'member';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  jobTitle: string;
}

export interface Project {
  id: string;
  name: string;
  key: string;
  description: string;
  color: string;
  ownerId: string;
  memberIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  dueDate: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  taskId: string;
  authorId: string;
  body: string;
  createdAt: string;
}

/** A task with its assignee resolved — what GraphQL returns to the UI. */
export interface TaskWithAssignee extends Task {
  assignee: User | null;
}

export interface CommentWithAuthor extends Comment {
  author: User;
}

/** A project with its members resolved and task counts — REST list/detail shape. */
export interface ProjectWithMembers extends Project {
  members: User[];
  owner: User;
  taskCount: number;
  openTaskCount: number;
}

export interface ProjectStats {
  total: number;
  byStatus: Record<TaskStatus, number>;
  overdue: number;
  completedThisWeek: number;
}

export const TASK_STATUSES: readonly TaskStatus[] = [
  'todo',
  'in_progress',
  'in_review',
  'done',
] as const;

export const TASK_PRIORITIES: readonly TaskPriority[] = [
  'low',
  'medium',
  'high',
  'urgent',
] as const;

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To do',
  in_progress: 'In progress',
  in_review: 'In review',
  done: 'Done',
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};
