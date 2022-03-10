import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { TreeGridModule, SortService, ResizeService,
  ContextMenuService, EditService, VirtualScrollService } from '@syncfusion/ej2-angular-treegrid';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    TreeGridModule
  ],
  providers: [
    SortService, 
    ContextMenuService, 
    EditService, 
    ResizeService, 
    VirtualScrollService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
