export interface Recipe {
  id: number;
  title: string;
  instructions: string;
  typeOfMeal?: string;
  notes?: string;
  picture?: string;
  thumbnail?: string;
  userId: number;
  servings?: number;
}

export interface Favorite {
  id: number;
  recipeId: number;
  userId: number;
}
