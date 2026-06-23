import { beforeEach, describe, expect, it } from 'vitest';
import type { User } from '~/types';
import { getToken, useSessionStore } from './session.store';

const user: User = {
  id: 'user-1',
  name: 'Avery Quinn',
  email: 'avery@taskflow.app',
  avatarUrl: '',
  jobTitle: 'Product Lead',
};

describe('session store', () => {
  beforeEach(() => useSessionStore.getState().clear());

  it('stores a session and exposes the token non-reactively', () => {
    useSessionStore.getState().setSession(user, 'mock.token');
    expect(useSessionStore.getState().user).toEqual(user);
    expect(getToken()).toBe('mock.token');
  });

  it('patches the current user without dropping the token', () => {
    useSessionStore.getState().setSession(user, 'mock.token');
    useSessionStore.getState().updateUser({ jobTitle: 'Founder' });
    expect(useSessionStore.getState().user?.jobTitle).toBe('Founder');
    expect(getToken()).toBe('mock.token');
  });

  it('clears the session', () => {
    useSessionStore.getState().setSession(user, 'mock.token');
    useSessionStore.getState().clear();
    expect(useSessionStore.getState().user).toBeNull();
    expect(getToken()).toBeNull();
  });
});
