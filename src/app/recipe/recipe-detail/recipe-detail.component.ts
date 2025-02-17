import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { faTrash, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { AddToShoppingListComponent } from 'src/app/shared/add-to-shopping-list/add-to-shopping-list.component';
import { ShareOptionsComponent } from 'src/app/shared/share-options/share-options.component';
import { TimerComponent } from 'src/app/shared/timer/timer.component';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RecipeService } from 'src/app/services/recipe.service';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-recipe-detail',
    standalone: true,
    imports: [
        CommonModule, 
        RouterLink, 
        FontAwesomeModule, 
        MatCardModule, 
        AddToShoppingListComponent, 
        MatButtonModule,
        MatIconModule, 
        MatDividerModule, 
        ShareOptionsComponent, 
        TimerComponent
    ],
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
                // Map timers without duplicating display logic
                this.recipeTime = (this.recipe.timers || []).map((timer: any) => {
                    const timeInSeconds = timer.timeInSeconds || timer.time_in_seconds;
                    return {
                        name: timer.name,
                        time: timeInSeconds,
                        showTimer: false
                    };
                });
                this.names = this.recipeTime.map(row => row.name);
                // Removed timeUnits mapping as it's not used anymore
            },
            error: (error) => {
                console.error(error);
                this.recipe = {};
                this.error = error;
            }
        })
    }

    // New method to format time
    formatTime(seconds: number): string {
        if (seconds >= 3600) {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.round((seconds % 3600) / 60);
            return `${hours} h ${minutes} min`;
        } else {
            return `${Math.round(seconds / 60)} min`;
        }
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

    // Method to create a timer state for an element
    createTimerState(element: any): any {
        return {
            name: element.name,
            timeInSeconds: element.time,
            recipe: this.recipe.title
        };
    }

    public getTimerId(element: any): string {
        return `${this.recipe.id}-${element.name}`;
    }

    toggleTimer(element: any): void {
        element.showTimer = !element.showTimer;
    }

    // Add a getter to group ingredients by section
    get groupedIngredients(): { section: string, ingredients: any[] }[] {
        if (!this.recipe?.RecipeIngredients) return [];
        const groups: { [key: string]: any[] } = {};
        this.recipe.RecipeIngredients.forEach((item: any) => {
            const key = item.section ? item.section.name : '';
            groups[key] = groups[key] || [];
            groups[key].push(item);
        });
        return Object.keys(groups).map(key => ({ section: key, ingredients: groups[key] }));
    }
}