import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from '../../../shared/cookie.service';

@Component({
  selector: 'app-recipe-detail',
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.scss']
})
export class RecipeDetailComponent {
  recipe: any = {};
  id: number = 0;
  error: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private cookieService: CookieService
  ) { }

  ngOnInit(): void {
    // Get the token from cookies
    const token = this.cookieService.getCookie('PPaccessToken');

    // Set up the headers with the authorization token
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    // Get the recipe ID from the route parameters
    const id = this.route.snapshot.paramMap.get('id');

    // Make the API call with the headers and recipe ID
    this.http.get<any>(`http://localhost:3000/api/recipes/${id}`, { headers }).subscribe({
      next: (response) => {
        this.recipe = response;
        this.error = null;
      },
      error: (error) => {
        console.error(error);
        this.recipe = {};
        this.error = error;
      }
    })
  }

  deleteRecipe(): void {
    // Get the token from cookies
    const token = this.cookieService.getCookie('PPaccessToken');

    // Set up the headers with the authorization token
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    // Get the recipe ID from the route parameters
    const id = this.route.snapshot.paramMap.get('id');

    // Make the API call with the headers and recipe ID
    this.http.delete(`http://localhost:3000/api/recipes/${id}`, { headers }).subscribe({
      next: () => {
        this.router.navigate(['/recipe/list']);
      },
      error: (error) => {
        console.error(error);
      }
    })
  }
}