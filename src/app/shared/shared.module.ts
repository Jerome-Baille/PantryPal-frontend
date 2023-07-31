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

@NgModule({
  declarations: [
    LoaderComponent,
    ShareOptionsComponent
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
    FontAwesomeModule
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
    ShareOptionsComponent
  ]
})
export class SharedModule { }