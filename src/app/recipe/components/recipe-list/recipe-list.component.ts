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
    currentPage: number = 1;
    itemsPerPage: number = 12;

    constructor(
        private router: Router,
        private recipeService: RecipeService
    ) { }

    ngOnInit() {
        this.loadRecipes();
    }

    loadRecipes() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        
        this.recipeService.getRecipes().subscribe({
            next: (response) => {
                this.recipes = response.slice(startIndex, endIndex);
            },
            error: (error) => {
                console.error(error);
                this.recipes = [];
            }
        });
    }

    goToRecipeDetails(id: number): void {
        this.router.navigate(['/recipe/detail', id]);
    }

    onPageChange(page: number): void {
        this.currentPage = page;
        this.loadRecipes();
    }
}
