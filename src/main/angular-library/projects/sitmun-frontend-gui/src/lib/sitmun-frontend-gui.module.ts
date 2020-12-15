import { NgModule } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {HttpClientModule, HttpClient, HTTP_INTERCEPTORS} from '@angular/common/http';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';

//import * as ol from 'openlayers';
import {TranslateModule, TranslateLoader,TranslateService} from '@ngx-translate/core';


import { AngularHalModule } from '@sitmun/frontend-core';


import { ReactiveFormsModule } from '@angular/forms';

import {SitmunFrontendCoreModule} from '@sitmun/frontend-core';
import { DataGridComponent } from './data-grid/data-grid.component';
import { AgGridModule } from '@ag-grid-community/angular';
import { MatButtonModule } from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import { BtnEditRenderedComponent } from './btn-edit-rendered/btn-edit-rendered.component';




/** SITMUN plugin core module */
@NgModule({
  imports: [
    RouterModule,
    HttpClientModule,
    CommonModule,
    FormsModule,
    NoopAnimationsModule,
    AngularHalModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    AgGridModule.withComponents([]),
    SitmunFrontendCoreModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule
 
  ],
  declarations: [
    DataGridComponent,
    BtnEditRenderedComponent,
  ],
  entryComponents: [
  ],
  providers: [
  ],
  exports: [
    HttpClientModule,
    CommonModule,
    FormsModule,
    NoopAnimationsModule,
    AngularHalModule,
    TranslateModule,
    ReactiveFormsModule,
    DataGridComponent,
    SitmunFrontendCoreModule
  ]
})
export class SitmunFrontendGuiModule {
}
