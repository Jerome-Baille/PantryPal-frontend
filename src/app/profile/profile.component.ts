import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { LanguageService } from '../services/language.service';
import { AuthService } from '../services/auth.service';
import { ShareService } from '../services/share.service';
import { Router } from '@angular/router';
import { SnackbarService } from '../services/snackbar.service';
import { MatButtonModule } from '@angular/material/button';
import { Subscription } from 'rxjs';
import { Recipe } from '../models/favorite.interface';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    ReactiveFormsModule,
    TranslateModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit, OnDestroy {
  currentLang: string;
  private languageSubscription?: Subscription;
  favorites: Recipe[] = [];
  shareForm: FormGroup;
  shareUrl: string | null = null;

  constructor(
    private languageService: LanguageService,
    private authService: AuthService,
    private shareService: ShareService,
    private router: Router,
    private snackbarService: SnackbarService,
    private fb: FormBuilder
  ) {
    this.currentLang = languageService.getCurrentLanguage();
    this.shareForm = this.fb.group({
      permissionLevel: ['read'],
      expiresInDays: [7]
    });
  }

  ngOnInit() {
    this.languageSubscription = this.languageService.currentLanguage$.subscribe(
      lang => this.currentLang = lang
    );
  }

  ngOnDestroy() {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  switchLanguage(lang: string) {
    this.languageService.setLanguage(lang);
    this.currentLang = this.languageService.getCurrentLanguage();
  }

  createShareLink() {
    const { permissionLevel, expiresInDays } = this.shareForm.value;
    this.shareService.createAllRecipesShareLink(permissionLevel, expiresInDays)
      .subscribe({
        next: (response) => {
          this.shareUrl = response.shareLink.shareUrl;
          this.snackbarService.showSuccess('Share link created successfully');
        },
        error: (error) => {
          this.snackbarService.showError('Failed to create share link');
          console.error('Error creating share link:', error);
        }
      });
  }

  copyShareUrl() {
    if (this.shareUrl) {
      navigator.clipboard.writeText(this.shareUrl).then(() => {
        this.snackbarService.showSuccess('Share URL copied to clipboard');
      });
    }
  }

  onLogout() {
    this.authService.logout().subscribe({
      next: () => {
        this.snackbarService.showInfo('You have been logged out.');
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        this.snackbarService.showError('An error occurred while logging out.');
        console.error('Logout failed:', error);
      }
    });
  }
}
