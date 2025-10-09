import { Component, OnInit, OnDestroy, ViewChild, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Observable, Subject, Subscription } from 'rxjs';
import { map, startWith, debounceTime, takeUntil } from 'rxjs/operators';
import { RecipeService } from '../../services/recipe.service';
import { SearchService } from '../../services/search.service';
import { SnackbarService } from '../../services/snackbar.service';
import { Recipe } from '../../models/recipe.model';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { AddToShoppingListComponent } from 'src/app/shared/add-to-shopping-list/add-to-shopping-list.component';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BookService } from 'src/app/services/book.service';
import { IngredientService } from 'src/app/services/ingredient.service';
import { TranslateModule } from '@ngx-translate/core';
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
        MatPaginator,
        MatSelectModule,
        MatAutocompleteModule,
        MatChipsModule,
        MatInputModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        TranslateModule
    ],
    templateUrl: './recipe-list.component.html',
    styleUrls: ['./recipe-list.component.scss']
})
export class RecipeListComponent implements OnInit, OnDestroy {
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    
    // Services
    private filterService = inject(FilterService);
    
    // Subscription management
    private destroy$ = new Subject<void>();
    private subscriptions = new Subscription();
    
    recipes: Recipe[] = [];
    totalRecipes: number = 0;
    pageSize: number = 10;
    currentPage: number = 0;
    pageSizeOptions: number[] = [5, 10, 25, 50];
    isSearchActive: boolean = false;
    books: any[] = [];
    ingredients: string[] = [];
    isFavoritesView: boolean = false;
    
    // Autocomplete search controls
    bookSearchControl = new FormControl('');
    ingredientSearchControl = new FormControl('');
    mealTypeSearchControl = new FormControl('');
    
    // Selected items arrays
    selectedBooks: any[] = [];
    selectedIngredients: string[] = [];
    selectedMealTypes: string[] = [];
    
    // Filtered observables for autocomplete
    filteredBooks!: Observable<any[]>;
    filteredIngredients!: Observable<string[]>;
    filteredMealTypes!: Observable<any[]>;
    
