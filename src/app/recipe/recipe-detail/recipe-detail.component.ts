import { Component, OnInit, OnDestroy, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { AddToShoppingListComponent } from 'src/app/shared/add-to-shopping-list/add-to-shopping-list.component';
import { ShareOptionsComponent } from 'src/app/shared/share-options/share-options.component';
import { TimerComponent } from 'src/app/shared/timer/timer.component';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { RecipeService } from 'src/app/services/recipe.service';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../services/language.service';
import { TranslateService } from '@ngx-translate/core';
import { MatSelectModule } from '@angular/material/select';
import { FavoriteService } from 'src/app/services/favorite.service';
import { RecipeGuidedModeComponent } from './recipe-guided-mode/recipe-guided-mode.component';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'app-recipe-detail',
    standalone: true,
    imports: [
        CommonModule, 
        RouterLink, 
        MatCardModule, 
        AddToShoppingListComponent, 
        MatButtonModule,
        MatIconModule, 
        MatDividerModule, 
        ShareOptionsComponent, 
        TimerComponent,
        TranslateModule,
        MatSelectModule,
        MatTooltipModule,
    ],
    templateUrl: './recipe-detail.component.html',
    styleUrls: ['./recipe-detail.component.scss']
})
export class RecipeDetailComponent implements OnInit, OnDestroy {
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

    isFavorite = false;

    private languageSubscription?: Subscription;
    currentLang: string;

    servingsMultiplier = 1;
    availableServings = [0.5, 1, 2, 3, 4];

