import { Component, Inject, OnInit, HostListener } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TranslateModule } from '@ngx-translate/core';

export interface GuidedModeData {
  instructions: string[];
  recipeTitle: string;
  completedSteps: Set<number>;
}

@Component({
  selector: 'app-recipe-guided-mode',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    TranslateModule
  ],
  templateUrl: './recipe-guided-mode.component.html',
  styleUrls: ['./recipe-guided-mode.component.scss']
})
export class RecipeGuidedModeComponent implements OnInit {
  currentStepIndex = 0;
  instructions: string[] = [];
  recipeTitle = '';
  completedSteps: Set<number>;
  touchStartX = 0;
  touchEndX = 0;

  constructor(
    public dialogRef: MatDialogRef<RecipeGuidedModeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: GuidedModeData
  ) {
    this.instructions = data.instructions;
    this.recipeTitle = data.recipeTitle;
    this.completedSteps = new Set(data.completedSteps);
  }

  ngOnInit(): void {
    // Find the first incomplete step or start at the beginning
    const firstIncomplete = this.instructions.findIndex((_, index) => !this.completedSteps.has(index));
    this.currentStepIndex = firstIncomplete !== -1 ? firstIncomplete : 0;
  }

  get currentInstruction(): string {
    return this.instructions[this.currentStepIndex] || '';
  }

  get progress(): number {
    return ((this.currentStepIndex + 1) / this.instructions.length) * 100;
  }

  get stepNumber(): string {
    return `${this.currentStepIndex + 1}/${this.instructions.length}`;
  }

  get isFirstStep(): boolean {
    return this.currentStepIndex === 0;
  }

  get isLastStep(): boolean {
    return this.currentStepIndex === this.instructions.length - 1;
  }

  get isCurrentStepCompleted(): boolean {
    return this.completedSteps.has(this.currentStepIndex);
  }

  nextStep(): void {
    if (!this.isLastStep) {
      // Mark current step as completed before moving to next
      this.completedSteps.add(this.currentStepIndex);
      this.currentStepIndex++;
    }
  }

  previousStep(): void {
    if (!this.isFirstStep) {
      this.currentStepIndex--;
    }
  }

  toggleStepCompletion(): void {
    if (this.completedSteps.has(this.currentStepIndex)) {
      this.completedSteps.delete(this.currentStepIndex);
    } else {
      this.completedSteps.add(this.currentStepIndex);
    }
  }

  close(): void {
    // Mark the current step as completed before closing
    this.completedSteps.add(this.currentStepIndex);
    
    this.dialogRef.close({
      completedSteps: this.completedSteps,
      lastViewedStep: this.currentStepIndex
    });
  }

  // Touch events for swipe gestures
  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.changedTouches[0].screenX;
  }

  onTouchEnd(event: TouchEvent): void {
    this.touchEndX = event.changedTouches[0].screenX;
    this.handleSwipe();
  }

  private handleSwipe(): void {
    const swipeThreshold = 50;
    const diff = this.touchStartX - this.touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swipe left - next step
        this.nextStep();
      } else {
        // Swipe right - previous step
        this.previousStep();
      }
    }
  }

  // Keyboard navigation
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        this.previousStep();
        break;
      case 'ArrowRight':
      case ' ':
      case 'Enter':
        event.preventDefault();
        if (event.key === ' ' || event.key === 'Enter') {
          this.toggleStepCompletion();
        } else {
          this.nextStep();
        }
        break;
      case 'Escape':
        event.preventDefault();
        this.close();
        break;
    }
  }
}
