import { Ingredient } from './ingredient.model';
import { RecipeSection } from './recipe-section.model';

export interface RecipeIngredient {
  recipeId: number;
  ingredientId: number;
  quantity: number;
  unit: string;
  recipeSectionId?: number | null;
  // Nested objects for additional details
  Ingredient?: Ingredient;
  section?: RecipeSection;
  displayOrder?: number;
}
