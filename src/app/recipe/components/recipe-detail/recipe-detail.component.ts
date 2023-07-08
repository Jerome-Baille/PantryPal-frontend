import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RecipeService } from '../../../services/recipe.service';

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
    private recipeService: RecipeService
  ) { }

  ngOnInit(): void {
    // Get the recipe ID from the route parameters
    const id = parseInt(this.route.snapshot.paramMap.get('id') || '0', 10);

    // Make the API call with the recipe ID
    this.recipeService.getRecipe(id).subscribe({
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
    // Get the recipe ID from the route parameters
    const id = parseInt(this.route.snapshot.paramMap.get('id') || '0', 10);

    // Make the API call with the recipe ID
    this.recipeService.deleteRecipe(id).subscribe({
      next: () => {
        this.router.navigate(['/recipe/list']);
      },
      error: (error) => {
        console.error(error);
      }
    })
  }
}