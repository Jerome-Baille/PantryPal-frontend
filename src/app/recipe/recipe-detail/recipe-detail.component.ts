import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { faTrash, faArrowLeft, faHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
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
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../services/language.service';
import { MatSelectModule } from '@angular/material/select';
import { FavoriteService } from 'src/app/services/favorite.service';

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
        TimerComponent,
        TranslateModule,
        MatSelectModule,
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

    faTrash = faTrash;
    faArrowLeft = faArrowLeft;
    faHeart = faHeart;
    faHeartRegular = faHeartRegular;
    isFavorite = false;

    private languageSubscription?: Subscription;
    currentLang: string;

    servingsMultiplier = 1;
    availableServings = [0.5, 1, 2, 3, 4];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private recipeService: RecipeService,
        private favoriteService: FavoriteService,
        private dialog: MatDialog,
        private languageService: LanguageService
    ) { 
        this.currentLang = languageService.getCurrentLanguage();
    }

    ngOnInit(): void {
        // Get the recipe ID from the route parameters
        const id = parseInt(this.route.snapshot.paramMap.get('id') || '0', 10);

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
                // Removed timeUnits mapping as it's not used anymore
            },
            error: (error) => {
                console.error(error);
                this.recipe = {};
                this.error = error;
            }
        });

        this.languageSubscription = this.languageService.currentLanguage$.subscribe(
            lang => this.currentLang = lang
        );
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
        const groups: { [key: string]: any[] } = {};
        this.recipe.RecipeIngredients.forEach((item: any) => {
            const key = item.section ? item.section.name : '';
            groups[key] = groups[key] || [];
            // Create a new object to avoid modifying the original data
            groups[key].push({
                ...item,
                adjustedQuantity: this.calculateAdjustedQuantity(item.quantity)
            });
        });

        // Sort ingredients by displayOrder within each section
        Object.keys(groups).forEach(key => {
            groups[key].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
        });

        return Object.keys(groups).map(key => ({ 
            section: key, 
            ingredients: groups[key]
        }));
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
}