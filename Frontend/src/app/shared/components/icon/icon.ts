import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Every glyph used by the design (ported 1:1 from the Figma export). */
export type IconName =
  | 'home'
  | 'users'
  | 'wallet'
  | 'repeat'
  | 'target'
  | 'bell'
  | 'settings'
  | 'plus'
  | 'arrowUp'
  | 'arrowDown'
  | 'send'
  | 'search'
  | 'moon'
  | 'sun'
  | 'chevron'
  | 'receipt'
  | 'check'
  | 'grid'
  | 'close'
  | 'more'
  | 'camera'
  | 'lock'
  | 'logout'
  | 'edit'
  | 'calendar'
  | 'filter';

/**
 * Inline SVG icon.
 *
 * Replaces the React `Icon` component: same 24×24 viewBox, same stroke width,
 * `currentColor` so icons inherit the surrounding text colour.
 */
@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.9"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      @switch (name()) {
        @case ('home') {
          <path d="m3 10 9-7 9 7" />
          <path d="M5 9v11h14V9M9 20v-6h6v6" />
        }
        @case ('users') {
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        }
        @case ('wallet') {
          <path d="M20 7V5a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h15v12H5a3 3 0 0 1-3-3V6" />
          <path d="M16 13h.01" />
        }
        @case ('repeat') {
          <path d="m17 1 4 4-4 4" />
          <path d="M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4" />
          <path d="M21 13v2a4 4 0 0 1-4 4H3" />
        }
        @case ('target') {
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="1" />
        }
        @case ('bell') {
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
        }
        @case ('settings') {
          <circle cx="12" cy="12" r="3" />
          <path
            d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.1A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3v-4h.1A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.1A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.34.28.55.68.6 1.1v.1h1v4h-.1A1.7 1.7 0 0 0 19.4 15Z"
          />
        }
        @case ('plus') {
          <path d="M12 5v14M5 12h14" />
        }
        @case ('arrowUp') {
          <path d="m18 15-6-6-6 6" />
          <path d="M12 9v10" />
        }
        @case ('arrowDown') {
          <path d="m6 9 6 6 6-6" />
          <path d="M12 5v10" />
        }
        @case ('send') {
          <path d="m22 2-7 20-4-9-9-4Z" />
          <path d="M22 2 11 13" />
        }
        @case ('search') {
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        }
        @case ('moon') {
          <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z" />
        }
        @case ('sun') {
          <circle cx="12" cy="12" r="4" />
          <path
            d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41"
          />
        }
        @case ('chevron') {
          <path d="m9 18 6-6-6-6" />
        }
        @case ('receipt') {
          <path d="M4 2v20l3-2 3 2 2-2 3 2 2-2 3 2V2l-3 2-3-2-2 2-3-2-2 2Zm4 7h8M8 13h6" />
        }
        @case ('check') {
          <path d="m5 12 4 4L19 6" />
        }
        @case ('grid') {
          <rect x="3" y="3" width="7" height="7" rx="2" />
          <rect x="14" y="3" width="7" height="7" rx="2" />
          <rect x="3" y="14" width="7" height="7" rx="2" />
          <rect x="14" y="14" width="7" height="7" rx="2" />
        }
        @case ('close') {
          <path d="m6 6 12 12M18 6 6 18" />
        }
        @case ('more') {
          <circle cx="5" cy="12" r="1" />
          <circle cx="12" cy="12" r="1" />
          <circle cx="19" cy="12" r="1" />
        }
        @case ('camera') {
          <path d="M14.5 4 16 7h4a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h4l1.5-3Z" />
          <circle cx="12" cy="13" r="3" />
        }
        @case ('lock') {
          <rect x="4" y="10" width="16" height="11" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        }
        @case ('logout') {
          <path d="M10 17l5-5-5-5M15 12H3" />
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
        }
        @case ('edit') {
          <path d="m12 20 9-9-4-4-9 9-1 5Z" />
          <path d="m14 9 4 4" />
        }
        @case ('calendar') {
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M16 3v4M8 3v4M3 10h18" />
        }
        @case ('filter') {
          <path d="M4 5h16M7 12h10M10 19h4" />
        }
      }
    </svg>
  `,
})
export class IconComponent {
  readonly name = input.required<IconName>();
  readonly size = input(20);
}
