import { Component, OnInit, inject } from '@angular/core';
import { RecipeService } from 'src/app/core/services/recipe.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { getLocalStorageData, setLocalStorageData } from 'src/app/shared/helpers/local-storage.helper';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-shopping-list',
    standalone: true,
    imports: [
      CommonModule, 
      MatButtonModule,
      MatCardModule, 
      MatIconModule, 
      MatSelectModule, 
      MatListModule,
      TranslateModule
    ],
    templateUrl: './shopping-list.component.html',
    styleUrls: ['./shopping-list.component.scss'],
})
export class ShoppingListComponent implements OnInit {
  private recipeService = inject(RecipeService);
  private snackbarService = inject(SnackbarService);

  shoppingList: { key: string, value: { quantity: number; unit: string }[] }[] = [];
  doneList: { key: string, value: { quantity: number; unit: string }[] }[] = [];
  selectedItems: Record<string, boolean> = {};
  recipeIds: {id: number, multiplier: number}[] = [];

  ngOnInit(): void {
    // Load the "Done" list from local storage
    const doneList = getLocalStorageData<{ key: string, value: { quantity: number; unit: string }[] }[]>('doneList');
    if (doneList) {
      this.doneList = doneList;
    }

    // Load the shopping list from local storage
    try {
      const requiredIngredients = getLocalStorageData<{ key: string, value: { quantity: number; unit: string }[] }[]>('requiredIngredients');
      const savedRecipeIds = getLocalStorageData<{id: number, multiplier: number}[]>('savedRecipeIds');
      const shoppingList = getLocalStorageData<{id: number, multiplier: number}[]>('shoppingList');

      if (requiredIngredients && savedRecipeIds && shoppingList && JSON.stringify(savedRecipeIds) === JSON.stringify(shoppingList)) {
        this.shoppingList = requiredIngredients;
      } else {
        this.fetchIngredients();
      }
    } catch (error) {
      console.error('Error loading grocery list from local storage:', error);
    }
  }

  fetchIngredients(): void {
    this.recipeIds = this.recipeService.getRecipeIdsFromLocalStorage();

    if (this.recipeIds.length > 0) {
      this.recipeService.generateShoppingList(this.recipeIds).subscribe({
        next: (ingredients) => {
          this.shoppingList = this.transformIngredients(ingredients);

          // Store the shopping list in local storage
          setLocalStorageData('requiredIngredients', this.shoppingList);

          // Store the recipe data in local storage
          setLocalStorageData('savedRecipeIds', this.recipeIds);

          // Reset the selected items and done list
          this.selectedItems = {};
          this.doneList = [];
          localStorage.removeItem('doneList');
        },
        error: () => {
          this.snackbarService.showError('Error fetching ingredients');
        }
      });
    } else {
      // Display a message or handle empty shopping list
      console.log('Grocery list is empty.');
    }
  }

  transformIngredients(ingredients: Record<string, { quantity: number; unit: string }[]>): { key: string, value: { quantity: number; unit: string }[] }[] {
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
      const doneItemIndex = this.doneList.findIndex((item) => item.key === itemKey);
      if (doneItemIndex !== -1) {
        this.removeFromDoneList(doneItemIndex, itemKey);
      }
    }

    setLocalStorageData('requiredIngredients', this.shoppingList);
    setLocalStorageData('doneList', this.doneList);
  }

  addToDoneList(item: { key: string, value: { quantity: number; unit: string }[] }): void {
    // Add the selected item to the "Done" list
    this.doneList.push(item);

    // Save the "Done" list to local storage
    setLocalStorageData('doneList', this.doneList);

    // Remove the selected item from the "shoppingList" array
    this.shoppingList = this.shoppingList.filter((shoppingItem) => shoppingItem.key !== item.key);

    // Update the selected state in the main list
    this.selectedItems[item.key] = false;
  }

  removeFromDoneList(doneItemIndex: number, itemKey: string): void {
    // Remove the item from the "Done" list
    this.doneList.splice(doneItemIndex, 1);

    // Save the updated "Done" list to local storage
    setLocalStorageData('doneList', this.doneList);

    // Find the item in the "shoppingList" array to add it back
    const mainListItem = this.doneList.find((item) => item.key === itemKey);

    // Insert the item back to the main list while maintaining alphabetical order
    if (mainListItem) {
      const insertionIndex = this.findInsertionIndex(mainListItem);
      this.shoppingList.splice(insertionIndex, 0, mainListItem);
    }

    // Update the selected state in the main list
    this.selectedItems[itemKey] = true;
  }

  findInsertionIndex(item: { key: string, value: { quantity: number; unit: string }[] }): number {
    // Find the correct insertion index to maintain alphabetical order
    return this.shoppingList.findIndex((shoppingItem) => item.key.localeCompare(shoppingItem.key) < 0);
  }

  onDoneItemSelected(itemKey: string): void {
    // Remove the item from the "Done" list
    const doneItemIndex = this.doneList.findIndex((item) => item.key === itemKey);
    if (doneItemIndex !== -1) {
      const removedItem = this.doneList.splice(doneItemIndex, 1)[0];

      // Find the correct insertion index in the main list to maintain alphabetical order
      const insertionIndex = this.findInsertionIndex(removedItem);
      this.shoppingList.splice(insertionIndex, 0, removedItem);

      // Update the selected state in the main list
      this.selectedItems[removedItem.key] = false;
    } else {
      // The item is selected in the main list
      // We should move it to the "Done" list
      const mainItemIndex = this.shoppingList.findIndex((item) => item.key === itemKey);
      if (mainItemIndex !== -1) {
        const removedItem = this.shoppingList.splice(mainItemIndex, 1)[0];
        this.doneList.push(removedItem);

        // Update the selected state in the main list
        this.selectedItems[removedItem.key] = true;
      }
    }

    // Save the updated "Done" list to local storage
    setLocalStorageData('doneList', this.doneList);
    // Save the updated main list to local storage
    setLocalStorageData('requiredIngredients', this.shoppingList);
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
      // Compare arrays by stringifying them to check if the recipes or their multipliers have changed
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

  translateUnit(unit: string): string {
    const translations: Record<string, string> = {
      'tablespoon': 'UNIT_TABLESPOON',
      'teaspoon': 'UNIT_TEASPOON',
      'leaves': 'UNIT_LEAVES',
      'leaf': 'UNIT_LEAF',
      'pinch': 'UNIT_PINCH',
      'pinches': 'UNIT_PINCHES'
    };
    
    const normalizedUnit = unit.toLowerCase();
    return translations[normalizedUnit] ? translations[normalizedUnit] : unit;
  }
}
