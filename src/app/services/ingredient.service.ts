import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, forkJoin, map, of, throwError } from 'rxjs';
import { RecipeIngredient } from 'src/app/models/recipe-ingredient.model';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class IngredientService {
  private ingredientsURL = environment.ingredientsURL;

  constructor(
    private http: HttpClient
  ) { }

  createIngredients(ingredients: RecipeIngredient[], recipeId: number): Observable<any[]> {
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

  createIngredient(recipeId: number, ingredient: RecipeIngredient): Observable<any> {
    return this.http.post(`${this.ingredientsURL}`, {
      name: ingredient.Ingredient?.name,
      recipeId: recipeId,
      quantity: ingredient.quantity || 1,
      unit: ingredient.unit || 'unit',
      recipeSectionId: ingredient.recipeSectionId || null
    }, { withCredentials: true });
  }

  getSetOfIngredients(): Observable<any> {
    return this.http.get(`${this.ingredientsURL}/set`, { withCredentials: true });
  }

  updateIngredient(id: number, ingredient: { name: string }): Observable<any> {
    return this.http.put(`${this.ingredientsURL}/${id}`, ingredient, { withCredentials: true });
  }

  deleteIngredient(id: number): Observable<any> {
    return this.http.delete(`${this.ingredientsURL}/${id}`, { withCredentials: true });
  }
}