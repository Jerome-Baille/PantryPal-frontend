import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from '../../../shared/cookie.service';

@Component({
    selector: 'app-recipe-list',
    templateUrl: './recipe-list.component.html',
    styleUrls: ['./recipe-list.component.scss']
})
export class RecipeListComponent implements OnInit {
    recipes: any[] = [];

    constructor(
        private http: HttpClient,
        private router: Router,
        private cookieService: CookieService
    ) { }

    ngOnInit() {
        // Get the token from cookies
        const token = this.cookieService.getCookie('PPaccessToken');

        // Set up the headers with the authorization token
        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`
        });

        // Make the API call with the headers
        this.http.get<any[]>('http://localhost:3000/api/recipes', { headers }).subscribe({
            next: (response) => {
                this.recipes = response;
            },
            error: (error) => {
                console.error(error);
                this.recipes = [];
            }
        })
    }

    goToRecipeDetails(id: number): void {
        this.router.navigate(['/recipe/detail', id]);
    }
}