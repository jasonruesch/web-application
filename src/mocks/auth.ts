import { db, findUser } from './db';
import type { User } from '~/types';

/**
 * Mock bearer-token scheme: the token is just the base64url-encoded user id.
 * Good enough to demonstrate an authenticated session end-to-end without a
 * real auth server.
 */
export function createToken(userId: string): string {
  return `mock.${btoa(userId)}`;
}

export function userIdFromToken(token: string | null): string | null {
  if (!token || !token.startsWith('mock.')) return null;
  try {
    return atob(token.slice('mock.'.length));
  } catch {
    return null;
  }
}

/** Resolve the authenticated user from a request's Authorization header. */
export function authenticate(request: Request): User | null {
  const header = request.headers.get('Authorization');
  if (!header?.startsWith('Bearer ')) return null;
  const userId = userIdFromToken(header.slice('Bearer '.length));
  const user = findUser(userId);
  return user && db.users.includes(user) ? user : null;
}
