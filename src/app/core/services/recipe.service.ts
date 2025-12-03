import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, mergeMap, throwError, of } from 'rxjs';
import { BookService } from './book.service';
import { IngredientService } from './ingredient.service';
import { Book } from 'src/app/shared/models/book.model';
import { Recipe } from 'src/app/shared/models/recipe.model';
import { RecipeIngredient } from 'src/app/shared/models/recipe-ingredient.model';
import { environment } from 'src/environments/environment';

interface RecipeFormData {
  title: string;
  instructions: string;
  notes?: string;
  typeOfMeal?: string;
  servings?: number;
}

interface RecipeResponse {
  id: number;
  title: string;
  instructions: string;
  notes?: string;
  typeOfMeal?: string;
  servings?: number;
  picture?: string;
  thumbnail?: string;
}

interface RecipesListResponse {
  recipes: Recipe[];
  totalRecipes: number;
  currentPage: number;
  totalPages: number;
}

interface SearchResult {
  id: number;
  title: string;
  preparationTime?: number;
  preparationUnit?: string;
  servings?: number;
}

type ShoppingListResponse = Record<string, { quantity: number; unit: string }[]>;

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private http = inject(HttpClient);
  private bookService = inject(BookService);
  private ingredientService = inject(IngredientService);

  private recipesURL = environment.recipesURL;
  searchResults: SearchResult[] = [];

  createRecipe(book: Book, recipe: RecipeFormData, ingredients: RecipeIngredient[], _timers: unknown[], image?: File): Observable<RecipeResponse> {
    return this.bookService.createBook(book).pipe(
      mergeMap((bookResponse: Book) => {
        const bookId = bookResponse.id!;
        return this.createRecipeWithBookId(recipe, bookId, image);
      }),
      mergeMap((recipeResponse: RecipeResponse) => {
        const recipeId = recipeResponse.id;
        return this.ingredientService.createIngredients(ingredients, recipeId).pipe(
          map(() => {
            return recipeResponse; // Return recipe response instead of ingredients response
          }),
          catchError((error) => {
            return throwError(() => error);
          })
        )
      })
    );
  }

  createRecipeWithBookId(recipe: RecipeFormData, bookId: number, image?: File): Observable<RecipeResponse> {
    const formData = new FormData();
    formData.append('title', recipe.title);
    formData.append('instructions', recipe.instructions);
    formData.append('bookId', bookId.toString());
    
    if (recipe.notes) formData.append('notes', recipe.notes);
    if (recipe.typeOfMeal) formData.append('typeOfMeal', recipe.typeOfMeal);
    if (recipe.servings !== undefined && recipe.servings !== null) {
      formData.append('servings', recipe.servings.toString());
    }
    if (image) formData.append('image', image);
    
    return this.http.post<RecipeResponse>(`${this.recipesURL}`, formData, { withCredentials: true }).pipe(
      map((response: RecipeResponse) => response),
      catchError((error) => throwError(() => error))
    );
  }

  getRecipes(page = 1, limit = 10, selectedQueryParams?: string[]): Observable<RecipesListResponse> {
    let queryParams = [`page=${page}`, `limit=${limit}`];
    
    if (selectedQueryParams && selectedQueryParams.length > 0) {
      queryParams = queryParams.concat(selectedQueryParams);
    }

    const endpoint = `${this.recipesURL}?${queryParams.join('&')}`;
    return this.http.get<RecipesListResponse>(endpoint, { withCredentials: true });
  }

  getRecipe(id: number): Observable<Recipe & { isFavorited?: boolean; RecipeIngredients?: unknown[] }> {
    return this.http.get<Recipe & { isFavorited?: boolean; RecipeIngredients?: unknown[] }>(`${this.recipesURL}/${id}`, { withCredentials: true });
  }

  updateRecipe(id: number, recipe: Recipe, image?: File): Observable<RecipeResponse> {
    const formData = new FormData();
    
    // Add recipe fields to FormData
    if (recipe.title) formData.append('title', recipe.title);
    if (recipe.instructions) formData.append('instructions', recipe.instructions);
    if (recipe.notes !== undefined && recipe.notes !== null) formData.append('notes', recipe.notes);
    if (recipe.typeOfMeal) formData.append('typeOfMeal', recipe.typeOfMeal);
    if (recipe.servings !== undefined && recipe.servings !== null) {
      formData.append('servings', recipe.servings.toString());
    }
    if (image) formData.append('image', image);
    
    return this.http.put<RecipeResponse>(`${this.recipesURL}/${id}`, formData, { withCredentials: true });
  }

  deleteRecipe(id: number): Observable<void> {
    return this.http.delete<void>(`${this.recipesURL}/${id}`, { withCredentials: true });
  }

  searchRecipes(search: string): Observable<SearchResult[]> {
    return this.http.get<SearchResult[]>(`${this.recipesURL}/search?title=${search}`, { withCredentials: true }).pipe(
      map((recipes) => {
        this.searchResults = recipes; // Assign search results to searchResults property
        return recipes;
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  searchRecipesForDropdown(search: string, limit = 8): Observable<SearchResult[]> {
    // Use the same endpoint as the working search but limit results for dropdown
    return this.searchRecipes(search).pipe(
      map((recipes: SearchResult[]) => {
        // Limit results to the specified number for dropdown
        return Array.isArray(recipes) ? recipes.slice(0, limit) : [];
      }),
      catchError(() => {
        // Return empty array instead of throwing error to show "no results" UI
        return of([]);
      })
    );
  }

  getSearchResults(): SearchResult[] {
    return this.searchResults;
  }

  downloadRecipeAsPDF(recipe: { id: number }, lang: string): Observable<{ link: string }> {
    return this.http.get<{ link: string }>(`${this.recipesURL}/${recipe.id}/pdf?language=${lang}`, { withCredentials: true });
  }

  getRecipeIdsFromLocalStorage(): { id: number; multiplier: number }[] {
    const shoppingList = JSON.parse(localStorage.getItem('shoppingList') || '[]');
    return shoppingList; // Now returns array of {id, multiplier} objects
  }

  generateShoppingList(recipes: {id: number, multiplier: number}[]): Observable<ShoppingListResponse> {
    return this.http.post<ShoppingListResponse>(`${this.recipesURL}/shopping-list`, { recipes }, { withCredentials: true });
  }
}