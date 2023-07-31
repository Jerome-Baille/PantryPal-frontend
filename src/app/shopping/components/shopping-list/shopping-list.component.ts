import { Component, OnInit } from '@angular/core';
import { RecipeService } from 'src/app/services/recipe.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { getLocalStorageData, setLocalStorageData } from 'src/app/helpers/local-storage.helper';

@Component({
  selector: 'app-shopping-list',
  templateUrl: './shopping-list.component.html',
  styleUrls: ['./shopping-list.component.scss']
})
export class ShoppingListComponent implements OnInit {
  shoppingList: { key: string, value: any }[] = [];
  doneList: { key: string, value: any }[] = [];
  selectedItems: { [key: string]: boolean } = {};
  recipeIds: number[] = [];

  constructor(
    private recipeService: RecipeService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    // Load the "Done" list from local storage
    const doneList = getLocalStorageData('doneList');
    if (doneList) {
      this.doneList = doneList;
    }

    // Load the shopping list from local storage
    try {
      const requiredIngredients = getLocalStorageData('requiredIngredients');
      const savedRecipeIds = getLocalStorageData('savedRecipeIds');
      const shoppingList = getLocalStorageData('shoppingList');

      console.log(requiredIngredients, savedRecipeIds, shoppingList)

      console.log(JSON.stringify(savedRecipeIds) === JSON.stringify(shoppingList))

      if (requiredIngredients && savedRecipeIds && shoppingList && JSON.stringify(savedRecipeIds) === JSON.stringify(shoppingList)) {
        this.shoppingList = requiredIngredients;
      } else {
        this.fetchIngredients();
      }
    } catch (error) {
      console.error('Error loading shopping list from local storage:', error);
    }
  }

  fetchIngredients(): void {
    this.recipeIds = this.recipeService.getRecipeIdsFromLocalStorage();

    if (this.recipeIds.length > 0) {
      this.recipeService.getIngredientsForRecipes(this.recipeIds).subscribe({
        next: (ingredients) => {
          this.shoppingList = this.transformIngredients(ingredients);

          // Store the shopping list in local storage
          setLocalStorageData('requiredIngredients', this.shoppingList);

          // Store the recipe IDs in local storage
          setLocalStorageData('savedRecipeIds', this.recipeIds);

          // Reset the selected items and done list
          this.selectedItems = {};
          this.doneList = [];
          localStorage.removeItem('doneList');
        },
        error: (error) => {
          this.snackBar.open('Error fetching ingredients', 'Close', {
            duration: 3000,
            verticalPosition: 'top'
          });
        }
      });
    } else {
      // Display a message or handle empty shopping list
      console.log('Shopping list is empty.');
    }
  }

  transformIngredients(ingredients: any): { key: string, value: any }[] {
    // Transform the ingredients object into an array of objects with a unique key
    return Object.keys(ingredients).map((key) => ({ key, value: ingredients[key] }));
  }

  toggleItemSelection(itemKey: string): void {
    this.selectedItems[itemKey] = !this.selectedItems[itemKey];

    if (this.selectedItems[itemKey]) {
      // If the item is selected, move it to the "Done" list
      const selectedItem = this.shoppingList.find((item) => item.key === itemKey);
      if (selectedItem) {
        this.addToDoneList(selectedItem);
      }
    } else {
      // If the item is deselected, remove it from the "Done" list
      this.removeFromDoneList(itemKey);
    }

    setLocalStorageData('requiredIngredients', this.shoppingList);
    setLocalStorageData('doneList', this.doneList);
  }

  addToDoneList(item: { key: string, value: any }): void {
    // Add the selected item to the "Done" list
    this.doneList.push(item);

    // Save the "Done" list to local storage
    setLocalStorageData('doneList', this.doneList);

    // Remove the selected item from the "shoppingList" array
    this.shoppingList = this.shoppingList.filter((shoppingItem) => shoppingItem.key !== item.key);
  }

  removeFromDoneList(itemKey: string): void {
    // Find the item in the "Done" list and remove it
    this.doneList = this.doneList.filter((doneItem) => doneItem.key !== itemKey);
    setLocalStorageData('doneList', this.doneList);
  }

  isItemSelected(itemKey: string): boolean {
    return this.selectedItems[itemKey] || false;
  }

  refreshList(): void {
    if (this.recipeIds.length === 0) {
      this.recipeIds = this.recipeService.getRecipeIdsFromLocalStorage();
    }

    const savedRecipeIds = getLocalStorageData('savedRecipeIds');

    if (savedRecipeIds) {
      if (JSON.stringify(this.recipeIds) !== JSON.stringify(savedRecipeIds)) {
        this.shoppingList = [];
        this.doneList = [];
        this.fetchIngredients();
      }
    }
  }

  clearList(): void {
    this.shoppingList = [];
    this.doneList = [];
    localStorage.removeItem('requiredIngredients');
    localStorage.removeItem('shoppingList');
    localStorage.removeItem('savedRecipeIds');
    localStorage.removeItem('doneList');
  }

  isAnyItemSelected(): boolean {
    return Object.values(this.selectedItems).some((isSelected) => isSelected);
  }
}
