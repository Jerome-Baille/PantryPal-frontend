/**
 * Production stub – replaces dev-login.component.ts at build time.
 * The component renders nothing and redirects away immediately.
 */
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dev-login',
  standalone: true,
  template: `<p>Not available</p>`
})
export class DevLoginComponent implements OnInit {
  private router = inject(Router);

  ngOnInit() {
    // Redirect to normal login in production
    this.router.navigate(['/auth/login']);
  }
}
