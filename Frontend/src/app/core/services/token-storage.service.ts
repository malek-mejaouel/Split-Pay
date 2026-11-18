import { Injectable, signal } from '@angular/core';

import type { User } from '../../models';
import { STORAGE_KEYS } from '../constants/api-endpoints';

/**
 * Owns the JWT + current user in memory (signals) and in `localStorage`.
 *
 * This service deliberately has **no** dependency on `HttpClient`, so it can be
 * injected from interceptors without creating a DI cycle.
 */
@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  private readonly accessToken = signal<string | null>(this.readToken());
  private readonly currentUser = signal<User | null>(this.readUser());

  /** Read-only view of the bearer token. */
  readonly token = this.accessToken.asReadonly();

  /** Read-only view of the signed-in user. */
  readonly user = this.currentUser.asReadonly();

  setSession(token: string, user: User, rememberMe: boolean): void {
    this.accessToken.set(token);
    this.currentUser.set(user);
    this.safeWrite(STORAGE_KEYS.token, token);
    this.safeWrite(STORAGE_KEYS.user, JSON.stringify(user));
    if (!rememberMe) {
      // Kept in memory only: the session dies with the tab.
      this.safeRemove(STORAGE_KEYS.refreshToken);
    }
  }

  setUser(user: User): void {
    this.currentUser.set(user);
    this.safeWrite(STORAGE_KEYS.user, JSON.stringify(user));
  }

  clear(): void {
    this.accessToken.set(null);
    this.currentUser.set(null);
    this.safeRemove(STORAGE_KEYS.token);
    this.safeRemove(STORAGE_KEYS.refreshToken);
    this.safeRemove(STORAGE_KEYS.user);
  }

  private readToken(): string | null {
    return this.safeRead(STORAGE_KEYS.token);
  }

  private readUser(): User | null {
    const raw = this.safeRead(STORAGE_KEYS.user);
    if (raw === null) {
      return null;
    }
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }

  private safeRead(key: string): string | null {
    try {
      return globalThis.localStorage?.getItem(key) ?? null;
    } catch {
      return null;
    }
  }

  private safeWrite(key: string, value: string): void {
    try {
      globalThis.localStorage?.setItem(key, value);
    } catch {
      /* storage unavailable (private mode) — keep the in-memory session */
    }
  }

  private safeRemove(key: string): void {
    try {
      globalThis.localStorage?.removeItem(key);
    } catch {
      /* ignore */
    }
  }
}
