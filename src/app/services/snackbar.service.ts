import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {
  private snackBar = inject(MatSnackBar);


  showSuccess(message: string): void {
    this.show(message, ['snackbar-success']);
  }

  showError(message: string): void {
    this.show(message, ['snackbar-error']);
  }

  showInfo(message: string): void {
    this.show(message, ['snackbar-info']);
  }

  private show(message: string, panelClass: string[] = []): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      verticalPosition: 'top',
      horizontalPosition: 'center',
      panelClass: [...panelClass, 'snackbar-global'],
    });
  }
}
