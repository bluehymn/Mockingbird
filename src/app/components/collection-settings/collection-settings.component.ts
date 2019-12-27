import { Component, OnInit, Input } from '@angular/core';
import { IHttpHeader } from 'src/app/service/types';
import { HEADER_KEYS, HEADER_VALUES } from 'src/app/constants/http';
import { CollectionService } from 'src/app/service/collection.service';
import { ServerService } from 'src/app/service/server.service';
import { HttpClient } from '@angular/common/http';
import * as SwaggerParser from 'swagger-parser';
import { OpenAPIV3 } from 'openapi-types';
import { RouteService } from 'src/app/service/route.service';
import * as cuid from 'cuid';
import { HttpMethod } from 'src/app/types/http.types';
import { NzMessageService, timeUnits } from 'ng-zorro-antd';
import { catchError } from 'rxjs/operators';
import { EmptyError } from 'rxjs';

@Component({
  selector: 'app-collection-settings',
  templateUrl: './collection-settings.component.html',
  styleUrls: ['./collection-settings.component.scss']
})
export class CollectionSettingsComponent implements OnInit {
  @Input()
  collectionId: string;
  enableCors = false;
  enableProxy = false;
  proxyUrl = '';
  swaggerUrl = '';
  headers: (IHttpHeader & {
    uuid: string;
    keyOptions: any[];
    valueOptions: any[];
  })[] = [];
  suggestionOptions = [];
  isImporting = false;
  importRouteNumber = 0;
  importedRouteNumber = 0;
  importFailedNumber = 0;

  constructor(
    private collectionService: CollectionService,
    private serverService: ServerService,
    private httpClient: HttpClient,
    private routeService: RouteService,
    private messageService: NzMessageService
  ) {}

  ngOnInit() {
    this.getCollectionLocalData();
  }

  getCollectionLocalData() {
    this.collectionService.getCollection(this.collectionId).subscribe(data => {
      if (data) {
        this.enableCors = data.cors;
        this.proxyUrl = data.proxyUrl;
        this.enableProxy = data.enableProxy;
        if (data.headers && data.headers.length) {
          this.headers = data.headers.map(item => ({
            uuid: (new Date().getTime() + Math.random() * 10000).toString(),
            keyOptions: [],
            valueOptions: [],
            ...item
          }));
        }
      }
    });
  }

  corsChange(enable) {}

  addHeader(event) {
    const header = {
      uuid: (new Date().getTime() + Math.random() * 10000).toString(),
      key: '',
      value: '',
      keyOptions: [],
      valueOptions: []
    };

    this.headers.push(header);
  }

  removeHeader(uuid) {
    for (let i = 0; i < this.headers.length; i++) {
      if (this.headers[i].uuid === uuid) {
        this.headers.splice(i, 1);
        break;
      }
    }
  }

  showSuggestions(type, value) {
    if (type === 'key') {
      this.suggestionOptions = HEADER_KEYS.filter(
        key => key.toLowerCase().indexOf(value.toLowerCase()) > -1
      );
    } else {
      this.suggestionOptions = HEADER_VALUES.filter(
        key => key.toLowerCase().indexOf(value.toLowerCase()) > -1
      );
    }
  }

  updateCollection() {
    this.collectionService
      .updateCollection(this.collectionId, {
        cors: this.enableCors,
        enableProxy: this.enableProxy,
        proxyUrl: this.proxyUrl,
        headers: this.headers.map(item => ({
          key: item.key,
          value: item.value
        }))
      })
      .subscribe(ret => {
        this.collectionService.updateCollectionListData$.next(null);
        this.serverService.serverNeedRestart$.next(this.collectionId);
      });
  }

  importRoutes() {
    this.isImporting = true;
    SwaggerParser.validate(this.swaggerUrl, (err, api) => {
      if (err) {
        // console.error(err);
        this.messageService.error('Import failed');
        this.isImporting = false;
      } else {
        this.importRouteNumber = 0;
        this.importedRouteNumber = 0;
        this.importFailedNumber = 0;
        for (const path in api.paths) {
          if (path) {
            const pathObjects = api.paths[path] as OpenAPIV3.PathItemObject;
            for (const operationMethod in pathObjects) {
              if (operationMethod) {
                const operationObject = pathObjects[
                  operationMethod
                ] as OpenAPIV3.OperationObject;
                this.addRoute(path, operationMethod, operationObject);
                this.importRouteNumber++;
              }
            }
          }
        }
        this.isImporting = false;
      }
    });
  }

  addRoute(
    path: string,
    method: string,
    pathObject: OpenAPIV3.OperationObject
  ) {
    const name = pathObject.summary;
    const description = pathObject.description;
    if (path[0] === '/') {
      path = path.slice(1);
    }
    this.routeService
      .createRoute({
        id: cuid(),
        collectionId: this.collectionId,
        name,
        path,
        method: <HttpMethod>method,
        description,
        ignore: false,
        activatedResponseId: null
      })
      .pipe(
        catchError(e => {
          this.importFailedNumber++;
          return EmptyError;
        })
      )
      .subscribe(ret => {
        this.importedRouteNumber++;
        if (this.importRouteNumber === this.importedRouteNumber  + this.importFailedNumber) {
          this.isImporting = false;
          this.messageService.success(
            `Imported ${this.importedRouteNumber} routes, ${this.importFailedNumber} failed.`
          );
          this.routeService.needReloadList$.next(this.collectionId);
        }
      });
  }
}
