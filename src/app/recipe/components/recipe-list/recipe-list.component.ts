import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RecipeService } from '../../../services/recipe.service';
import { SearchService } from '../../../services/search.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BookService } from '../../../services/book.service';

@Component({
    selector: 'app-recipe-list',
    templateUrl: './recipe-list.component.html',
    styleUrls: ['./recipe-list.component.scss']
})
export class RecipeListComponent implements OnInit {
    recipes: any[] = [];
    currentPage: number = 1;
    itemsPerPage: number = 12;
    isSearchActive: boolean = false;
    books: any[] = [];
    selectedBook?: number;

    constructor(
        private router: Router,
        private recipeService: RecipeService,
        private searchService: SearchService,
        private snackBar: MatSnackBar,
        private bookService: BookService
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

    onBookSelect(bookId: number): void {
        this.selectedBook = bookId;
        this.loadRecipes();
    }

    onReset(): void {
        this.selectedBook = undefined;
        this.loadRecipes();
    }
}
