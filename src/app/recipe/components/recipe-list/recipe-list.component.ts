import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RecipeService } from '../../../services/recipe.service';
import { SearchService } from '../../../services/search.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
    selector: 'app-recipe-list',
    templateUrl: './recipe-list.component.html',
    styleUrls: ['./recipe-list.component.scss'],
    animations: [
        trigger('fade', [
            state('visible', style({ opacity: 1, height: '*' })),
            state('hidden', style({ opacity: 0, height: '0' })),
            transition('visible <=> hidden', animate('300ms ease-in-out')),
        ]),
    ],
})
export class RecipeListComponent implements OnInit {
    recipes: any[] = [];
    currentPage: number = 1;
    itemsPerPage: number = 12;
    isSearchActive: boolean = false;
    books: any[] = [];
    selectedBook?: string;
    showOffCanvas: boolean = false;

    constructor(
        private router: Router,
        private recipeService: RecipeService,
        private searchService: SearchService,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit() {
        this.searchService.searchValue$.subscribe(searchValue => {
            if (searchValue) {
                this.searchRecipes(searchValue);
            } else {
                this.isSearchActive = false;
                this.loadRecipes();
            }
        });

        this.loadRecipes();
    }

    loadRecipes() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;

        this.recipeService.getRecipes(this.selectedBook).subscribe({
            next: (response) => {
                this.recipes = response.slice(startIndex, endIndex);
            },
            error: (error) => {
                console.error(error);
                this.recipes = [];
            }
        });
    }

    goToRecipeDetails(id: number): void {
        this.router.navigate(['/recipe/detail', id]);
    }

    onPageChange(page: number): void {
        this.currentPage = page;
        this.loadRecipes();
    }

    searchRecipes(searchValue: string): void {
        this.isSearchActive = true;

        this.recipeService.searchRecipes(searchValue).subscribe({
            next: (recipes) => {
                this.recipes = recipes;
            },
            error: (error) => {
                this.snackBar.open(error.error.error, 'Close', {
                    duration: 3000,
                    verticalPosition: 'top'
                });
                this.loadRecipes();
            },
            complete: () => {
                this.isSearchActive = false;
            }
        });
    }

    onBookSelect(bookIds: string): void {
        this.selectedBook = bookIds;
        this.loadRecipes();
    }

    onReset(): void {
        this.selectedBook = undefined;
        this.loadRecipes();
    }

    addRecipeToShoppingList(recipeId: number): void {
        const shoppingList = JSON.parse(localStorage.getItem('shoppingList') || '[]');
        const index = shoppingList.indexOf(recipeId);
        index === -1 ? shoppingList.push(recipeId) : shoppingList.splice(index, 1);
        localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
        const recipeTitle = this.recipes.find(recipe => recipe.id === recipeId)?.title;
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

    // Function to toggle the visibility of the off-canvas
    toggleOffCanvas(): void {
        this.showOffCanvas = !this.showOffCanvas;
    }
}
