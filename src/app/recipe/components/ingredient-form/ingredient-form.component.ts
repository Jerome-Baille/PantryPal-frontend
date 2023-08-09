import { Component, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { quantityValidator } from 'src/app/helpers/quantity-validator.helper';

@Component({
  selector: 'app-ingredient-form',
  templateUrl: './ingredient-form.component.html',
  styleUrls: ['./ingredient-form.component.scss']
})
export class IngredientFormComponent {
  @Input() recipeForm!: FormGroup;
  ingredients!: FormArray;


  constructor(
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this.ingredients = this.recipeForm.get('ingredients') as FormArray;
  }

  addIngredient() {
    const ingredientForm = this.formBuilder.group({
      name: ['', Validators.required],
      quantity: ['', quantityValidator()],
      unit: ['']
    });
    this.ingredients.push(ingredientForm);
  }

  onRemoveIngredient(index: number) {
    this.ingredients.removeAt(index);
  }

  addSaltAndPepper() {
    this.ingredients.push(
      this.formBuilder.group({
        name: ['Sel'],
        quantity: [1],
        unit: ['Unit']
      })
    );
    this.ingredients.push(
      this.formBuilder.group({
        name: ['Poivre'],
        quantity: [1],
        unit: ['Unit']
      })
    );
  }
}