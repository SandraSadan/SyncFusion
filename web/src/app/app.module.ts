import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import {
  TreeGridModule, SortService, ResizeService,
  ContextMenuService, EditService, VirtualScrollService, 
  ColumnChooserService, ToolbarService, FilterService
} from '@syncfusion/ej2-angular-treegrid';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    TreeGridModule
  ],
  providers: [
    SortService,
    ContextMenuService,
    EditService,
    ResizeService,
    VirtualScrollService,
    ColumnChooserService,
    ToolbarService,
    FilterService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
