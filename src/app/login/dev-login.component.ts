import { Component, OnInit, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from 'src/environments/environment';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-dev-login',
  standalone: true,
  imports: [FormsModule, MatCardModule, MatButtonModule, RouterLink, TranslateModule],
  templateUrl: './dev-login.component.html',
  styleUrls: ['./dev-login.component.scss']
})
export class DevLoginComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private authService = inject(AuthService);

  users: { id: number; username: string; email: string }[] = [];
  loading = false;
  error?: string;
  isDev = !environment.production;

  usernameInput = '';
  passwordInput = '';

  ngOnInit() {
    if (!this.isDev) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.http.get<{ users: { id: number; username: string; email: string }[] }>(`${environment.authURL}/users`, { withCredentials: true }).subscribe({
      next: (res) => {
        this.users = res.users || [];
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load users';
        this.loading = false;
      }
    });
  }

  loginAs(user: { username: string }) {
    // convenient mapping: dev users use simple passwords (see backend/seeders)
    const pwMap: Record<string, string> = {
      dev_alice: 'password1',
      dev_bob: 'password2',
      dev_admin: 'adminpass'
    };

    const password = pwMap[user.username] || 'password1';
    this.doLogin(user.username, password);
  }

  doLogin(username: string, password: string) {
    this.error = undefined;
    this.http.post(`${environment.authURL}/login`, { username, password }, { withCredentials: true }).subscribe({
      next: () => this.router.navigate(['/auth/after-login']),
      error: () => this.error = 'Login failed'
    });
  }

  onSubmit() {
    if (!this.usernameInput || !this.passwordInput) return;
    this.doLogin(this.usernameInput, this.passwordInput);
  }
}
