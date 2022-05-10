import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { Service, FileSystemItem } from './app.service';
import {
  DxTreeViewModule,
  DxTreeViewComponent,
  DxSortableModule,
  DxDataGridModule,
  DxButtonModule,
  DxPopupModule,
  DxValidationGroupModule,
  DxTextBoxModule,
  DxFileUploaderModule,
  DxActionSheetModule,
  DxContextMenuModule,
} from 'devextreme-angular';
@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    DxButtonModule,
    DxTreeViewModule,
    DxDataGridModule,
    DxPopupModule,
    DxValidationGroupModule,
    DxTextBoxModule,
    DxFileUploaderModule,
    DxActionSheetModule,
    DxContextMenuModule,

    DxSortableModule,
  ],

  providers: [Service],
  bootstrap: [AppComponent],
})
export class AppModule {}
