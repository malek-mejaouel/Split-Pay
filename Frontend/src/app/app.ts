import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { AppToastContainerComponent } from './shared/components/toast-container/toast-container';

/**
 * Application root.
 *
 * It only holds the router outlet and the global toast stack; every signed-in
 * screen is rendered inside `AppShellComponent`.
 */
@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, AppToastContainerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
