import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ShareService, SharingUser } from '../../services/share.service';
import { SnackbarService } from '../../services/snackbar.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { ExcludedRecipesDialogComponent } from '../excluded-recipes-dialog/excluded-recipes-dialog.component';

@Component({
  selector: 'app-sharing-users',
  standalone: true,
  imports: [
    CommonModule,
    MatDividerModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatDialogModule,
    TranslateModule
  ],
  templateUrl: './sharing-users.component.html',
  styleUrl: './sharing-users.component.scss'
})
export class SharingUsersComponent implements OnInit {
  private shareService = inject(ShareService);
  private snackbarService = inject(SnackbarService);
  private dialog = inject(MatDialog);
  private translateService = inject(TranslateService);

  @Input() recipeId?: number; // Optional: if provided, only show shares for this recipe

  sharingWithUsers: SharingUser[] = [];
  sharingWithMeUsers: SharingUser[] = [];
  isLoadingSharingUsers = false;
  isRevokingAccess = false;
  
  // New property to track excluded recipe IDs for each user in global view
  excludedRecipeIds = new Map<number, number[]>();

  ngOnInit(): void {
    this.loadSharingUsers();
  }

  /**
   * Loads sharing users data, optionally filtered by recipeId
   */
  loadSharingUsers(): void {
    this.isLoadingSharingUsers = true;
    
    if (this.recipeId) {
      // If we have a recipeId, load recipe-specific sharing users
      this.shareService.getRecipeShares(this.recipeId).subscribe({
        next: (response) => {
          // Process the response to format like getSharingUserIds
          this.processRecipeSharesResponse(response);
          this.isLoadingSharingUsers = false;
        },
        error: (error) => {
          this.snackbarService.showError('Failed to load sharing users for this recipe');
          console.error('Error loading sharing users for recipe:', error);
          this.isLoadingSharingUsers = false;
        }
      });
    } else {
      // Load all sharing users (global view)
      this.shareService.getSharingUserIds().subscribe({
        next: (response) => {
          // Update to process for exclusions
          this.processGlobalSharingResponse(response);
          this.isLoadingSharingUsers = false;
        },
        error: (error) => {
          this.snackbarService.showError('Failed to load sharing users');
          console.error('Error loading sharing users:', error);
          this.isLoadingSharingUsers = false;
        }
      });
    }
  }

  /**
   * Processes the global sharing response and identifies any exclusions
   */
  private processGlobalSharingResponse(response: { sharingWithUsers: SharingUser[]; sharingWithMeUsers: SharingUser[] }): void {
    const { sharingWithUsers, sharingWithMeUsers } = response;
    
    // Process sharingWithUsers to identify exclusions
    this.sharingWithUsers = sharingWithUsers.map((user: SharingUser) => {
      // Check if the user has any excluded recipes
      const excludedRecipesWithNulls = user.shares ? 
        user.shares.filter(share => share.isExcluded === 1).map(share => share.recipeId) : 
        [];
      
      // Filter out any null recipeId values and cast to number[]
      const excludedRecipes = excludedRecipesWithNulls.filter((id): id is number => id !== null);
      
      // Store excluded recipe IDs for this user
      if (excludedRecipes.length > 0) {
        this.excludedRecipeIds.set(user.id, excludedRecipes);
      }

      // If the user has global access but also has at least one exclusion,
      // we should show this information in the UI
      const hasExcludedRecipes = excludedRecipes.length > 0;
      const hasGlobalAccess = user.shares ? user.shares.some(share => share.isGlobal) : false;
      
      return {
        ...user,
        // User is not considered fully excluded in global view, but may have recipe exclusions
        isExcluded: false,
        // Add a property to represent partial exclusion status
        hasExcludedRecipes: hasGlobalAccess && hasExcludedRecipes
      };
    });
    
    // Assign sharing with me users
    this.sharingWithMeUsers = sharingWithMeUsers;
  }

