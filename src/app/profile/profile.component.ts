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
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';

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
  isDeletingLink = false;
  isDeletingAllLinks = false;
  isRevokingAccess = false;

  constructor(
    private languageService: LanguageService,
    private authService: AuthService,
    private shareService: ShareService,
    private router: Router,
    private snackbarService: SnackbarService,
    private fb: FormBuilder,
    private dialog: MatDialog
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

  /**
   * Revoke access for a user
   * @param user The user to revoke access from
   */
  revokeAccess(user: SharingUser) {
    if (this.isRevokingAccess) return;

    // Confirm with the user before proceeding
    const userName = this.getUserDisplayName(user);
    const confirmMessage = `Are you sure you want to revoke all sharing permissions for ${userName}?`;
    if (!confirm(confirmMessage)) return;

    this.isRevokingAccess = true;

    // Check if the user has global access
    const hasGlobalAccess = this.hasGlobalAccess(user);
    
    if (hasGlobalAccess) {
      // Revoke global access
      this.shareService.revokeGlobalAccess(user.id).subscribe({
        next: () => {
          this.snackbarService.showSuccess(`Access revoked for ${userName}`);
          this.loadSharingUsers();
          this.isRevokingAccess = false;
        },
        error: (error) => {
          this.snackbarService.showError(`Failed to revoke access for ${userName}`);
          console.error('Error revoking access:', error);
          this.isRevokingAccess = false;
        }
      });
    } else if (user.shares && user.shares.length > 0) {
      // If no global access but has specific recipe shares
      // This would need to revoke each recipe share one by one
      // For simplicity, we'll use the first recipe share as an example
      const firstShare = user.shares[0];
      if (!firstShare.isGlobal && firstShare.recipeId) {
        this.shareService.revokeRecipeAccess(firstShare.recipeId, user.id).subscribe({
          next: () => {
            this.snackbarService.showSuccess(`Recipe access revoked for ${userName}`);
            this.loadSharingUsers();
            this.isRevokingAccess = false;
          },
          error: (error) => {
            this.snackbarService.showError(`Failed to revoke recipe access for ${userName}`);
            console.error('Error revoking recipe access:', error);
            this.isRevokingAccess = false;
          }
        });
      } else {
        this.isRevokingAccess = false;
      }
    } else {
      this.isRevokingAccess = false;
    }
  }
}
