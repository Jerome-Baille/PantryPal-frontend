import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RecipeService } from '../../services/recipe.service';
import { SearchService } from '../../services/search.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Recipe } from '../../models/recipe.model';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { AddToShoppingListComponent } from 'src/app/shared/add-to-shopping-list/add-to-shopping-list.component';
import { FiltersComponent } from '../filters/filters.component';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-recipe-list',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        AddToShoppingListComponent,
        FiltersComponent
    ],
    templateUrl: './recipe-list.component.html',
    styleUrls: ['./recipe-list.component.scss']
})
export class RecipeListComponent implements OnInit {
    recipes: Recipe[] = [];
    currentPage: number = 1;
    itemsPerPage: number = 12;
    isSearchActive: boolean = false;
    books: any[] = [];
    selectedFilters: { bookIds?: string, ingredientNames?: string, typeOfMeals?: string } = {};
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

        // Load recipes initially
        this.loadRecipes();
    }

    loadRecipes() {
        const selectedQueryParams = Object.entries(this.selectedFilters)
            .filter(([key, value]) => value)
            .map(([key, value]) => `${key}=${value}`);

        this.recipeService.getRecipes(selectedQueryParams).subscribe({
            next: (response) => {
                this.recipes = this.applyPagination(response);
            },
            error: (error) => {
                console.error(error);
                this.recipes = [];
            }
        });
    }

    applyPagination(recipes: Recipe[]): Recipe[] {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return recipes.slice(startIndex, endIndex);
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

    onFiltersSelect(selectedFilters: { bookIds?: string, ingredientNames?: string, typeOfMeals?: string }): void {
        this.selectedFilters = selectedFilters;
        this.loadRecipes();
    }

    onReset(): void {
        this.selectedFilters = {};
        this.loadRecipes();
    }

    toggleOffCanvas(): void {
        this.showOffCanvas = !this.showOffCanvas;
    }
}