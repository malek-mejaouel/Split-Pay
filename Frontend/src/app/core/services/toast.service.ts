import { Injectable, signal } from '@angular/core';

export type ToastTone = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  tone: ToastTone;
  message: string;
  /** Optional call-to-action label. */
  actionLabel: string | null;
}

/**
 * Tiny global toast store, driven by signals.
 *
 * The error interceptor pushes here, and `ToastContainerComponent` (mounted in
 * the app shell) renders the stack.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private static nextId = 1;

  private readonly items = signal<Toast[]>([]);
  private readonly timers = new Map<number, number>();

  readonly toasts = this.items.asReadonly();

  show(message: string, tone: ToastTone = 'info', ttlMs = 4200, actionLabel: string | null = null): number {
    const id = ToastService.nextId++;
    this.items.update((current) => [...current, { id, tone, message, actionLabel }]);

    if (ttlMs > 0) {
      const handle = globalThis.setTimeout(() => this.dismiss(id), ttlMs);
      this.timers.set(id, handle);
    }
    return id;
  }

  success(message: string, ttlMs = 4200): number {
    return this.show(message, 'success', ttlMs);
  }

  error(message: string, ttlMs = 6000): number {
    return this.show(message, 'error', ttlMs);
  }

  info(message: string, ttlMs = 4200): number {
    return this.show(message, 'info', ttlMs);
  }

  dismiss(id: number): void {
    const handle = this.timers.get(id);
    if (handle !== undefined) {
      globalThis.clearTimeout(handle);
      this.timers.delete(id);
    }
    this.items.update((current) => current.filter((toast) => toast.id !== id));
  }

  clear(): void {
    this.timers.forEach((handle) => globalThis.clearTimeout(handle));
    this.timers.clear();
    this.items.set([]);
  }
}
