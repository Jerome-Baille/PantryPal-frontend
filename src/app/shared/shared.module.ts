import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card'; 
import { MatSelectModule } from '@angular/material/select';
import { LoaderComponent } from './components/loader/loader.component';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {MatRadioModule} from '@angular/material/radio';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatTableModule} from '@angular/material/table';
import {MatListModule} from '@angular/material/list';
import {MatDividerModule} from '@angular/material/divider';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ShareOptionsComponent } from './components/share-options/share-options.component';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatSidenavModule} from '@angular/material/sidenav';
import { AddToShoppingListComponent } from './components/add-to-shopping-list/add-to-shopping-list.component';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import {MatMenuModule} from '@angular/material/menu';
import {MatChipsModule} from '@angular/material/chips';
import {MatExpansionModule} from '@angular/material/expansion';
import { TimerComponent } from './components/timer/timer.component';


@NgModule({
  declarations: [
    LoaderComponent,
    ShareOptionsComponent,
    AddToShoppingListComponent,
    ConfirmationDialogComponent,
    TimerComponent
  ],
  imports: [
    CommonModule,
    MatToolbarModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatRadioModule,
    MatGridListModule,
    MatTableModule,
    MatListModule,
    MatDividerModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    MatSidenavModule,
    FontAwesomeModule,
    MatDialogModule,
    MatMenuModule,
    MatChipsModule,
    MatExpansionModule
  ],
  exports: [
    MatToolbarModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    LoaderComponent,
    MatSnackBarModule,
    MatRadioModule,
    MatGridListModule,
    MatTableModule,
    MatListModule,
    MatDividerModule,
    FontAwesomeModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    MatSidenavModule,
    ShareOptionsComponent,
    AddToShoppingListComponent,
    MatDialogModule,
    MatMenuModule,
    MatChipsModule,
    MatExpansionModule,
    TimerComponent
  ]
})
export class SharedModule { }