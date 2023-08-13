import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from '../../../config/api-endpoints';
import { Observable, catchError, forkJoin, map, of, throwError } from 'rxjs';
import { Ingredient as IngredientModel } from 'src/app/models/ingredient.model';

@Injectable({
  providedIn: 'root'
})
export class IngredientService {

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
    return this.http.post(API_ENDPOINTS.ingredients, {
      name: ingredient.name,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      recipeId: recipeId
    });
  }

  getSetOfIngredients(): Observable<any> {
    return this.http.get(`${API_ENDPOINTS.ingredients}/set`)
  }

  updateIngredient(id: number, ingredient: IngredientModel): Observable<any> {
    return this.http.put(`${API_ENDPOINTS.ingredients}/${id}`, ingredient);
  }

  deleteIngredient(id: number): Observable<any> {
    return this.http.delete(`${API_ENDPOINTS.ingredients}/${id}`);
  }
}
