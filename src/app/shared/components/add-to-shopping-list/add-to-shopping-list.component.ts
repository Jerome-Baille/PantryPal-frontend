import { Component, Input, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-add-to-shopping-list',
  templateUrl: './add-to-shopping-list.component.html',
  styleUrls: ['./add-to-shopping-list.component.scss'],
  animations: [
    trigger('fade', [
      state('visible', style({ opacity: 1, height: '*' })),
      state('hidden', style({ opacity: 0, height: '0' })),
      transition('visible <=> hidden', animate('300ms ease-in-out')),
    ]),
  ],
})
export class AddToShoppingListComponent implements OnInit {
  @Input() recipe: any;
  @Input() recipes: any[] = [];

  constructor(
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
  }

  addRecipeToShoppingList(recipeId: number): void {
    const shoppingList = JSON.parse(localStorage.getItem('shoppingList') || '[]');
    const index = shoppingList.indexOf(recipeId);
    index === -1 ? shoppingList.push(recipeId) : shoppingList.splice(index, 1);
    localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
    const recipeTitle = this.recipes.length === 0 ? this.recipe.title : this.recipes.find(recipe => recipe.id === recipeId)?.title;
    const message = index === -1 ? `${recipeTitle} has been added to the shopping list.` : `${recipeTitle} has been removed from the shopping list.`;
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      verticalPosition: 'top'
    });
  }

  isRecipeInShoppingList(recipeId: number): boolean {
    const shoppingList = JSON.parse(localStorage.getItem('shoppingList') || '[]');
    return shoppingList.includes(recipeId);
  }
}
