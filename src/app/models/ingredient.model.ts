import { Recipe } from './recipe.model';

export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
  userId: number;
  recipeId?: number;
  Recipe?: Recipe;
}