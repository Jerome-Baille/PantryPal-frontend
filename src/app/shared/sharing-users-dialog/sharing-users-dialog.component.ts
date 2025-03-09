import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { SharingUsersComponent } from '../sharing-users/sharing-users.component';

interface DialogData {
  recipeId: number;
  recipeTitle: string;
}

@Component({
  selector: 'app-sharing-users-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    TranslateModule,
    SharingUsersComponent
  ],
  template: `
    <h2 mat-dialog-title>{{ 'MANAGE_SHARING' | translate }}: {{ data.recipeTitle }}</h2>
    <mat-dialog-content>
      <app-sharing-users [recipeId]="data.recipeId"></app-sharing-users>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>{{ 'CLOSE' | translate }}</button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      min-height: 300px;
      max-height: 70vh;
    }
    
    h2 {
      margin: 0;
      padding: 16px;
      background-color: #f5f5f5;
      border-bottom: 1px solid #e0e0e0;
      font-size: 1.25rem;
      font-weight: 500;
    }
  `]
})
export class SharingUsersDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<SharingUsersDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}
}