    // Step tracking for checklist and guided mode
    completedSteps: Set<number> = new Set();
    private storageKey = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private recipeService: RecipeService,
        private favoriteService: FavoriteService,
        private dialog: MatDialog,
            private languageService: LanguageService,
            private translateService: TranslateService,
        private viewContainerRef: ViewContainerRef
    ) { 
        this.currentLang = languageService.getCurrentLanguage();
    }

    ngOnInit(): void {
        // Subscribe to route parameter changes to handle navigation between recipe details
        this.route.paramMap.subscribe(params => {
            const id = parseInt(params.get('id') || '0', 10);
            this.loadRecipe(id);
        });

        this.languageSubscription = this.languageService.currentLanguage$.subscribe(
            lang => this.currentLang = lang
        );
    }

    private loadRecipe(id: number): void {
        // Make the API call with the recipe ID
        this.recipeService.getRecipe(id).subscribe({
            next: (response) => {
                this.recipe = response;
                this.isFavorite = response.isFavorited;
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
                // Reset servings multiplier when loading a new recipe
                this.servingsMultiplier = 1;
                // Load completed steps from localStorage
                this.storageKey = `recipe-${id}-completed-steps`;
                this.loadCompletedSteps();
                // Removed timeUnits mapping as it's not used anymore
            },
            error: (error) => {
                console.error(error);
                this.recipe = {};
                this.error = error;
            }
        });
    }

    ngOnDestroy(): void {
        if (this.languageSubscription) {
            this.languageSubscription.unsubscribe();
        }
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

    translateUnit(unit: string): string {
        const translations: { [key: string]: string } = {
            'tablespoon': 'UNIT_TABLESPOON',
            'teaspoon': 'UNIT_TEASPOON',
            'leaves': 'UNIT_LEAVES',
            'leaf': 'UNIT_LEAF',
            'pinch': 'UNIT_PINCH',
            'pinches': 'UNIT_PINCHES'
        };
        
        const normalizedUnit = unit.toLowerCase();
        return translations[normalizedUnit] ? translations[normalizedUnit] : unit;
    }

    deleteRecipe(): void {
        // Open the confirmation dialog with translated strings
        const title = this.translateService.instant('CONFIRM_DELETE_RECIPE_TITLE');
        const message = this.translateService.instant('CONFIRM_DELETE_RECIPE_MESSAGE');

        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '300px',
            data: {
                title,
                message
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

    getTranslatedTimerName(timerName: string): string {
        const name = timerName.toLowerCase();
        switch (name) {
            case 'cooking':
                return 'TIMER_COOKING';
            case 'waiting':
                return 'TIMER_WAITING';
            case 'fridge':
                return 'TIMER_FRIDGE';
            default:
                return timerName;
        }
    }

    // Add a getter to group ingredients by section
    get groupedIngredients(): { section: string, ingredients: any[] }[] {
        if (!this.recipe?.RecipeIngredients) return [];
        const groups: { [key: string]: any } = {};
        this.recipe.RecipeIngredients.forEach((item: any) => {
            const key = item.section ? item.section.name : '';
            if (!groups[key]) {
                groups[key] = {
                    sectionDisplayOrder: item.section?.displayOrder || 0,
                    ingredients: []
                };
            }
            // Create a new object to avoid modifying the original data
            groups[key].ingredients.push({
                ...item,
                adjustedQuantity: this.calculateAdjustedQuantity(item.quantity)
            });
        });

        // Sort ingredients by displayOrder within each section
        Object.keys(groups).forEach(key => {
            groups[key].ingredients.sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0));
        });

        // Convert to array and sort sections by their displayOrder
        return Object.keys(groups)
            .map(key => ({ 
                section: key, 
                ingredients: groups[key].ingredients,
                sectionDisplayOrder: groups[key].sectionDisplayOrder
            }))
            .sort((a, b) => a.sectionDisplayOrder - b.sectionDisplayOrder);
    }

    calculateAdjustedQuantity(quantity: number): number {
        return (quantity * this.servingsMultiplier);
    }

    onServingsChange(multiplier: number): void {
        this.servingsMultiplier = multiplier;
    }

    toggleFavorite(): void {
        if (this.isFavorite) {
            this.favoriteService.deleteFavorite(this.recipe.id).subscribe({
                next: () => {
                    this.isFavorite = false;
                },
                error: (error) => console.error('Error removing favorite:', error)
            });
        } else {
            this.favoriteService.createFavorite({ recipeId: this.recipe.id }).subscribe({
                next: () => {
                    this.isFavorite = true;
                },
                error: (error) => console.error('Error adding favorite:', error)
            });
        }
    }

    // Step completion methods for checklist mode
    toggleStepCompletion(index: number): void {
        if (this.completedSteps.has(index)) {
            this.completedSteps.delete(index);
        } else {
            this.completedSteps.add(index);
        }
        this.saveCompletedSteps();
    }

    isStepCompleted(index: number): boolean {
        return this.completedSteps.has(index);
    }

    get completedStepsCount(): number {
        return this.completedSteps.size;
    }

    get totalSteps(): number {
        return this.isolatedInstructions.length;
    }

    private loadCompletedSteps(): void {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const steps = JSON.parse(stored);
                this.completedSteps = new Set(steps);
            } else {
                this.completedSteps = new Set();
            }
        } catch (error) {
            console.error('Error loading completed steps:', error);
            this.completedSteps = new Set();
        }
    }

    private saveCompletedSteps(): void {
        try {
            const steps = Array.from(this.completedSteps);
            localStorage.setItem(this.storageKey, JSON.stringify(steps));
        } catch (error) {
            console.error('Error saving completed steps:', error);
        }
    }

    clearCompletedSteps(): void {
        this.completedSteps.clear();
        this.saveCompletedSteps();
    }

    // Guided mode
    openGuidedMode(): void {
        const dialogRef = this.dialog.open(RecipeGuidedModeComponent, {
            width: '100%',
            height: '100%',
            maxWidth: '100vw',
            maxHeight: '100vh',
            panelClass: 'fullscreen-dialog',
            hasBackdrop: false,
            position: { top: '0', left: '0' },
            viewContainerRef: this.viewContainerRef,
            data: {
                instructions: this.isolatedInstructions,
                recipeTitle: this.recipe.title,
                completedSteps: new Set(this.completedSteps)
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result && result.completedSteps) {
                this.completedSteps = result.completedSteps;
                this.saveCompletedSteps();
            }
        });
    }
}