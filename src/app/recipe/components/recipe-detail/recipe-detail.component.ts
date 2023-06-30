import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-recipe-detail',
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.scss']
})
export class RecipeDetailComponent {
  recipe: any;
  id: number = 0;

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.http.get<any>(`http://localhost:3000/api/recipes/${id}`).subscribe(
      (response) => {
        this.recipe = response;
      },
      (error) => {
        console.log(error);
      }
    );
  }

  deleteRecipe(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.http.delete(`http://localhost:3000/api/recipes/${id}`).subscribe(
      (response) => {
        console.log('Recipe deleted successfully');
        this.router.navigate(['/recipe/list']);
      },
      (error) => {
        console.log(error);
      }
    );
  }
}