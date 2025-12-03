import { Book } from './book.model';
import { User } from './user.model';
import { Timer } from './timer.model';
import { RecipeIngredient } from './recipe-ingredient.model';

export interface Recipe {
    id: number;
    title: string;
    instructions: string;
    typeOfMeal?: string;
    notes?: string;
    picture?: string;
    thumbnail?: string;
    userId: number;
    bookId?: number;
    Book?: Book;
    User?: User;
    timers?: Timer[];
    servings?: number;
    RecipeIngredients?: RecipeIngredient[];
    isFavorited?: boolean;
}