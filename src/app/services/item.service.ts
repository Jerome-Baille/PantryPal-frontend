import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private itemsURL = environment.itemsURL;

  constructor(
    private http: HttpClient,
  ) { }

  updateRecipeIngredient(id: number, ingredient: any) {
    return this.http.put(`${this.itemsURL}/recipeIngredients/${id}`, ingredient, { withCredentials: true });
  }

  createRecipeIngredient(ingredient: any) { // new method
    return this.http.post(`${this.itemsURL}/recipeIngredients`, ingredient, { withCredentials: true });
  }

  getRecipeIngredientsByRecipeId(recipeId: number): Observable<any> {
    return this.http.get(`${this.itemsURL}/recipeIngredients/recipe/${recipeId}`, { withCredentials: true });
  }

  updateRecipeSection(id: number, section: any) {
    return this.http.put(`${this.itemsURL}/recipeSections/${id}`, section, { withCredentials: true });
  }

  createRecipeSection(section: any) { // new method
    return this.http.post(`${this.itemsURL}/recipeSections`, section, { withCredentials: true });
  }

  getRecipeSectionsByRecipeId(recipeId: number): Observable<any> {
    return this.http.get(`${this.itemsURL}/recipeSections/recipe/${recipeId}`, { withCredentials: true });
  }

  updateRecipeTimer(id: number, timer: any) {
    return this.http.put(`${this.itemsURL}/timers/${id}`, timer, { withCredentials: true });
  }

  createTimer(timer: any) { // new method
    return this.http.post(`${this.itemsURL}/timers`, timer, { withCredentials: true });
  }

  deleteTimer(id: number) {
    return this.http.delete(`${this.itemsURL}/timers/${id}`, { withCredentials: true });
  }
}
