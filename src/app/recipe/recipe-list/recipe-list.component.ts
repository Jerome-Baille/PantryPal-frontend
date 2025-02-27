import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { RecipeService } from '../../services/recipe.service';
import { SearchService } from '../../services/search.service';
import { SnackbarService } from '../../services/snackbar.service';
import { Recipe } from '../../models/recipe.model';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { AddToShoppingListComponent } from 'src/app/shared/add-to-shopping-list/add-to-shopping-list.component';
import { FiltersComponent } from '../filters/filters.component';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FavoriteService } from '../../services/favorite.service';
import { getLocalStorageData, setLocalStorageData } from '../../helpers/local-storage.helper';
import { FilterService } from 'src/app/services/filter.service';

// Local storage key for page size
const PAGE_SIZE_KEY = 'recipesPageSize';

@Component({
    selector: 'app-recipe-list',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        AddToShoppingListComponent,
        FiltersComponent,
        MatPaginator
    ],
    templateUrl: './recipe-list.component.html',
    styleUrls: ['./recipe-list.component.scss']
})
export class RecipeListComponent implements OnInit {
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    
    // Services
    private filterService = inject(FilterService);
    
    recipes: Recipe[] = [];
    totalRecipes: number = 0;
    pageSize: number = 10;
    currentPage: number = 0;
    pageSizeOptions: number[] = [5, 10, 25, 50];
    isSearchActive: boolean = false;
    books: any[] = [];
    isFavoritesView: boolean = false;
    
    // Use the signal from FilterService
    showOffCanvas = this.filterService.filtersVisible;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private recipeService: RecipeService,
        private searchService: SearchService,
        private snackbarService: SnackbarService,
        private favoriteService: FavoriteService
    ) {
        // Subscribe to filter changes
        this.filterService.activeFilters.subscribe(filters => {
            if (filters) {
                this.onFiltersSelect(filters);
            }
        });
    }

    ngOnInit() {
        // Get page size from local storage or use default
        const savedPageSize = getLocalStorageData(PAGE_SIZE_KEY);
        if (savedPageSize) {
            this.pageSize = savedPageSize;
        }

        this.route.url.subscribe(url => {
            this.isFavoritesView = url[0]?.path === 'favorites';
            if (this.isFavoritesView) {
                this.loadFavorites();
            } else {
                this.route.queryParams.subscribe(params => {
                    this.currentPage = parseInt(params['page'] || '1') - 1;
                    // Only override pageSize from URL if there's no saved preference
                    if (!savedPageSize && params['limit']) {
                        this.pageSize = parseInt(params['limit']);
                    }
                    this.loadRecipes();
                });
            }
        });

        // Only subscribe to search if not in favorites view
        if (!this.isFavoritesView) {
            this.searchService.searchValue$.subscribe(searchValue => {
                if (searchValue) {
                    this.searchRecipes(searchValue);
                } else {
                    this.isSearchActive = false;
                    this.loadRecipes();
                }
            });
        }
    }

    loadRecipes() {
        const filters = this.filterService.getFilters();
        const selectedQueryParams = Object.entries(filters)
            .filter(([key, value]) => value)
            .map(([key, value]) => `${key}=${value}`);

        this.recipeService.getRecipes(this.currentPage + 1, this.pageSize, selectedQueryParams).subscribe({
            next: (response) => {
                this.recipes = response.recipes;
                this.totalRecipes = response.totalRecipes;
                if (this.paginator) {
                    this.paginator.pageIndex = response.currentPage - 1;
                    this.paginator.length = response.totalRecipes;
                }
            },
            error: (error) => {
                console.error(error);
                this.recipes = [];
            }
        });
    }

    loadFavorites() {
        this.favoriteService.getUsersFavorites().subscribe({
            next: (response) => {
                // Updated to extract data from response object
                this.recipes = response.recipes;
                this.totalRecipes = response.totalRecipes;
                if (this.paginator) {
                    this.paginator.pageIndex = response.currentPage - 1;
                    this.paginator.length = response.totalRecipes;
                }
            },
            error: (error) => {
                console.error(error);
                this.snackbarService.showError('Failed to load favorites');
                this.recipes = [];
            }
        });
    }

    handlePageEvent(event: PageEvent) {
        this.currentPage = event.pageIndex;
        this.pageSize = event.pageSize;
        
        // Save page size to local storage
        setLocalStorageData(PAGE_SIZE_KEY, this.pageSize);
        
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { 
                page: this.currentPage + 1,
                limit: this.pageSize 
            },
            queryParamsHandling: 'merge'
        });
    }

    goToRecipeDetails(id: number): void {
        this.router.navigate(['/recipe/detail', id]);
    }

    searchRecipes(searchValue: string): void {
        this.isSearchActive = true;

        this.recipeService.searchRecipes(searchValue).subscribe({
            next: (recipes) => {
                this.recipes = recipes;
            },
            error: (error) => {
                this.snackbarService.showError(error.error.error);
                this.loadRecipes();
            },
            complete: () => {
                this.isSearchActive = false;
            }
        });
    }

    onFiltersSelect(selectedFilters: { bookIds?: string, ingredientNames?: string, typeOfMeals?: string }): void {
        this.loadRecipes();
    }

    onReset(): void {
        this.filterService.resetFilters();
        this.loadRecipes();
    }

    toggleOffCanvas(): void {
        this.filterService.toggleFiltersVisibility();
    }

    createRecipe(): void {
        this.router.navigate(['/recipe/create']);
    }
}