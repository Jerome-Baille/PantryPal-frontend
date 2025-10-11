import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SnackbarService } from '../services/snackbar.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-after-register',
  standalone: true,
  imports: [MatProgressSpinnerModule, TranslateModule],
  template: `
    <div class="loading-container">
      <h2>{{ 'FINALIZING_REGISTRATION' | translate }}</h2>
      <mat-spinner></mat-spinner>
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      gap: 20px;
    }
  `]
})
export class AfterRegisterComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router,
    private snackbarService: SnackbarService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    // Verify auth state after redirection from auth service
    this.authService.handlePostLogin().subscribe({
      next: (response) => {
        if (response.auth) {
          // Use the message from the backend if available
          if (response.message) {
            this.snackbarService.showSuccess(response.message);
          } else {
            this.translate.get('REGISTRATION_SUCCESS').subscribe(message => {
              this.snackbarService.showSuccess(message);
            });
          }
          this.router.navigate(['/recipe/list']);
        } else {
          this.translate.get('REGISTRATION_FAILED').subscribe(message => {
            this.snackbarService.showError(message);
          });
          this.router.navigate(['/auth/login']);
        }
      },
      error: (error) => {
        console.error('Authentication verification failed after registration:', error);
        this.translate.get('REGISTRATION_ERROR').subscribe(message => {
          this.snackbarService.showError(message);
        });
        this.router.navigate(['/auth/login']);
      }
    });
  }
}