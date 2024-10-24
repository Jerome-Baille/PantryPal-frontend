import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';


interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpireDate: Date;
  refreshTokenExpireDate: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authURL = environment.authURL;

  constructor(
    private http: HttpClient,
  ) {  }

  // Method to handle user logout
  logout() {
    return this.http.post(`${this.authURL}/logout`, {}, { withCredentials: true });
  }

  // Method to handle user login
  login(username: string, password: string) {
    return this.http.post(`${this.authURL}/login`, { username, password }, { withCredentials: true });
  }

  // Method to handle user registration
  register(username: string, email: string, password: string) {
    return this.http.post(`${this.authURL}/register`, { username, email, password }, { withCredentials: true });
  }

    // Social Authentication
    loginWithGoogle() {
      const redirectUrl = encodeURIComponent(window.location.origin + '/profile');
      window.location.href = `${this.authURL}/google?redirectUrl=${redirectUrl}`;
    }
  
    loginWithFacebook() {
      const redirectUrl = encodeURIComponent(window.location.origin + '/profile');
      window.location.href = `${this.authURL}/facebook?redirectUrl=${redirectUrl}`;
    }
  
    loginWithGithub() {
      const redirectUrl = encodeURIComponent(window.location.origin + '/profile');
      window.location.href = `${this.authURL}/github?redirectUrl=${redirectUrl}`;
  }
  
    refreshToken() {
      return this.http.post(`${this.authURL}/refresh`, {}, { withCredentials: true });
    }
}