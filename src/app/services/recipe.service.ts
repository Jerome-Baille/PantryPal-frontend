import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from '../../../config/api-endpoints';
import { Observable, catchError, map, mergeMap, throwError } from 'rxjs';
import { BookService } from './book.service';
import { IngredientService } from './ingredient.service';
import { Book } from 'src/app/models/book.model';
import { Recipe } from 'src/app/models/recipe.model';
import { Ingredient } from 'src/app/models/ingredient.model';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  searchResults: any[] = []; // Added property for search results

  constructor(
    private http: HttpClient,
    private bookService: BookService,
    private ingredientService: IngredientService,
  ) { }

  createRecipe(book: Book, recipe: Recipe, ingredients: Ingredient[]): Observable<any> {
    return this.bookService.createBook(book).pipe(
      mergeMap((bookResponse: any) => {
        const bookId = bookResponse.id;
        return this.createRecipeWithBookId(recipe, bookId);
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

  createRecipeWithBookId(recipe: Recipe, bookId: number): Observable<any> {
    return this.http.post(API_ENDPOINTS.recipes, {
      title: recipe.title,
      instructions: recipe.instructions,
      notes: recipe.notes,
      preparationTime: recipe.preparationTime,
      preparationUnit: recipe.preparationUnit,
      cookingTime: recipe.cookingTime,
      cookingUnit: recipe.cookingUnit,
      fridgeTime: recipe.fridgeTime,
      fridgeUnit: recipe.fridgeUnit,
      waitingTime: recipe.waitingTime,
      waitingUnit: recipe.waitingUnit,
      bookId: bookId
    }, { withCredentials: true }).pipe(
      map((response: any) => {
        return response;
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  getRecipes(selectedQueryParams?: string[]): Observable<any> {
    let endpoint = API_ENDPOINTS.recipes;

    if (selectedQueryParams && selectedQueryParams.length > 0) {
      endpoint += '?' + selectedQueryParams.join('&');
    }

    return this.http.get<any[]>(endpoint, { withCredentials: true });
  }

  getRecipe(id: number): Observable<any> {
    return this.http.get<any>(`${API_ENDPOINTS.recipes}/${id}`, { withCredentials: true });
  }

  updateRecipe(id: number, recipe: Recipe): Observable<any> {
    return this.http.put(`${API_ENDPOINTS.recipes}/${id}`, recipe, { withCredentials: true });
  }

  deleteRecipe(id: number): Observable<any> {
    return this.http.delete(`${API_ENDPOINTS.recipes}/${id}`, { withCredentials: true });
  }

  searchRecipes(search: string): Observable<any> {
    return this.http.get<any[]>(`${API_ENDPOINTS.recipes}/search?title=${search}`, { withCredentials: true }).pipe(
      map((recipes) => {
        this.searchResults = recipes; // Assign search results to searchResults property
        return recipes;
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  getSearchResults(): any[] {
    return this.searchResults;
  }

  downloadRecipeAsPDF(recipe: any): Observable<any> {
    return this.http.get(`${API_ENDPOINTS.recipes}/${recipe.id}/pdf`, { withCredentials: true });
  }

  getRecipeIdsFromLocalStorage(): number[] {
    const shoppingList = JSON.parse(localStorage.getItem('shoppingList') || '[]');
    return shoppingList;
  }

  getIngredientsForRecipes(recipeIds: any): Observable<any> {
    return this.http.post<any>(`${API_ENDPOINTS.recipes}/shopping-list`, { recipeIds }, { withCredentials: true });
  }
}