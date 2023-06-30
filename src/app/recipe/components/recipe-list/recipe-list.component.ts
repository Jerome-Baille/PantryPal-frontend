import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.scss']
})
export class RecipeListComponent implements OnInit {
  recipes: any[] = [];

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit() {
    this.http.get<any[]>('http://localhost:3000/api/recipes').subscribe(
      (response) => {
        this.recipes = response;
      },
      (error) => {
        console.log(error);
      }
    );
  }

  goToRecipeDetails(id: number): void {
    this.router.navigate(['/recipe/detail', id]);
  }
}