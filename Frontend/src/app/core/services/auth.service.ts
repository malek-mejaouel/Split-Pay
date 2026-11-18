import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, tap } from 'rxjs';

import { environment } from '@env/environment';
import { API_PREFIX } from '../constants/api-endpoints';
import {
  MOCK_CURRENT_USER,
  MOCK_USER_STATS,
  mockOf,
} from '../../mock';
import type {
  AuthResponse,
  AuthTokens,
  CompleteProfileRequest,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  User,
  UserStats,
} from '../../models';
import { TokenStorageService } from './token-storage.service';

/**
 * Authentication against the **Account service** (through the gateway).
 *
 * Responsibilities: login, register, profile updates, logout and token storage.
 * Tokens are persisted by `TokenStorageService` so the HTTP interceptor can read
 * them without creating a DI cycle.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly storage = inject(TokenStorageService);

  /** Current user, or `null` when signed out. */
  readonly user = this.storage.user;
  /** Raw JWT. */
  readonly token = this.storage.token;
  /** `true` when a token is present. */
  readonly isAuthenticated = computed(() => this.storage.token() !== null);
  /** First name used in greetings ("Hey Maya"). */
  readonly firstName = computed(() => this.storage.user()?.firstName ?? 'there');

  login(request: LoginRequest): Observable<AuthResponse> {
    if (environment.useMockData) {
      const response = this.buildMockAuthResponse();
      this.storage.setSession(response.tokens.accessToken, response.user, request.rememberMe);
      return mockOf(response);
    }

    return this.http
      .post<AuthResponse>(`${environment.apiUrl}${API_PREFIX.accounts}/auth/login`, request)
      .pipe(tap((response) => this.storage.setSession(response.tokens.accessToken, response.user, request.rememberMe)));
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    if (environment.useMockData) {
      const response = this.buildMockAuthResponse();
      this.storage.setSession(response.tokens.accessToken, response.user, true);
      return mockOf(response);
    }

    return this.http
      .post<AuthResponse>(`${environment.apiUrl}${API_PREFIX.accounts}/auth/register`, request)
      .pipe(tap((response) => this.storage.setSession(response.tokens.accessToken, response.user, true)));
  }

  /** Onboarding step 2 — display name + default currency. */
  completeProfile(request: CompleteProfileRequest): Observable<User> {
    if (environment.useMockData) {
      const updated: User = {
        ...MOCK_CURRENT_USER,
        fullName: `${request.displayName} ${MOCK_CURRENT_USER.fullName.split(' ').slice(1).join(' ')}`.trim(),
        firstName: request.displayName,
        defaultCurrency: request.currency,
      };
      this.storage.setUser(updated);
      return mockOf(updated);
    }

    return this.http
      .post<User>(`${environment.apiUrl}${API_PREFIX.accounts}/me/profile`, request)
      .pipe(tap((user) => this.storage.setUser(user)));
  }

  updateProfile(request: UpdateProfileRequest): Observable<User> {
    if (environment.useMockData) {
      const current = this.storage.user() ?? MOCK_CURRENT_USER;
      const updated: User = {
        ...current,
        fullName: request.fullName ?? current.fullName,
        handle: request.handle ?? current.handle,
        email: request.email ?? current.email,
        phone: request.phone ?? current.phone,
      };
      this.storage.setUser(updated);
      return mockOf(updated);
    }

    return this.http
      .patch<User>(`${environment.apiUrl}${API_PREFIX.accounts}/me`, request)
      .pipe(tap((user) => this.storage.setUser(user)));
  }

  /** Profile counters (households / splits / friends). */
  getStats(): Observable<UserStats> {
    if (environment.useMockData) {
      return mockOf(MOCK_USER_STATS);
    }
    return this.http.get<UserStats>(`${environment.apiUrl}${API_PREFIX.accounts}/me/stats`);
  }

  /**
   * Clears the session.
   *
   * @param redirect navigate to the sign-in page (default `true`). The 401
   * interception path handles its own redirect.
   */
  logout(redirect = true): void {
    this.storage.clear();
    if (redirect) {
      void this.router.navigate(['/auth/sign-in']);
    }
  }

  /** `true` when an email looks usable — mirrors the original form validation. */
  static isValidEmail(email: string): boolean {
    return email.includes('@');
  }

  /** Minimum password length enforced in the design. */
  static readonly minPasswordLength = 8;

  private buildMockAuthResponse(): AuthResponse {
    const tokens: AuthTokens = {
      accessToken: `mock.jwt.${Date.now()}`,
      refreshToken: 'mock.refresh.jwt',
      tokenType: 'Bearer',
      expiresIn: 3600,
    };
    return { user: MOCK_CURRENT_USER, tokens };
  }

  /** Convenience for the profile page (mock-friendly). */
  refreshStats(): Observable<UserStats> {
    return this.getStats() ?? of(MOCK_USER_STATS);
  }
}
