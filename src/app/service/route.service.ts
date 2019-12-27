import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import {
  Route,
  RouteData,
  ResponseData
} from './types';
import * as _ from 'lodash';
import { IndexedDBService } from './indexedDB.service';
import { ResponseService } from './response.service';

@Injectable({
  providedIn: 'root'
})
export class RouteService {
  activatedRouteId$ = new BehaviorSubject<string>(null);
  updateRouteListData$ = new Subject<Partial<Route>>();
  needReloadList$ = new Subject<string>();
  constructor(private dbService: IndexedDBService, private responseService: ResponseService) {}

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
    return this.dbService.update('route', routeId, {...newValues});
  }

  removeRoute(routeId) {
    return this.dbService.delete('route', routeId);
  }

  setActiveRoute(routeId) {
    this.activatedRouteId$.next(routeId);
  }

  getActivatedResponse(routeId: string): Promise<ResponseData> {
    return new Promise((resolve, reject) => {
      this.dbService.get<RouteData>('route', routeId).subscribe(route => {
        if (route.activatedResponseId) {
          this.responseService.getResponse(route.activatedResponseId).subscribe(ret => {
            resolve(ret);
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
