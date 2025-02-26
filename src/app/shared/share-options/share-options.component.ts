import { Component, Input } from '@angular/core';
import { RecipeService } from 'src/app/services/recipe.service';
import { faShare, faShareNodes, faFilePdf } from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-share-options',
    standalone: true,
    imports: [CommonModule, FontAwesomeModule, MatMenuModule, MatButtonModule, TranslateModule],
    templateUrl: './share-options.component.html',
    styleUrls: ['./share-options.component.scss']
})
export class ShareOptionsComponent {
  @Input() recipe: any;
  faShare = faShare;
  faShareNodes = faShareNodes;
  faWhatsapp = faWhatsapp;
  faFilePdf = faFilePdf;

  constructor(
    private recipeService: RecipeService
  ) { }

  shareOnWhatsApp() {
    const recipe = this.recipe;
    const lang = localStorage.getItem('preferredLanguage') || 'en';

    this.recipeService.downloadRecipeAsPDF(recipe, lang).subscribe({
      next: (response) => {
        const message = "Check out this recipe! ";
        const url = response.link;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${message} ${url}`)}`;
        window.open(whatsappUrl, '_blank');
      },
      error: (error) => {
        console.error(error);
      }
    })
  }

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
}
