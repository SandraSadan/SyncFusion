import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColumnSettingsDialogComponent } from './column-settings-dialog.component';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatSelectModule } from '@angular/material/select'
import { MatChipsModule } from '@angular/material/chips';


@NgModule({
  declarations: [
    ColumnSettingsDialogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule
  ],
  providers: [
    ColumnSettingsDialogComponent
  ]
})
export class ColumnSettingsDialogModule { }
