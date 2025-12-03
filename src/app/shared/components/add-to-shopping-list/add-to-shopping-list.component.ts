import { Component, Input, inject } from '@angular/core';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { trigger, state, style, animate, transition, keyframes } from '@angular/animations';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-add-to-shopping-list',
    standalone: true,
    imports: [MatIconModule],
    templateUrl: './add-to-shopping-list.component.html',
    styleUrls: ['./add-to-shopping-list.component.scss'],
    animations: [
        trigger('iconAnimation', [
            state('visible', style({ 
                opacity: 1,
                transform: 'scale(1)'
            })),
            state('hidden', style({ 
                opacity: 0,
                transform: 'scale(0.8)'
            })),
            transition('visible <=> hidden', [
                animate('200ms cubic-bezier(0.4, 0.0, 0.2, 1)')
            ])
        ]),
        trigger('buttonClick', [
            transition('* => clicked', [
                animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)', keyframes([
                    style({ transform: 'scale(1)', offset: 0 }),
                    style({ transform: 'scale(1.2)', offset: 0.5 }),
                    style({ transform: 'scale(1)', offset: 1 })
                ]))
            ])
        ])
    ]
})
export class AddToShoppingListComponent {
  private snackbarService = inject(SnackbarService);

  @Input() recipe: { id: number; title: string } | undefined;
  @Input() recipes: { id: number; title: string }[] = [];
  @Input() multiplier = 1;

  buttonState = '';

  addRecipeToShoppingList(recipeId: number): void {
    this.buttonState = 'clicked';
    const shoppingList = JSON.parse(localStorage.getItem('shoppingList') || '[]') as { id: number; multiplier: number }[];
    const index = shoppingList.findIndex((item) => item.id === recipeId);
    
    if (index === -1) {
      shoppingList.push({ id: recipeId, multiplier: this.multiplier || 1 });
    } else {
      shoppingList.splice(index, 1);
    }
    
    localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
    const recipeTitle = this.recipes.length === 0 ? this.recipe?.title : this.recipes.find(recipe => recipe.id === recipeId)?.title;
    const message = index === -1 ? `${recipeTitle} has been added to the grocery list.` : `${recipeTitle} has been removed from the grocery list.`;
    this.snackbarService.showInfo(message);
  }

  isRecipeInShoppingList(recipeId: number): boolean {
    const shoppingList = JSON.parse(localStorage.getItem('shoppingList') || '[]') as { id: number; multiplier: number }[];
    return shoppingList.some((item) => item.id === recipeId);
  }

  onAnimationDone() {
    this.buttonState = '';
  }
}
