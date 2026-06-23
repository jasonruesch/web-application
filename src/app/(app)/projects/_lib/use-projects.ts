import { notFound } from '@evolonix/react-router-next';
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { api, ApiError } from '~/lib/api-client';
import type { Project, ProjectStats, ProjectWithMembers, User } from '~/types';

export interface ProjectListParams {
  q?: string;
  sort?: 'recent' | 'name';
}

export const projectKeys = {
  all: ['projects'] as const,
  list: (params: ProjectListParams) => ['projects', 'list', params] as const,
  detail: (id: string) => ['projects', 'detail', id] as const,
  stats: (id: string) => ['projects', 'stats', id] as const,
  dashboardStats: ['projects', 'dashboard-stats'] as const,
  users: ['users'] as const,
};

function buildQuery(params: ProjectListParams): string {
  const search = new URLSearchParams();
  if (params.q) search.set('q', params.q);
  if (params.sort) search.set('sort', params.sort);
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

/** REST: list the current user's projects (suspends). */
export function useProjects(params: ProjectListParams) {
  return useSuspenseQuery({
    queryKey: projectKeys.list(params),
    queryFn: () =>
      api.get<ProjectWithMembers[]>(`/api/projects${buildQuery(params)}`),
  });
}

/** REST: a single project. A 404 routes to the nearest `not-found.tsx`. */
export function useProject(id: string) {
  return useSuspenseQuery({
    queryKey: projectKeys.detail(id),
    queryFn: async () => {
      try {
        return await api.get<ProjectWithMembers>(`/api/projects/${id}`);
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) notFound();
        throw error;
      }
    },
  });
}

export function useProjectStats(id: string) {
  return useSuspenseQuery({
    queryKey: projectKeys.stats(id),
    queryFn: () => api.get<ProjectStats>(`/api/projects/${id}/stats`),
  });
}

export function useDashboardStats() {
  return useSuspenseQuery({
    queryKey: projectKeys.dashboardStats,
    queryFn: () => api.get<ProjectStats>('/api/stats'),
  });
}

export function useUsers() {
  return useSuspenseQuery({
    queryKey: projectKeys.users,
    queryFn: () => api.get<User[]>('/api/users'),
  });
}

export interface CreateProjectInput {
  name: string;
  key: string;
  description?: string;
  color?: string;
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProjectInput) =>
      api.post<ProjectWithMembers>('/api/projects', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}

export function useUpdateProject(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<Project>) =>
      api.patch<ProjectWithMembers>(`/api/projects/${id}`, patch),
    onSuccess: (updated) => {
      queryClient.setQueryData(projectKeys.detail(id), updated);
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/api/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}
