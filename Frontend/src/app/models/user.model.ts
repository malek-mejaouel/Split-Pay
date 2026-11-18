/** Avatar tint tokens available in the design system. */
export type AvatarColor = 'lavender' | 'mint' | 'coral' | 'blue';

/** Avatar size tokens. */
export type AvatarSize = 'sm' | 'md' | 'lg';

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'TND';

/** Account-service `User` DTO. */
export interface User {
  id: string;
  fullName: string;
  firstName: string;
  email: string;
  handle: string;
  initials: string;
  avatarColor: AvatarColor;
  phone: string | null;
  defaultCurrency: CurrencyCode;
  studentVerified: boolean;
  createdAt: string;
}

/** Aggregated counters shown on the profile card. */
export interface UserStats {
  households: number;
  splits: number;
  friends: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string | null;
  tokenType: 'Bearer';
  expiresIn: number;
}

/** Payload for `POST /api/accounts/auth/login`. */
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe: boolean;
}

/** Payload for `POST /api/accounts/auth/register`. */
export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  acceptedTerms: boolean;
}

/** Payload for `POST /api/accounts/me/profile` (onboarding step 2). */
export interface CompleteProfileRequest {
  displayName: string;
  currency: CurrencyCode;
}

/** Payload for `PATCH /api/accounts/me`. */
export interface UpdateProfileRequest {
  fullName?: string;
  handle?: string;
  email?: string;
  phone?: string;
}

/** Response of the login / register endpoints. */
export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

/** Static reference data used by the "default currency" setting. */
export interface CurrencyOption {
  code: CurrencyCode;
  label: string;
}
