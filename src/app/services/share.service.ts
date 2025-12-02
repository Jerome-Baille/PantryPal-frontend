import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, switchMap, of } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface ShareLinkStats {
  total: number;
  active: number;
  used: number;
  accepted: number;
  expired: number;
}

export interface ShareLink {
  id: number;
  token: string;
  recipeId?: number;
  shareUrl: string;
  permissionLevel: 'read' | 'edit';
  expiresAt: string;
  isUsed: boolean;
  isAccepted: boolean;
  type: 'recipe' | 'global';
  status: string;
  recipe?: {
    title: string;
  };
}

export interface ShareLinksResponse {
  links: ShareLink[];
  stats?: ShareLinkStats;
}

export interface UserShare {
  permissionLevel: 'read' | 'edit';
  recipeId: number | null;
  isGlobal: boolean;
  isExcluded?: number;  // Adding isExcluded property
}

export interface SharingUser {
  id: number;
  username?: string;
  email?: string;
  displayName?: string;
  profilePicture?: string;
  shares?: UserShare[];
  highestPermission?: 'read' | 'edit';
  isExcluded?: boolean;
  // New properties from updated backend API
  accessType?: 'global' | 'specific' | 'excluded';
  shareStatus?: 'granted' | 'revoked';
  // Added for frontend UI
  hasExcludedRecipes?: boolean;
}

export interface SharingUsersResponse {
  sharingWithUsers: SharingUser[];
  sharingWithMeUsers: SharingUser[];
}

export interface RecipeSharesResponse {
  shares: RecipeShare[];
  totalShares: number;
  stats?: {
    specific: number;
    global: number;
    excluded: number;
  }
}

interface RecipeShare {
  sharedWithId: number;
  permissionLevel?: 'read' | 'edit';
  username?: string;
  email?: string;
  displayName?: string;
  profilePicture?: string;
  accessType?: string;
  status?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ShareService {
  private http = inject(HttpClient);

  private shareBaseUrl = 'https://pantry-pal.jerome-baille.fr/api/shares';
  private authBaseUrl = 'https://auth.jerome-baille.fr/api';
  private recipesURL = environment.recipesURL;

  createRecipeShareLink(recipeId?: number | null, permissionLevel: 'read' | 'edit' = 'read', expiresInDays = 7): Observable<{ token: string; shareUrl: string }> {
    return this.http.post<{ token: string; shareUrl: string }>(`${this.shareBaseUrl}/links/recipe`, {
      ...(recipeId && { recipeId }),
      permissionLevel,
      expiresInDays
    }, { withCredentials: true });
  }

  createAllRecipesShareLink(permissionLevel: 'read' | 'edit' = 'read', expiresInDays = 7): Observable<{ shareLink: { token: string; shareUrl: string } }> {
    return this.http.post<{ shareLink: { token: string; shareUrl: string } }>(`${this.shareBaseUrl}/links/all`, {
      permissionLevel,
      expiresInDays
    }, { withCredentials: true });
  }

  acceptShareLink(token: string): Observable<{ message: string; type?: 'global' | 'recipe'; recipeTitle?: string }> {
    return this.http.post<{ message: string; type?: 'global' | 'recipe'; recipeTitle?: string }>(`${this.shareBaseUrl}/links/${token}/accept`, {}, { withCredentials: true });
  }

  getMyShareLinks(includeAll = false): Observable<ShareLinksResponse> {
    return this.http.get<ShareLinksResponse>(`${this.shareBaseUrl}/links`, {
      params: { includeAll: includeAll.toString() },
      withCredentials: true
    });
  }

  getSharingUserIds(): Observable<SharingUsersResponse> {
    return this.http.get<SharingUsersResponse>(`${this.shareBaseUrl}/user-ids`, { 
      withCredentials: true 
    });
  }

  // Get shares for a specific recipe - Enhanced to include user details
  getRecipeShares(recipeId: number): Observable<RecipeSharesResponse> {
    return this.http.get<RecipeSharesResponse>(`${this.shareBaseUrl}/users/${recipeId}`, { 
      withCredentials: true 
    }).pipe(
      switchMap(response => {
        if (response.shares && response.shares.length > 0) {
          // Extract all userIds from the shares
          const userIds = response.shares.map(share => share.sharedWithId);
          
          // Fetch user details for these IDs
          return this.getUserDetails(userIds).pipe(
            map(userDetails => {
              // Merge user details with shares
              const enrichedShares = response.shares.map(share => {
                const userDetail = userDetails.users.find(u => u.id === share.sharedWithId) || {};
                return {
                  ...share,
                  ...userDetail
                };
              });
              
              return {
                ...response,
                shares: enrichedShares
              };
            })
          );
        }
        
        // If no shares, return the original response
        return of(response);
      })
    );
  }
  
  // Helper method to fetch user details
  private getUserDetails(userIds: number[]): Observable<{users: { id: number; username?: string; email?: string; displayName?: string; profilePicture?: string }[]}> {
    if (!userIds.length) {
      return of({users: []});
    }
    
    return this.http.post<{users: { id: number; username?: string; email?: string; displayName?: string; profilePicture?: string }[]}>(`${this.authBaseUrl}/user/public-info`, {
      userIds
    }, { 
      withCredentials: true 
    });
  }

  // Delete a specific share link
  deleteShareLink(token: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.shareBaseUrl}/links/${token}`, { 
      withCredentials: true 
    });
  }

  // Delete multiple share links by status
  bulkDeleteShareLinks(status: 'expired' | 'used' | 'accepted'): Observable<{ deletedCount: number }> {
    return this.http.delete<{ deletedCount: number }>(`${this.shareBaseUrl}/links`, { 
      params: { status },
      withCredentials: true 
    });
  }

  // Revoke recipe-specific access from a user by excluding it from global share
  // Changed to use POST /exclude instead of DELETE /recipe/{recipeId}/{sharedWithId}
  revokeRecipeAccess(recipeId: number, userId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.shareBaseUrl}/exclude`, {
      recipeId,
      sharedWithId: userId
    }, {
      withCredentials: true
    });
  }

  // Remove recipe exclusion for a user with global access
  removeRecipeExclusion(recipeId: number, userId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.shareBaseUrl}/exclude/${recipeId}/${userId}`, {
      withCredentials: true
    });
  }

  // Revoke global access from a user
  revokeGlobalAccess(userId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.shareBaseUrl}/all/${userId}`, {
      withCredentials: true
    });
  }

  // Get recipe titles by array of IDs
  getRecipeTitlesByIds(recipeIds: number[]): Observable<Record<number, string>> {
    return this.http.post<Record<number, string>>(`${this.recipesURL}/titles`, {
      ids: recipeIds
    }, {
      withCredentials: true
    });
  }
}