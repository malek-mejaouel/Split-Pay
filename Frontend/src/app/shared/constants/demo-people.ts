import type { AvatarColor } from '../../models';

/** Minimal person shape needed to render an avatar. */
export interface AvatarPerson {
  initials: string;
  avatarColor: AvatarColor;
}

/**
 * Decorative cast of the design (Maya, Leo, Nora, Sam) used by avatars that are
 * not bound to real data — e.g. the "3 friends" stack on a summary card.
 *
 * Real screens pass their own `GroupMember[]` / `ExpenseShare[]` instead.
 */
export const DEMO_PEOPLE: readonly AvatarPerson[] = [
  { initials: 'MP', avatarColor: 'lavender' },
  { initials: 'LK', avatarColor: 'mint' },
  { initials: 'NS', avatarColor: 'coral' },
  { initials: 'SB', avatarColor: 'blue' },
];
