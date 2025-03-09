import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
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
import { ShareLink, ShareLinkStats } from '../services/share.service';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { SharingUsersComponent } from '../shared/sharing-users/sharing-users.component';

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
    MatDialogModule,
    MatMenuModule,
    TranslateModule,
    SharingUsersComponent
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
  isDeletingLink = false;
  isDeletingAllLinks = false;

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

  /**
   * Delete a specific share link
   * @param link The share link to delete
   */
  deleteShareLink(link: ShareLink) {
    if (!link.token || this.isDeletingLink) return;

    this.isDeletingLink = true;
    this.shareService.deleteShareLink(link.token).subscribe({
      next: () => {
        this.snackbarService.showSuccess('Share link deleted successfully');
        this.loadShareLinks();
        this.isDeletingLink = false;
      },
      error: (error) => {
        this.snackbarService.showError('Failed to delete share link');
        console.error('Error deleting share link:', error);
        this.isDeletingLink = false;
      }
    });
  }

  /**
   * Delete all share links with the specified status
   * @param status The status of links to delete (expired/used/accepted)
   */
  bulkDeleteShareLinks(status: 'expired' | 'used' | 'accepted') {
    if (this.isDeletingAllLinks) return;
    
    // Confirm with the user before proceeding
    const confirmMessage = `Are you sure you want to delete all ${status} share links?`;
    if (!confirm(confirmMessage)) return;

    this.isDeletingAllLinks = true;
    this.shareService.bulkDeleteShareLinks(status).subscribe({
      next: (response) => {
        this.snackbarService.showSuccess(`${response.count || 'All'} ${status} share links deleted successfully`);
        this.loadShareLinks();
        this.isDeletingAllLinks = false;
      },
      error: (error) => {
        this.snackbarService.showError(`Failed to delete ${status} share links`);
        console.error('Error deleting share links:', error);
        this.isDeletingAllLinks = false;
      }
    });
  }
}
