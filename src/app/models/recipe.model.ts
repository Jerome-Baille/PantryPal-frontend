import { Book } from './book.model';
import { User } from './user.model';

export interface Recipe {
    id: number;
    title: string;
    instructions: string;
    typeOfMeal?: string;
    preparationTime?: number;
    preparationUnit?: string;
    cookingTime?: number;
    cookingUnit?: string;
    fridgeTime?: number;
    fridgeUnit?: string;
    waitingTime?: number;
    waitingUnit?: string;
    notes?: string;
    picture?: string;
    thumbnail?: string;
    userId: number;
    bookId?: number;
    Book?: Book;
    User?: User;
}