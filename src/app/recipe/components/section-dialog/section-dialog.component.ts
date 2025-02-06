import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';
import { ItemService } from 'src/app/services/item.service';

export interface SectionDialogData {
  recipeId: number;
  nextDisplayOrder: number;
}

@Component({
  selector: 'app-section-dialog',
  templateUrl: './section-dialog.component.html',
  styleUrls: ['./section-dialog.component.scss']
})
export class SectionDialogComponent {
  isLoading = false;
  errorMessage = '';

  constructor(
    private dialogRef: MatDialogRef<SectionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SectionDialogData,
    private itemService: ItemService,
    private fb: FormBuilder
  ) { }
  
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
