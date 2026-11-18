import { Injectable, computed, effect, signal } from '@angular/core';

import { STORAGE_KEYS } from '../constants/api-endpoints';

export type ThemeMode = 'light' | 'dark';

/**
 * Light/dark theme, applied as `data-theme` on `<html>`.
 *
 * Every colour lives in a CSS custom property (see `styles/_variables.scss`),
 * so toggling the attribute re-themes the whole app.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly mode = signal<ThemeMode>(this.readInitialMode());

  readonly current = this.mode.asReadonly();
  readonly isDark = computed(() => this.mode() === 'dark');

  constructor() {
    effect(() => {
      const mode = this.mode();
      if (typeof document !== 'undefined') {
        document.documentElement.dataset['theme'] = mode;
      }
      try {
        globalThis.localStorage?.setItem(STORAGE_KEYS.theme, mode);
      } catch {
        /* ignore */
      }
    });
  }

  set(mode: ThemeMode): void {
    this.mode.set(mode);
  }

  toggle(): void {
    this.mode.update((mode) => (mode === 'dark' ? 'light' : 'dark'));
  }

  private readInitialMode(): ThemeMode {
    try {
      const stored = globalThis.localStorage?.getItem(STORAGE_KEYS.theme);
      if (stored === 'dark' || stored === 'light') {
        return stored;
      }
    } catch {
      /* ignore */
    }
    const prefersDark =
      typeof globalThis.matchMedia === 'function' &&
      globalThis.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }
}
