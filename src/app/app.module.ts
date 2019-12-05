import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { CollectionListComponent } from './components/collection-list/collection-list.component';
import { RouteListComponent } from './components/route-list/route-list.component';

import { NgZorroAntdModule, NZ_I18N, en_US } from 'ng-zorro-antd';
import { NzIconModule, NZ_ICONS } from 'ng-zorro-antd/icon';
import { IconDefinition } from '@ant-design/icons-angular';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import {
  PlusOutline,
  PlayCircleFill,
  DeleteOutline,
  DeleteFill,
  SettingOutline
} from '@ant-design/icons-angular/icons';
const icons: IconDefinition[] = [
  PlusOutline,
  PlayCircleFill,
  DeleteOutline,
  DeleteFill,
  SettingOutline
];

/** 配置 angular i18n **/
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { CollectionActionHeaderComponent } from './components/collection-action-header/collection-action-header.component';
import { CollectionService } from './service/collection.service';
import { RouteService } from './service/route.service';
import { StoreService } from './service/store.service';
import { ServerService } from './service/server.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouteComponent } from './components/route/route.component';
import { ResponseService } from './service/response.service';
import { ResponseBodyComponent } from './components/response-body/response-body.component';
import { CreateCollectionComponent } from './components/create-collection/create-collection.component';
import { CreateRouteComponent } from './components/create-route/create-route.component';
import { PrefixInterceptor } from './core/http-interceptors/prefix.interceptor';
import { ErrorInterceptor } from './core/http-interceptors/error-interceptor';
import { CreateResponseComponent } from './components/create-response/create-response.component';
import { CollectionSettingsComponent } from './components/collection-settings/collection-settings.component';
import { IndexedDBService } from './service/indexedDB.service';
import { StatusbarComponent } from './components/statusbar/statusbar.component';
import { StatusbarService } from './service/statusbar.service';
import { ResponseTypesComponent } from './components/response-types/response-types.component';
import { RequestCodeComponent } from './components/request-code/request-code.component';

registerLocaleData(en);

@NgModule({
  declarations: [
    AppComponent,
    CollectionListComponent,
    RouteListComponent,
    CollectionActionHeaderComponent,
    RouteComponent,
    ResponseBodyComponent,
    CreateCollectionComponent,
    CreateRouteComponent,
    CreateResponseComponent,
    CollectionSettingsComponent,
    StatusbarComponent,
    ResponseTypesComponent,
    RequestCodeComponent
  ],
  imports: [
    BrowserModule,
    NgZorroAntdModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NzIconModule,
    BrowserAnimationsModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: PrefixInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: NZ_I18N, useValue: en_US },
    { provide: NZ_ICONS, useValue: icons },
    ServerService,
    StoreService,
    CollectionService,
    ResponseService,
    RouteService,
    IndexedDBService,
    StatusbarService
  ],
  entryComponents: [
    CreateCollectionComponent,
    CreateRouteComponent,
    CreateResponseComponent,
    CollectionSettingsComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
