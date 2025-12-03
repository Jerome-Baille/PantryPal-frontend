import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';

@Component({
    selector: 'app-after-login',
    standalone: true,
    imports: [MatProgressSpinnerModule, TranslateModule],
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
    private authService = inject(AuthService);
    private router = inject(Router);
    private snackbarService = inject(SnackbarService);
    private translate = inject(TranslateService);


    ngOnInit(): void {
        // Wait a bit for auth state to stabilize
        setTimeout(() => {
            this.authService.handlePostLogin().subscribe({
                next: (response) => {
                    if (response.auth) {
                        // Use the message from the backend if available
                        if (response.message) {
                            this.snackbarService.showSuccess(response.message);
                        } else {
                            this.translate.get('LOGIN_SUCCESS').subscribe(message => {
                                this.snackbarService.showSuccess(message);
                            });
                        }

                        // Check for pending share token
                        const pendingShareToken = sessionStorage.getItem('pendingShareToken');
                        if (pendingShareToken) {
                            this.router.navigate(['/share/accept', pendingShareToken]);
                        } else {
                            this.router.navigate(['/recipe/list']);
                        }
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