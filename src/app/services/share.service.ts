import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShareService {
  private shareBaseUrl = 'https://pantry-pal.jerome-baille.fr/api/shares';

  constructor(
    private http: HttpClient
  ) { }

  createRecipeShareLink(recipeId?: number | null, permissionLevel: 'read' | 'edit' = 'read', expiresInDays: number = 7): Observable<any> {
    return this.http.post(`${this.shareBaseUrl}/links/recipe`, {
      ...(recipeId && { recipeId }),
      permissionLevel,
      expiresInDays
    }, { withCredentials: true });
  }

  createAllRecipesShareLink(permissionLevel: 'read' | 'edit' = 'read', expiresInDays: number = 7): Observable<any> {
    return this.http.post(`${this.shareBaseUrl}/links/all`, {
      permissionLevel,
      expiresInDays
    }, { withCredentials: true });
  }

  acceptShareLink(token: string): Observable<any> {
    return this.http.post(`${this.shareBaseUrl}/links/${token}/accept`, {}, { withCredentials: true });
  }

  // Add other share-related methods here as needed
}