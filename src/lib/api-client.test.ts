import { beforeEach, describe, expect, it } from 'vitest';
import { createToken } from '~/mocks/auth';
import { DEMO_EMAIL, DEMO_PASSWORD } from '~/mocks/db';
import { useSessionStore } from '~/stores/session.store';
import type { ProjectWithMembers, User } from '~/types';
import { ApiError, api } from './api-client';

describe('api-client (REST via MSW)', () => {
  beforeEach(() => useSessionStore.getState().clear());

  it('logs in with valid credentials', async () => {
    const result = await api.post<{ token: string; user: User }>(
      '/api/auth/login',
      { email: DEMO_EMAIL, password: DEMO_PASSWORD },
    );
    expect(result.user.email).toBe(DEMO_EMAIL);
    expect(result.token).toMatch(/^mock\./);
  });

  it('throws an ApiError(401) for bad credentials', async () => {
    await expect(
      api.post('/api/auth/login', { email: DEMO_EMAIL, password: 'wrong' }),
    ).rejects.toMatchObject({ status: 401 });
  });

  it('attaches the bearer token to authenticated requests', async () => {
    useSessionStore.getState().setSession(
      {
        id: 'user-1',
        name: 'Avery',
        email: DEMO_EMAIL,
        avatarUrl: '',
        jobTitle: '',
      },
      createToken('user-1'),
    );
    const projects = await api.get<ProjectWithMembers[]>('/api/projects');
    expect(Array.isArray(projects)).toBe(true);
    expect(projects.length).toBeGreaterThan(0);
    expect(projects[0]).toHaveProperty('members');
  });

  it('clears the session on a 401 to an authenticated request', async () => {
    useSessionStore.getState().setSession(
      {
        id: 'ghost',
        name: 'Ghost',
        email: 'ghost@taskflow.app',
        avatarUrl: '',
        jobTitle: '',
      },
      createToken('does-not-exist'),
    );
    await expect(api.get('/api/projects')).rejects.toBeInstanceOf(ApiError);
    expect(useSessionStore.getState().user).toBeNull();
  });
});
