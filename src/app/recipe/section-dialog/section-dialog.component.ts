import { Component, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ItemService } from 'src/app/services/item.service';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

export interface SectionDialogData {
  recipeId: number;
  nextDisplayOrder: number;
}

@Component({
  selector: 'app-section-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatProgressSpinnerModule
],
  templateUrl: './section-dialog.component.html',
  styleUrls: ['./section-dialog.component.scss']
})
export class SectionDialogComponent {
  private dialogRef = inject<MatDialogRef<SectionDialogComponent>>(MatDialogRef);
  data = inject<SectionDialogData>(MAT_DIALOG_DATA);
  private itemService = inject(ItemService);
  private fb = inject(FormBuilder);

  isLoading = false;
  errorMessage = '';

  sectionForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(1)]],
    displayOrder: [this.data.nextDisplayOrder, [Validators.required, Validators.min(1)]]
  });

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.sectionForm.invalid || this.isLoading) return;

    this.isLoading = true;
    this.errorMessage = '';

    const formValues = this.sectionForm.getRawValue();
    const newSection = {
      name: formValues.name ?? '',
      recipeId: this.data.recipeId,
      displayOrder: formValues.displayOrder ?? this.data.nextDisplayOrder
    };

    this.itemService.createRecipeSection(newSection).subscribe({
      next: (createdSection) => {
        this.isLoading = false;
        this.dialogRef.close(createdSection);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to create section. Please try again.';
        console.error('Error creating section:', error);
      }
    });
  }
}
