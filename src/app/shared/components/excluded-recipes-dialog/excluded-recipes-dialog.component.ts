import { Component, OnInit, inject } from '@angular/core';

import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { ShareService } from 'src/app/core/services/share.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';

export interface ExcludedRecipesDialogData {
  userId: number;
  userName: string;
  excludedRecipeIds: number[];
}

@Component({
  selector: 'app-excluded-recipes-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    TranslateModule
],
  template: `
    <h2 mat-dialog-title>{{ 'EXCLUDED_RECIPES_FOR' | translate }} {{ data.userName }}</h2>
    <mat-dialog-content>
      @if (isLoading) {
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
          <p>{{ 'LOADING_RECIPES' | translate }}</p>
        </div>
      }
    
      @if (!isLoading && recipes.length === 0) {
        <div class="empty-state">
          <mat-icon>info</mat-icon>
          <p>{{ 'NO_EXCLUDED_RECIPES' | translate }}</p>
        </div>
      }
    
      @if (!isLoading && recipes.length > 0) {
        <mat-list>
          @for (recipe of recipes; track recipe) {
            <mat-list-item>
              <span matListItemTitle>{{ recipe.title }}</span>
              <div matListItemMeta>
                <button mat-icon-button color="primary" (click)="restoreAccess(recipe.id)"
                  [disabled]="restoringRecipeIds.includes(recipe.id)"
                  matTooltip="{{ 'RESTORE_ACCESS' | translate }}">
                  @if (!restoringRecipeIds.includes(recipe.id)) {
                    <mat-icon>settings_backup_restore</mat-icon>
                  }
                  @if (restoringRecipeIds.includes(recipe.id)) {
                    <mat-spinner diameter="20"></mat-spinner>
                  }
                </button>
              </div>
            </mat-list-item>
          }
        </mat-list>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>{{ 'CLOSE' | translate }}</button>
    </mat-dialog-actions>
    `,
  styles: [`
    mat-dialog-content {
      min-height: 200px;
      max-height: 60vh;
    }
    
    .loading-container, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem 0;
      gap: 1rem;
      color: #757575;
      text-align: center;
    }
    
    .empty-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #bdbdbd;
    }
  `]
})
export class ExcludedRecipesDialogComponent implements OnInit {
  dialogRef = inject<MatDialogRef<ExcludedRecipesDialogComponent>>(MatDialogRef);
  data = inject<ExcludedRecipesDialogData>(MAT_DIALOG_DATA);
  private shareService = inject(ShareService);
  private snackbarService = inject(SnackbarService);

  recipes: { id: number; title: string }[] = [];
  isLoading = true;
  restoringRecipeIds: number[] = [];

  ngOnInit(): void {
    this.loadRecipeTitles();
  }

  loadRecipeTitles(): void {
    if (!this.data.excludedRecipeIds.length) {
      this.isLoading = false;
      return;
    }
    
    this.shareService.getRecipeTitlesByIds(this.data.excludedRecipeIds).subscribe({
      next: (response) => {
        this.recipes = Object.entries(response).map(([id, title]) => ({
          id: parseInt(id),
          title
        }));
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching recipe titles:', error);
        this.snackbarService.showError('Failed to load recipe titles');
        this.isLoading = false;
      }
    });
  }

  restoreAccess(recipeId: number): void {
    if (this.restoringRecipeIds.includes(recipeId)) return;
    
    this.restoringRecipeIds.push(recipeId);
    
    this.shareService.removeRecipeExclusion(recipeId, this.data.userId).subscribe({
      next: () => {
        // Remove the recipe from the list
        this.recipes = this.recipes.filter(recipe => recipe.id !== recipeId);
        this.restoringRecipeIds = this.restoringRecipeIds.filter(id => id !== recipeId);
        this.snackbarService.showSuccess(`Recipe access restored for ${this.data.userName}`);
        
        // If we've restored all recipes, close the dialog
        if (this.recipes.length === 0) {
          this.dialogRef.close(true);
        }
      },
      error: (error) => {
        console.error('Error removing recipe exclusion:', error);
        this.snackbarService.showError(`Failed to restore access for ${this.data.userName}`);
        this.restoringRecipeIds = this.restoringRecipeIds.filter(id => id !== recipeId);
      }
    });
  }
}