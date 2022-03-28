import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { camelCase, snakeCase } from 'lodash';
import { DataService } from 'src/modules/services/data.service';
import { NotificationService } from 'src/modules/services/notification.service';
import { ColumnData } from 'src/modules/utils/interfaces';

@Component({
  selector: 'app-column-settings-dialog',
  templateUrl: './column-settings-dialog.component.html',
  styleUrls: ['./column-settings-dialog.component.scss']
})
export class ColumnSettingsDialogComponent implements OnInit {
  columnDetails: ColumnData = {} as ColumnData;
  fieldValue!: string;
  actionPerformed!: string;
  isLoading: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<ColumnSettingsDialogComponent>,
    private dataService: DataService,
    private notification: NotificationService
  ) { }

  ngOnInit(): void {
  }

  addValue(): void {
    (this.columnDetails.dropdownValues?.length) ?
      this.columnDetails.dropdownValues?.push(this.fieldValue) :
      this.columnDetails.dropdownValues = [this.fieldValue];
    this.fieldValue = '';
  }

  removeValue(index: number): void {
    this.columnDetails.dropdownValues?.splice(index, 1);
  }

  changeTextWrap(): void {
    this.columnDetails.textWrap = !this.columnDetails.textWrap;
  }

  saveColumnDetails(): void {
    this.isLoading = true;
    if (this.actionPerformed === 'add') {
      this.columnDetails.isPrimaryKey = false;
      this.columnDetails.fieldName = camelCase(this.columnDetails.name);
      this.dataService.addColumn(this.columnDetails).subscribe({
        next: () => {
          this.notification.openSuccessSnackBar('Column added successfully');
          this.dialogRef.close();
        }
      });
    } else {
      this.dataService.editColumn(this.columnDetails).subscribe({
        next: () => {
          this.notification.openSuccessSnackBar('Column saved successfully');
          this.dialogRef.close();
        }
      });
    }
  }

}
