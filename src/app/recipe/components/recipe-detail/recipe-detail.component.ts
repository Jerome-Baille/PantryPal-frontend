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
    recipeTime: any[] = [];
    dataSource: any;
    displayedColumns!: string[];
    names: string[] = [];
    timeUnits: string[] = [];

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
                this.recipeTime = [
                    { name: 'Preparation', time: this.recipe.preparationTime, unit: this.recipe.preparationUnit },
                    { name: 'Cooking', time: this.recipe.cookingTime, unit: this.recipe.cookingUnit },
                    { name: 'Fridge', time: this.recipe.fridgeTime, unit: this.recipe.fridgeUnit },
                    { name: 'Waiting', time: this.recipe.waitingTime, unit: this.recipe.waitingUnit }
                ].filter(row => row.time != null);

                // Create separate arrays for names and time units
                this.names = this.recipeTime.map(row => row.name);
                this.timeUnits = this.recipeTime.map(row => `${row.time} ${row.unit}`);
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

    get isolatedInstructions(): string[] {
        if (!this.recipe?.instructions) {
            return [];
        }

        const instructionsRegex = /^\s*(\d+\.\s*.+?)$/gm;
        const instructions = this.recipe.instructions.match(instructionsRegex) || [];

        return instructions.map((instruction: string) => instruction.replace(/^\s*\n/, ''));
    }
}