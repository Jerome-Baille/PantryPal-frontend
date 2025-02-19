import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../services/language.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { SnackbarService } from '../services/snackbar.service';
import { MatButtonModule } from '@angular/material/button';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatButtonModule,
    TranslateModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit, OnDestroy {
  currentLang: string;
  private languageSubscription?: Subscription;

  constructor(
    private languageService: LanguageService,
    private authService: AuthService,
    private router: Router,
    private snackbarService: SnackbarService
  ) {
    this.currentLang = languageService.getCurrentLanguage();
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
