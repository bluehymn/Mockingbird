import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import {
  Route,
  IHttpResponse,
  RouteData,
  ResponseRawData
} from './types';
import { HTTP_STATUS_CODE } from '../constants/application';
import { HttpClient } from '@angular/common/http';
import * as _ from 'lodash';
import { IndexedDBService } from './indexedDB.service';
import { ResponseService } from './response.service';

@Injectable({
  providedIn: 'root'
})
export class RouteService {
  activatedRouteId$ = new BehaviorSubject<string>(null);
  updateRouteListData$ = new Subject<Partial<Route>>();
  constructor(private httpClient: HttpClient, private dbService: IndexedDBService, private responseService: ResponseService) {}

  createRoute(data: RouteData) {
    return this.dbService.add('route', data);
  }

  getRoutes(collectionId: string): Observable<Route[]> {
    return this.dbService.getAllByIndex('route', 'collectionId', collectionId);
  }

  getRoute(routeId) {
    return this.dbService.get('route', routeId);
  }

  updateRoute(routeId: string, newValues: Partial<RouteData>) {
    return this.httpClient.patch<IHttpResponse>('@host/route/' + routeId, {
      ...newValues
    });
  }

  removeRoute(routeId) {
    return this.dbService.delete('route', routeId);
  }

  setActiveRoute(routeId) {
    this.activatedRouteId$.next(routeId);
  }

  updateRouteLocalData(data: Partial<Route>) {
    const newData = _.pick(data, ['id', 'ignore', 'activatedResponseId']);
    this.updateRouteListData$.next(data);
    this.dbService.get('route', data.id).subscribe(route => {
      if (route) {
        this.dbService.update('route', data.id, newData);
      } else {
        this.dbService.add('route', newData);
      }
    });
  }

  getActivatedResponse(routeId: string): Promise<ResponseRawData> {
    return new Promise((resolve, reject) => {
      this.dbService.get<RouteData>('route', routeId).subscribe(route => {
        if (route) {
          this.responseService.getResponse(route.activatedResponseId).subscribe(ret => {
            if (ret.statusCode === HTTP_STATUS_CODE.OK) {
              resolve(ret.data);
            }
          });
        } else {
          this.responseService.getResponsesByRouteId(routeId).subscribe(responses => {
            resolve(responses[0]);
          });
        }
      });
    });
  }
}
