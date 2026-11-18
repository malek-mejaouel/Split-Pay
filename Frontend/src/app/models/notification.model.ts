export type NotificationType = 'PAYMENT' | 'REMINDER' | 'EXPENSE' | 'GOAL' | 'FRAUD';

export type NotificationTone = 'green' | 'coral' | 'violet' | 'amber' | 'neutral';

/** Tab ids of the notifications page. */
export type NotificationFilter = 'all' | 'payments' | 'reminders';

/**
 * Notification-service `Notification` DTO.
 *
 * Named `AppNotification` to avoid clashing with the DOM `Notification` type.
 */
export interface AppNotification {
  id: string;
  type: NotificationType;
  /** Emoji shown inside the tile. */
  emoji: string;
  tone: NotificationTone;
  title: string;
  body: string;
  occurredAt: string;
  read: boolean;
}

/** Unread counter pushed by the notification service. */
export interface NotificationBadge {
  unread: number;
}
