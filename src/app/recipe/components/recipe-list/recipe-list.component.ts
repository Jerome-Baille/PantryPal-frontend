import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RecipeService } from '../../../services/recipe.service';

@Component({
    selector: 'app-recipe-list',
    templateUrl: './recipe-list.component.html',
    styleUrls: ['./recipe-list.component.scss']
})
export class RecipeListComponent implements OnInit {
    recipes: any[] = [];

    constructor(
        private router: Router,
        private recipeService: RecipeService
    ) { }

    ngOnInit() {
        this.recipeService.getRecipes().subscribe({
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