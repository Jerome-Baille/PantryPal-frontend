import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, forkJoin, map, of, throwError } from 'rxjs';
import { Ingredient as IngredientModel } from 'src/app/models/ingredient.model';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class IngredientService {
  private ingredientsURL = environment.ingredientsURL;

  constructor(
    private http: HttpClient
  ) { }

  createIngredients(ingredients: IngredientModel[], recipeId: number): Observable<any[]> {
    if (ingredients.length === 0) {
      return of([]);
    }

    const ingredientObservables = ingredients.map((ingredient) => {
      return this.createIngredient(recipeId, ingredient).pipe(
        map((response) => {
          return response;
        }),
        catchError((error) => {
          return throwError(() => error);
        })
      );
    });
    return forkJoin(ingredientObservables);
  }

  createIngredient(recipeId: number, ingredient: IngredientModel): Observable<any> {
    return this.http.post(`${this.ingredientsURL}`, {
      name: ingredient.name,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      recipeId: recipeId
    }, { withCredentials: true });
  }

  getSetOfIngredients(): Observable<any> {
    return this.http.get(`${this.ingredientsURL}/set`, { withCredentials: true });
  }

  updateIngredient(id: number, ingredient: IngredientModel): Observable<any> {
    return this.http.put(`${this.ingredientsURL}/${id}`, ingredient, { withCredentials: true });
  }

  deleteIngredient(id: number): Observable<any> {
    return this.http.delete(`${this.ingredientsURL}/${id}`, { withCredentials: true });
  }
}