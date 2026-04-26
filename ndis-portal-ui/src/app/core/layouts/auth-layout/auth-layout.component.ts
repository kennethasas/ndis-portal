import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="auth-shell">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [
    `
      .auth-shell {
        width: 100vw;
        height: 100vh;
        overflow: hidden;
      }
    `,
  ],
})
export class AuthLayoutComponent {}
