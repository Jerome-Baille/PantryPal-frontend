import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, mergeMap, throwError, of } from 'rxjs';
import { BookService } from './book.service';
import { IngredientService } from './ingredient.service';
import { Book } from 'src/app/models/book.model';
import { Recipe } from 'src/app/models/recipe.model';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private recipesURL = environment.recipesURL;
  searchResults: any[] = [];

  constructor(
    private http: HttpClient,
    private bookService: BookService,
    private ingredientService: IngredientService,
  ) { }

  createRecipe(book: Book, recipe: any, ingredients: any[], timers: any[], image?: File): Observable<any> {
    return this.bookService.createBook(book).pipe(
      mergeMap((bookResponse: any) => {
        const bookId = bookResponse.id;
        return this.createRecipeWithBookId(recipe, bookId, image);
      }),
      mergeMap((recipeResponse: any) => {
        const recipeId = recipeResponse.id;
        return this.ingredientService.createIngredients(ingredients, recipeId).pipe(
          map((ingredientsResponse: any) => {
            return ingredientsResponse;
          }),
          catchError((error) => {
            return throwError(() => error);
          })
        )
      })
    );
  }

  createRecipeWithBookId(recipe: any, bookId: number, image?: File): Observable<any> {
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
    
    return this.http.post(`${this.recipesURL}`, formData, { withCredentials: true }).pipe(
      map((response: any) => response),
      catchError((error) => throwError(() => error))
    );
  }

  getRecipes(page: number = 1, limit: number = 10, selectedQueryParams?: string[]): Observable<any> {
    let queryParams = [`page=${page}`, `limit=${limit}`];
    
    if (selectedQueryParams && selectedQueryParams.length > 0) {
      queryParams = queryParams.concat(selectedQueryParams);
    }

    const endpoint = `${this.recipesURL}?${queryParams.join('&')}`;
    return this.http.get<any>(endpoint, { withCredentials: true });
  }

  getRecipe(id: number): Observable<any> {
    return this.http.get<any>(`${this.recipesURL}/${id}`, { withCredentials: true });
  }

  updateRecipe(id: number, recipe: Recipe, image?: File): Observable<any> {
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
    
    return this.http.put(`${this.recipesURL}/${id}`, formData, { withCredentials: true });
  }

  deleteRecipe(id: number): Observable<any> {
    return this.http.delete(`${this.recipesURL}/${id}`, { withCredentials: true });
  }

  searchRecipes(search: string): Observable<any> {
    return this.http.get<any[]>(`${this.recipesURL}/search?title=${search}`, { withCredentials: true }).pipe(
      map((recipes) => {
        this.searchResults = recipes; // Assign search results to searchResults property
        return recipes;
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  searchRecipesForDropdown(search: string, limit: number = 8): Observable<any[]> {
    // Use the same endpoint as the working search but limit results for dropdown
    return this.searchRecipes(search).pipe(
      map((recipes: any[]) => {
        // Limit results to the specified number for dropdown
        return Array.isArray(recipes) ? recipes.slice(0, limit) : [];
      }),
      catchError((error) => {
        // Return empty array instead of throwing error to show "no results" UI
        return of([]);
      })
    );
  }

  getSearchResults(): any[] {
    return this.searchResults;
  }

  downloadRecipeAsPDF(recipe: any, lang: string): Observable<any> {
    return this.http.get(`${this.recipesURL}/${recipe.id}/pdf?language=${lang}`, { withCredentials: true });
  }

  getRecipeIdsFromLocalStorage(): any[] {
    const shoppingList = JSON.parse(localStorage.getItem('shoppingList') || '[]');
    return shoppingList; // Now returns array of {id, multiplier} objects
  }

  generateShoppingList(recipes: {id: number, multiplier: number}[]): Observable<any> {
    return this.http.post<any>(`${this.recipesURL}/shopping-list`, { recipes }, { withCredentials: true });
  }
}