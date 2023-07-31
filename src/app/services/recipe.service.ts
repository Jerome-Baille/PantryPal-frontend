import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { API_ENDPOINTS } from '../../../config/api-endpoints';
import { Observable, catchError, firstValueFrom, map, mergeMap, throwError } from 'rxjs';
import { BookService } from './book.service';
import { IngredientService } from './ingredient.service';

interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

interface Recipe {
  title: string;
  instructions: string;
  notes: string;
  preparationTime: number;
  preparationUnit: string;
  cookingTime: number;
  cookingUnit: string;
  fridgeTime: number;
  fridgeUnit: string;
  waitingTime: number;
  waitingUnit: string;
}

interface Book {
  title: string;
  author: string;
}

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
    }).pipe(
      map((response: any) => {
        return response;
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  getRecipes(bookIds?: string): Observable<any> {
    if (!bookIds) {
      return this.http.get<any[]>(API_ENDPOINTS.recipes);
    }
    return this.http.get<any[]>(`${API_ENDPOINTS.recipes}?bookIds=${bookIds}`);
  }

  getRecipe(id: number): Observable<any> {
    return this.http.get<any>(`${API_ENDPOINTS.recipes}/${id}`);
  }

  updateRecipe(id: number, recipe: Recipe): Observable<any> {
    return this.http.put(`${API_ENDPOINTS.recipes}/${id}`, recipe);
  }

  deleteRecipe(id: number): Observable<any> {
    return this.http.delete(`${API_ENDPOINTS.recipes}/${id}`);
  }

  searchRecipes(search: string): Observable<any> {
    return this.http.get<any[]>(`${API_ENDPOINTS.recipes}/search?title=${search}`).pipe(
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
    return this.http.get(`${API_ENDPOINTS.recipes}/${recipe.id}/pdf`)
  }

  getRecipeIdsFromLocalStorage(): number[] {
    const shoppingList = JSON.parse(localStorage.getItem('shoppingList') || '[]');
    return shoppingList;
  }

  getIngredientsForRecipes(recipeIds: any): Observable<any> {
    return this.http.post<any>(`${API_ENDPOINTS.recipes}/shopping-list`, { recipeIds });
  }
}