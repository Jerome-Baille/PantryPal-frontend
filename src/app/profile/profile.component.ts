import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule, MatChipListbox } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LanguageService } from '../services/language.service';
import { AuthService } from '../services/auth.service';
import { ShareService } from '../services/share.service';
import { Router } from '@angular/router';
import { SnackbarService } from '../services/snackbar.service';
import { MatButtonModule } from '@angular/material/button';
import { Subscription } from 'rxjs';
import { Recipe } from '../models/favorite.interface';
import { ShareLink, ShareLinkStats, SharingUser } from '../services/share.service';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonToggleModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatChipsModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatDividerModule,
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
  shareLinks: ShareLink[] = [];
  shareStats?: ShareLinkStats;
  showAllLinks = false;
  
  // New properties for sharing users
  sharingWithUsers: SharingUser[] = [];
  sharingWithMeUsers: SharingUser[] = [];
  isLoadingSharingUsers = false;

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
    this.loadShareLinks();
    this.loadSharingUsers();
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

  copyShareUrl(url?: string) {
    const urlToCopy = url || this.shareUrl;
    if (urlToCopy) {
      navigator.clipboard.writeText(urlToCopy).then(() => {
        this.snackbarService.showSuccess('Share URL copied to clipboard');
      });
    }
  }

  loadShareLinks() {
    this.shareService.getMyShareLinks(this.showAllLinks).subscribe({
      next: (response) => {
        this.shareLinks = response.links;
        this.shareStats = response.stats;
      },
      error: (error) => {
        this.snackbarService.showError('Failed to load share links');
        console.error('Error loading share links:', error);
      }
    });
  }

  loadSharingUsers() {
    this.isLoadingSharingUsers = true;
    this.shareService.getSharingUserIds().subscribe({
      next: (response) => {
        this.sharingWithUsers = response.sharingWithUsers;
        this.sharingWithMeUsers = response.sharingWithMeUsers;
        this.isLoadingSharingUsers = false;
      },
      error: (error) => {
        this.snackbarService.showError('Failed to load sharing users');
        console.error('Error loading sharing users:', error);
        this.isLoadingSharingUsers = false;
      }
    });
  }

  toggleShowAllLinks() {
    this.showAllLinks = !this.showAllLinks;
    this.loadShareLinks();
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

  getUserDisplayName(user: SharingUser): string {
    return user.displayName || user.username || user.email || `User ${user.id}`;
  }

  /**
   * Check if a user has global access to all recipes
   * @param user The sharing user to check
   * @returns true if the user has global access, false otherwise
   */
  hasGlobalAccess(user: SharingUser): boolean {
    return user.shares ? user.shares.some(share => share.isGlobal) : false;
  }
}
