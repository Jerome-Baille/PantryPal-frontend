import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
}