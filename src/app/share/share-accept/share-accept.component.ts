import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { ShareService } from '../../services/share.service';
import { SnackbarService } from '../../services/snackbar.service';

@Component({
  selector: 'app-share-accept',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, MatCardModule, TranslateModule],
  template: `
    <div class="loading-container">
      <mat-card>
        <mat-card-content>
          <h2>{{ message | translate }}</h2>
          <mat-spinner *ngIf="loading"></mat-spinner>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      padding: 1rem;
    }
    mat-card {
      max-width: 400px;
      width: 100%;
    }
    mat-card-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      text-align: center;
    }
  `]
})
export class ShareAcceptComponent implements OnInit {
  loading = true;
  message = 'PROCESSING_SHARE_LINK';
  private token: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private shareService: ShareService,
    private snackbarService: SnackbarService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.token = this.route.snapshot.paramMap.get('token');
    if (!this.token) {
      this.snackbarService.showError('Invalid share link');
      this.router.navigate(['/']);
      return;
    }

    // Store the token in session storage for after login
    sessionStorage.setItem('pendingShareToken', this.token);

    // Check if user is logged in
    this.authService.isLoggedIn().subscribe({
      next: (isLoggedIn) => {
        if (isLoggedIn) {
          this.acceptShareLink(this.token!);
        } else {
          // Redirect to login
          this.router.navigate(['/auth/login']);
        }
      },
      error: (error) => {
        console.error('Error checking auth state:', error);
        this.snackbarService.showError('Error checking authentication state');
        this.router.navigate(['/']);
      }
    });
  }

  private acceptShareLink(token: string) {
    this.shareService.acceptShareLink(token).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.type === 'global') {
          this.snackbarService.showSuccess('Successfully accepted access to all recipes');
        } else {
          this.snackbarService.showSuccess(`Successfully accepted access to recipe: ${response.recipeTitle}`);
        }
        // Clear the pending token
        sessionStorage.removeItem('pendingShareToken');
        // Redirect to recipe list
        this.router.navigate(['/recipe/list']);
      },
      error: (error) => {
        this.loading = false;
        console.error('Error accepting share link:', error);
        this.snackbarService.showError(error.error?.error || 'Failed to accept share link');
        this.router.navigate(['/']);
      }
    });
  }
}