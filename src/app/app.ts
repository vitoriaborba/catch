import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ArcadeHeaderComponent } from './shared/components/arcade-header/arcade-header.component';

@Component({
  imports: [ArcadeHeaderComponent, RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.scss',
  template: `
    <app-arcade-header />
    <main class="app-shell">
      <router-outlet />
    </main>
  `,
})
export class App {
}