  /**
   * Processes recipe shares response into the format expected by the component
   */
  private processRecipeSharesResponse(response: { shares: { sharedWithId: number; username?: string; email?: string; displayName?: string; profilePicture?: string; permissionLevel?: 'read' | 'edit'; accessType?: string; status?: string }[] }): void {
    // Transform the getRecipeShares response into matching SharingUser format
    this.sharingWithUsers = response.shares.map((share) => {
      return {
        id: share.sharedWithId,
        username: share.username,
        email: share.email,
        displayName: share.displayName,
        profilePicture: share.profilePicture,
        highestPermission: share.permissionLevel,
        // Set isExcluded based on accessType or status
        isExcluded: share.accessType === 'excluded' || share.status === 'revoked',
        shares: [{
          permissionLevel: share.permissionLevel || 'read',
          recipeId: this.recipeId ?? null,
          // Mark as global share if accessType is 'global'
          isGlobal: share.accessType === 'global'
        }],
        // Add new properties from the updated API response
        accessType: share.accessType as 'global' | 'specific' | 'excluded' | undefined,
        shareStatus: share.status as 'granted' | 'revoked' | undefined
      };
    });
    
    // For recipe-specific view, we might not show sharingWithMeUsers
    // Or you might want to implement additional logic here
    this.sharingWithMeUsers = [];
  }

  /**
   * Get a display name for a user
   */
  getUserDisplayName(user: SharingUser): string {
    return user.displayName || user.username || user.email || `User ${user.id}`;
  }

  /**
   * Check if a user has global access to all recipes
   */
  hasGlobalAccess(user: SharingUser): boolean {
    return user.accessType === 'global' || (user.shares ? user.shares.some(share => share.isGlobal) : false);
  }

  /**
   * Get excluded recipe count for a user (only relevant in global view)
   */
  getExcludedRecipeCount(user: SharingUser): number {
    return this.excludedRecipeIds.has(user.id) ? this.excludedRecipeIds.get(user.id)!.length : 0;
  }

  /**
   * Revoke access for a user
   * If recipeId is provided, only revoke access to that recipe
   * Otherwise revoke all access
   */
  revokeAccess(user: SharingUser): void {
    if (this.isRevokingAccess) return;

    // Confirm with the user before proceeding
    const userName = this.getUserDisplayName(user);
    const title = this.translateService.instant('CONFIRM_REVOKE_ACCESS_TITLE');
    const message = this.recipeId
      ? this.translateService.instant('CONFIRM_REVOKE_ACCESS_MESSAGE_SINGLE', { userName })
      : this.translateService.instant('CONFIRM_REVOKE_ACCESS_MESSAGE_ALL', { userName });

    // Open confirmation dialog
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: { title, message }
    });

    // Handle the dialog result
    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
      
      this.isRevokingAccess = true;
      
      // Handle recipe-specific revocation
      if (this.recipeId) {
        this.shareService.revokeRecipeAccess(this.recipeId, user.id).subscribe({
          next: () => {
            this.snackbarService.showSuccess(`Recipe access revoked for ${userName}`);
            this.loadSharingUsers();
            this.isRevokingAccess = false;
          },
          error: (error) => {
            this.snackbarService.showError(`Failed to revoke access for ${userName}`);
            console.error('Error revoking recipe access:', error);
            this.isRevokingAccess = false;
          }
        });
        return;
      }

      // Handle global access revocation
      if (this.hasGlobalAccess(user)) {
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
        // For simplicity, we'll use the first recipe share
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
    });
  }

  /**
   * Cancels recipe exclusion for a user
   * @param user The user whose recipe exclusion will be cancelled
   */
  cancelExclusion(user: SharingUser): void {
    if (this.isRevokingAccess || !this.recipeId) return;
    
    const userName = this.getUserDisplayName(user);
    this.isRevokingAccess = true;
    
    this.shareService.removeRecipeExclusion(this.recipeId, user.id).subscribe({
      next: () => {
        this.snackbarService.showSuccess(`Recipe access restored for ${userName}`);
        this.loadSharingUsers();
        this.isRevokingAccess = false;
      },
      error: (error) => {
        this.snackbarService.showError(`Failed to restore access for ${userName}`);
        console.error('Error removing recipe exclusion:', error);
        this.isRevokingAccess = false;
      }
    });
  }

  /**
   * Show a dialog with excluded recipes for a user and options to restore access
   */
  showExcludedRecipes(user: SharingUser): void {
    if (!user.hasExcludedRecipes || !this.excludedRecipeIds.has(user.id)) return;
    
    const excludedRecipeIds = this.excludedRecipeIds.get(user.id) || [];
    const userName = this.getUserDisplayName(user);
    
    const dialogRef = this.dialog.open(ExcludedRecipesDialogComponent, {
      width: '500px',
      data: {
        userId: user.id,
        userName,
        excludedRecipeIds: excludedRecipeIds
      }
    });

    // Refresh sharing users list if changes were made in the dialog
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadSharingUsers();
      }
    });
  }
}
