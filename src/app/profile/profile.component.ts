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
import { FavoriteService } from '../services/favorite.service';
import { MatIconModule } from '@angular/material/icon';
import { Recipe } from '../models/favorite.interface';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterLink,
    FontAwesomeModule,
    TranslateModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit, OnDestroy {
  currentLang: string;
  private languageSubscription?: Subscription;
  favorites: Recipe[] = [];
  faHeart = faHeart;

  constructor(
    private languageService: LanguageService,
    private authService: AuthService,
    private router: Router,
    private snackbarService: SnackbarService,
    private favoriteService: FavoriteService
  ) {
    this.currentLang = languageService.getCurrentLanguage();
  }

  ngOnInit() {
    this.languageSubscription = this.languageService.currentLanguage$.subscribe(
      lang => this.currentLang = lang
    );
    this.loadFavorites();
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

  loadFavorites() {
    this.favoriteService.getUsersFavorites().subscribe({
      next: (recipes: Recipe[]) => {
        this.favorites = recipes;
      },
      error: (error) => {
        this.snackbarService.showError('Failed to load favorites');
        console.error('Error loading favorites:', error);
      }
    });
  }

  removeFavorite(recipeId: number) {
    this.favoriteService.deleteFavorite(recipeId).subscribe({
      next: () => {
        this.loadFavorites();
        this.snackbarService.showSuccess('Recipe removed from favorites');
      },
      error: (error) => {
        this.snackbarService.showError('Failed to remove favorite');
        console.error('Error removing favorite:', error);
      }
    });
  }
}