    // Meal types data
    mealTypes = [
        { name: 'STARTER', value: 'starter' },
        { name: 'MAIN_COURSE', value: 'main-course' },
        { name: 'DESSERT', value: 'dessert' }
    ];

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private recipeService: RecipeService,
        private searchService: SearchService,
        private snackbarService: SnackbarService,
        private favoriteService: FavoriteService,
        private bookService: BookService,
        private ingredientService: IngredientService
    ) {
        // Initialize filtered observables for autocomplete
        this.filteredBooks = this.bookSearchControl.valueChanges.pipe(
            startWith(''),
            map(value => this.filterBooks(value || ''))
        );
        
        this.filteredIngredients = this.ingredientSearchControl.valueChanges.pipe(
            startWith(''),
            map(value => this.filterIngredients(value || ''))
        );
        
        this.filteredMealTypes = this.mealTypeSearchControl.valueChanges.pipe(
            startWith(''),
            map(value => this.filterMealTypes(value || ''))
        );
        
        // Subscribe to filter changes from service with debounce to prevent multiple calls
        this.filterService.activeFilters.pipe(
            debounceTime(100),
            takeUntil(this.destroy$)
        ).subscribe(filters => {
            // Only reload if component is initialized and filters actually changed
            if (filters && !this.isFavoritesView) {
                this.loadRecipes();
            }
        });
    }

    ngOnInit() {
        // Get page size from local storage or use default
        const savedPageSize = getLocalStorageData(PAGE_SIZE_KEY);
        if (savedPageSize) {
            this.pageSize = savedPageSize;
        }

        this.route.url.pipe(takeUntil(this.destroy$)).subscribe(url => {
            this.isFavoritesView = url[0]?.path === 'favorites';
            if (this.isFavoritesView) {
                this.loadFavorites();
            } else {
                this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
                    this.currentPage = parseInt(params['page'] || '1') - 1;
                    // Only override pageSize from URL if there's no saved preference
                    if (!savedPageSize && params['limit']) {
                        this.pageSize = parseInt(params['limit']);
                    }
                    this.loadRecipes();
                });
            }
        });

        // Load filter data if not in favorites view
        if (!this.isFavoritesView) {
            this.loadFilterData();
        }

        // Only subscribe to search if not in favorites view
        if (!this.isFavoritesView) {
            this.searchService.searchValue$.pipe(
                debounceTime(300),
                takeUntil(this.destroy$)
            ).subscribe(searchValue => {
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

    // Utility method to check if component state is in sync with service
    isFilterStateSynced(): boolean {
        const activeFilters = this.filterService.getFilters();
        
        const currentBookIds = this.selectedBooks.map(b => b.id.toString()).sort().join(',');
        const currentIngredients = this.selectedIngredients.sort().join(',');
        const currentMealTypes = this.selectedMealTypes.sort().join(',');
        
        const activeBookIds = (activeFilters.bookIds || '').split(',').filter(id => id.trim()).sort().join(',');
        const activeIngredients = (activeFilters.ingredientNames || '').split(',').filter(name => name.trim()).sort().join(',');
        const activeMealTypes = (activeFilters.typeOfMeals || '').split(',').filter(type => type.trim()).sort().join(',');
        
        return currentBookIds === activeBookIds && 
               currentIngredients === activeIngredients && 
               currentMealTypes === activeMealTypes;
    }



    createRecipe(): void {
        this.router.navigate(['/recipe/create']);
    }

    // Filter-related methods
    loadFilterData(): void {
        let booksLoaded = false;
        let ingredientsLoaded = false;

        const checkAndSync = () => {
            if (booksLoaded && ingredientsLoaded) {
                this.syncFiltersFromService();
            }
        };

        this.loadBooks(() => {
            booksLoaded = true;
            checkAndSync();
        });

        this.loadIngredients(() => {
            ingredientsLoaded = true;
            checkAndSync();
        });
    }

    loadBooks(callback?: () => void): void {
        this.bookService.getBooks().subscribe({
            next: (books) => {
                this.books = books;
                if (callback) callback();
            },
            error: (error) => {
                console.error('Error loading books:', error);
                this.books = [];
                if (callback) callback();
            }
        });
    }

    loadIngredients(callback?: () => void): void {
        this.ingredientService.getSetOfIngredients().subscribe({
            next: (ingredients) => {
                this.ingredients = ingredients;
                if (callback) callback();
            },
            error: (error) => {
                console.error('Error loading ingredients:', error);
                this.ingredients = [];
                if (callback) callback();
            }
        });
    }

    // Filter methods for autocomplete
    filterBooks(value: string): any[] {
        const filterValue = value.toLowerCase();
        return this.books.filter(book => 
            (book.title.toLowerCase().includes(filterValue) || 
             book.author.toLowerCase().includes(filterValue)) &&
            !this.selectedBooks.find(b => b.id === book.id)
        );
    }

    filterIngredients(value: string): string[] {
        const filterValue = value.toLowerCase();
        return this.ingredients.filter(ingredient => 
            ingredient.toLowerCase().includes(filterValue) &&
            !this.selectedIngredients.includes(ingredient)
        );
    }

    filterMealTypes(value: string): any[] {
        const filterValue = value.toLowerCase();
        return this.mealTypes.filter(mealType => 
            mealType.name.toLowerCase().includes(filterValue) &&
            !this.selectedMealTypes.includes(mealType.value)
        );
    }

    // Selection methods
    onBookSelected(book: any): void {
        if (book && !this.selectedBooks.find(b => b.id === book.id)) {
            this.selectedBooks.push(book);
            this.bookSearchControl.setValue('');
            this.applyFiltersFromSelections();
        }
    }

    onIngredientSelected(ingredient: string): void {
        if (ingredient && !this.selectedIngredients.includes(ingredient)) {
            this.selectedIngredients.push(ingredient);
            this.ingredientSearchControl.setValue('');
            this.applyFiltersFromSelections();
        }
    }

    onMealTypeSelected(mealType: any): void {
        if (mealType && !this.selectedMealTypes.includes(mealType.value)) {
            this.selectedMealTypes.push(mealType.value);
            this.mealTypeSearchControl.setValue('');
            this.applyFiltersFromSelections();
        }
    }

    // Remove methods
    removeBook(book: any): void {
        const index = this.selectedBooks.findIndex(b => b.id === book.id);
        if (index >= 0) {
            this.selectedBooks.splice(index, 1);
            this.applyFiltersFromSelections();
        }
    }

    removeIngredient(ingredient: string): void {
        const index = this.selectedIngredients.indexOf(ingredient);
        if (index >= 0) {
            this.selectedIngredients.splice(index, 1);
            this.applyFiltersFromSelections();
        }
    }

    removeMealType(mealTypeValue: string): void {
        const index = this.selectedMealTypes.indexOf(mealTypeValue);
        if (index >= 0) {
            this.selectedMealTypes.splice(index, 1);
            this.applyFiltersFromSelections();
        }
    }

    applyFiltersFromSelections(): void {
        const bookIds = this.selectedBooks.map(b => b.id).join(',') || undefined;
        const ingredientNames = this.selectedIngredients.join(',') || undefined;
        const typeOfMeals = this.selectedMealTypes.join(',') || undefined;

        this.filterService.applyFilters({
            bookIds,
            ingredientNames,
            typeOfMeals
        });
    }

    getSelectedBooksCount(): number {
        return this.selectedBooks.length;
    }

    getSelectedIngredientsCount(): number {
        return this.selectedIngredients.length;
    }

    getSelectedMealTypesCount(): number {
        return this.selectedMealTypes.length;
    }

    hasActiveFilters(): boolean {
        return this.getSelectedBooksCount() > 0 || 
               this.getSelectedIngredientsCount() > 0 || 
               this.getSelectedMealTypesCount() > 0;
    }

    clearAllFilters(): void {
        this.selectedBooks = [];
        this.selectedIngredients = [];
        this.selectedMealTypes = [];
        this.bookSearchControl.setValue('');
        this.ingredientSearchControl.setValue('');
        this.mealTypeSearchControl.setValue('');
        this.applyFiltersFromSelections();
    }

    getMealTypeLabel(value: string): string {
        const mealType = this.mealTypes.find(mt => mt.value === value);
        return mealType ? mealType.name : value;
    }

    syncFiltersFromService(): void {
        const activeFilters = this.filterService.getFilters();
        
        // Reset all selections first
        this.selectedBooks = [];
        this.selectedIngredients = [];
        this.selectedMealTypes = [];
        
        // Sync books
        if (activeFilters.bookIds && activeFilters.bookIds.trim()) {
            const bookIds = activeFilters.bookIds.split(',').map(id => id.trim());
            this.selectedBooks = this.books.filter(book => 
                bookIds.includes(book.id.toString())
            );
        }
        
        // Sync ingredients
        if (activeFilters.ingredientNames && activeFilters.ingredientNames.trim()) {
            const ingredientNames = activeFilters.ingredientNames.split(',').map(name => name.trim());
            this.selectedIngredients = ingredientNames.filter(name => 
                this.ingredients.includes(name)
            );
        }
        
        // Sync meal types
        if (activeFilters.typeOfMeals && activeFilters.typeOfMeals.trim()) {
            const mealTypeValues = activeFilters.typeOfMeals.split(',').map(type => type.trim());
            this.selectedMealTypes = mealTypeValues.filter(value => 
                this.mealTypes.some(mt => mt.value === value)
            );
        }
    }

    getThumbnailUrl(recipe: Recipe): string {
        if (recipe.thumbnail) {
            return `https://pantry-pal.jerome-baille.fr/backend${recipe.thumbnail}`;
        }
        return 'assets/icons/icon-512x512.png'; // Fallback image
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.subscriptions.unsubscribe();
    }
}