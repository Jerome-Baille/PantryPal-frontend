import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

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
}

export interface SharingUser {
  id: number;
  username?: string;
  email?: string;
  displayName?: string;
  profilePicture?: string;
  shares?: UserShare[];
  highestPermission?: 'read' | 'edit';
}

export interface SharingUsersResponse {
  sharingWithUsers: SharingUser[];
  sharingWithMeUsers: SharingUser[];
}

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

  getMyShareLinks(includeAll: boolean = false): Observable<ShareLinksResponse> {
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

  // New method to delete a specific share link
  deleteShareLink(token: string): Observable<any> {
    return this.http.delete(`${this.shareBaseUrl}/links/${token}`, { 
      withCredentials: true 
    });
  }

  // New method to delete multiple share links by status
  bulkDeleteShareLinks(status: 'expired' | 'used' | 'accepted'): Observable<any> {
    return this.http.delete(`${this.shareBaseUrl}/links`, { 
      params: { status },
      withCredentials: true 
    });
  }

  // New method to revoke recipe-specific access from a user
  revokeRecipeAccess(recipeId: number, userId: number): Observable<any> {
    return this.http.delete(`${this.shareBaseUrl}/recipe/${recipeId}/${userId}`, {
      withCredentials: true
    });
  }

  // New method to revoke global access from a user
  revokeGlobalAccess(userId: number): Observable<any> {
    return this.http.delete(`${this.shareBaseUrl}/all/${userId}`, {
      withCredentials: true
    });
  }
}