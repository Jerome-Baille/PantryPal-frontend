import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RecipeService } from '../../../services/recipe.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { faTrash, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { convertToSeconds } from 'src/app/utils/time-utils';

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

    activeTimerId: string | null = null;
    timerStates: { [key: string]: { running: boolean; timeInSeconds: number } } = {};

    faTrash = faTrash;
    faArrowLeft = faArrowLeft;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private recipeService: RecipeService,
        private dialog: MatDialog
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
                    { name: 'Preparation', time: this.recipe.preparationTime, unit: this.recipe.preparationUnit, showTimer: false },
                    { name: 'Cooking', time: this.recipe.cookingTime, unit: this.recipe.cookingUnit, showTimer: false },
                    { name: 'Fridge', time: this.recipe.fridgeTime, unit: this.recipe.fridgeUnit, showTimer: false },
                    { name: 'Waiting', time: this.recipe.waitingTime, unit: this.recipe.waitingUnit, showTimer: false }
                ].filter(row => row.time != null && row.time !== 0 && row.unit != null && row.unit !== '');

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
        // Open the confirmation dialog
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '300px',
            data: {
                title: 'Delete Recipe',
                message: 'Are you sure you want to delete this recipe?'
            }
        });

        // After the dialog is closed, check the result
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                // User confirmed, proceed with recipe deletion
                const id = parseInt(this.route.snapshot.paramMap.get('id') || '0', 10);

                this.recipeService.deleteRecipe(id).subscribe({
                    next: () => {
                        this.router.navigate(['/recipe/list']);
                    },
                    error: (error) => {
                        console.error(error);
                    }
                });
            } else {
                // User cancelled the deletion
                // Add any additional logic or show a message if needed
            }
        });
    }

    get isolatedInstructions(): string[] {
        if (!this.recipe?.instructions) {
            return [];
        }

        const instructionsRegex = /^\s*(\d+\.\s*.+?)$/gm;
        const instructions = this.recipe.instructions.match(instructionsRegex) || [];

        return instructions.map((instruction: string) => instruction.replace(/^\s*\n/, ''));
    }

    getHours(time: number): number {
        return Math.floor(time);
    }

    getMinutes(time: number): number {
        return Math.round(Math.round((time % 1) * 100));
    }

    // Method to create a timer state for an element
    createTimerState(element: any): any {
        return {
            id: `${this.recipe.id}-${element.name}`,
            recipe: this.recipe.title,
            name: element.name,
            timeInSeconds: convertToSeconds(element.time, element.unit),
        };
    }

    public getTimerId(element: any): string {
        return `${this.recipe.id}-${element.name}`;
    }

    toggleTimer(element: any): void {
        element.showTimer = !element.showTimer;
    }
}