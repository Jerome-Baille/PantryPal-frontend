import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SnackbarService } from '../services/snackbar.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-after-login',
    standalone: true,
    imports: [CommonModule, MatProgressSpinnerModule, TranslateModule],
    template: `
    <div class="loading-container">
      <h2>{{ 'AUTHENTICATING' | translate }}</h2>
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
export class AfterLoginComponent implements OnInit {
    constructor(
        private authService: AuthService,
        private router: Router,
        private snackbarService: SnackbarService,
        private translate: TranslateService
    ) { }

    ngOnInit(): void {
        // Verify auth state after redirection from auth service
        setTimeout(() => {
            this.authService.handlePostLogin().subscribe({
                next: (response) => {
                    console.log('Response:', response);
                    if (response.auth) {
                        // Use the message from the backend if available
                        if (response.message) {
                            this.snackbarService.showSuccess(response.message);
                        } else {
                            this.translate.get('LOGIN_SUCCESS').subscribe(message => {
                                this.snackbarService.showSuccess(message);
                            });
                        }
                        this.router.navigate(['/recipe/list']);
                    } else {
                        this.translate.get('LOGIN_FAILED').subscribe(message => {
                            this.snackbarService.showError(message);
                        });
                        this.router.navigate(['/auth/login']);
                    }
                },
                error: (error) => {
                    console.error('Authentication verification failed:', error);
                    this.translate.get('LOGIN_ERROR').subscribe(message => {
                        this.snackbarService.showError(message);
                    });
                    this.router.navigate(['/auth/login']);
                }
            });
        }, 500);
    }
}