import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { MatDialogModule } from '@angular/material/dialog';

import {
  TreeGridModule, SortService,
  ResizeService,
  ContextMenuService,
  EditService,
  VirtualScrollService,
  ColumnChooserService,
  ToolbarService,
  FilterService,
} from '@syncfusion/ej2-angular-treegrid';
import { ColumnSettingsDialogModule } from 'src/modules/dialogs/column-settings-dialog/column-settings-dialog.module';
import { NotificationService } from 'src/modules/services/notification.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';


@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    TreeGridModule,
    MatDialogModule,
    MatSnackBarModule,
    ColumnSettingsDialogModule
  ],
  bootstrap: [AppComponent],
  providers: [
    NotificationService,
    SortService,
    ResizeService,
    ContextMenuService,
    EditService,
    VirtualScrollService,
    ColumnChooserService,
    ToolbarService,
    FilterService,
  ]
})
export class AppModule { }
