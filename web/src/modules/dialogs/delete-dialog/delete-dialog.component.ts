import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DataService } from 'src/modules/services/data.service';
import { NotificationService } from 'src/modules/services/notification.service';
import { ColumnData } from 'src/modules/utils/interfaces';

@Component({
  selector: 'app-delete-dialog',
  templateUrl: './delete-dialog.component.html',
  styleUrls: ['./delete-dialog.component.scss']
})
export class DeleteDialogComponent implements OnInit {
  isLoading: boolean = false;
  column!: ColumnData;

  constructor(
    public dialogRef: MatDialogRef<DeleteDialogComponent>,
    private dataService: DataService,
    private notification: NotificationService
  ) { }

  ngOnInit(): void {
  }

  deleteColumn(): void {
    this.isLoading = true;
    this.dataService.deleteColumn(this.column).subscribe({
      next: () => {
        this.notification.openSuccessSnackBar('Column deleted successfully');
        this.dialogRef.close();
      }
    })
  }

}
