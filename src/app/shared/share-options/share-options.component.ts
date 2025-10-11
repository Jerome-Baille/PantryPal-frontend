import { Component, Input } from '@angular/core';
import { RecipeService } from 'src/app/services/recipe.service';

import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SharingUsersDialogComponent } from '../sharing-users-dialog/sharing-users-dialog.component';

@Component({
    selector: 'app-share-options',
    standalone: true,
    imports: [MatIconModule, MatMenuModule, MatButtonModule, MatDialogModule, TranslateModule],
    templateUrl: './share-options.component.html',
    styleUrls: ['./share-options.component.scss']
})
export class ShareOptionsComponent {
  @Input() recipe: any;

  constructor(
    private recipeService: RecipeService,
    private dialog: MatDialog
  ) { }

  downloadPDF(): void {
    const recipe = this.recipe;
    const lang = localStorage.getItem('preferredLanguage') || 'en';

    this.recipeService.downloadRecipeAsPDF(recipe, lang).subscribe((response) => {
      const link = document.createElement('a');
      link.href = response.link;
      link.download = `${recipe.title}.pdf`;
      link.click();
    });
  }

  isWebShareSupported = !!navigator.share;

  shareContent() {
    // Check if the Web Share API is supported
    if (this.isWebShareSupported) {
      // Call the Web Share API to trigger the native sharing dialog
      const lang = localStorage.getItem('preferredLanguage') || 'en';

      this.recipeService.downloadRecipeAsPDF(this.recipe, lang).subscribe((response) => {
        navigator.share({
          title: 'Recipe Title',
          text: 'Check out this amazing recipe!',
          url: response.link,
        })
          .then(() => console.log('Content shared successfully!'))
          .catch((error) => console.error('Error sharing content:', error));
      })
    }
  }

  /**
   * Opens a dialog to manage sharing permissions for the current recipe
   */
  manageSharing(): void {
    this.dialog.open(SharingUsersDialogComponent, {
      width: '600px',
      data: {
        recipeId: this.recipe.id,
        recipeTitle: this.recipe.title
      },
      panelClass: 'sharing-dialog'
    });
  }
}
