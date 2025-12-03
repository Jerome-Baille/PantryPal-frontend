import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, forkJoin, map, of, throwError } from 'rxjs';
import { RecipeIngredient } from 'src/app/shared/models/recipe-ingredient.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class IngredientService {
  private http = inject(HttpClient);

  private ingredientsURL = environment.ingredientsURL;

  createIngredients(ingredients: RecipeIngredient[], recipeId: number): Observable<RecipeIngredient[]> {
    if (ingredients.length === 0) {
      return of([]);
    }

    const ingredientObservables = ingredients.map((ingredient) => {
      return this.createIngredient(recipeId, ingredient).pipe(
        map((response) => response),
        catchError((error) => throwError(() => error))
      );
    });
    return forkJoin(ingredientObservables);
  }

  createIngredient(recipeId: number, ingredient: RecipeIngredient): Observable<RecipeIngredient> {
    return this.http.post<RecipeIngredient>(`${this.ingredientsURL}`, {
      name: ingredient.Ingredient?.name,
      recipeId: recipeId,
      quantity: ingredient.quantity || 1,
      unit: ingredient.unit || 'unit',
      recipeSectionId: ingredient.recipeSectionId || null
    }, { withCredentials: true });
  }

  getSetOfIngredients(): Observable<string[]> {
    return this.http.get<string[]>(`${this.ingredientsURL}/set`, { withCredentials: true });
  }

  updateIngredient(id: number, ingredient: { name: string }): Observable<{ id: number; name: string }> {
    return this.http.put<{ id: number; name: string }>(`${this.ingredientsURL}/${id}`, ingredient, { withCredentials: true });
  }

  deleteIngredient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.ingredientsURL}/${id}`, { withCredentials: true });
  }
}