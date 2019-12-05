import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import {
  Route,
  RouteLocalData,
  CreateRouteData,
  IHttpResponse,
  RouteRawData,
  ResponseRawData
} from './types';
import { HTTP_STATUS_CODE } from '../constants/application';
import { HttpClient } from '@angular/common/http';
import * as _ from 'lodash';
import { IndexedDBService } from './indexedDB.service';
import { ResponseService } from './response.service';

const ROUTE_DEFAULT_DATA: Pick<
  RouteLocalData,
  Exclude<keyof RouteLocalData, 'id'>
> = {
  ignore: false,
  activatedResponseId: null
};

@Injectable({
  providedIn: 'root'
})
export class RouteService {
  activatedRouteId$ = new BehaviorSubject<string>(null);
  updateRouteListData$ = new Subject<Partial<Route>>();
  constructor(private httpClient: HttpClient, private dbService: IndexedDBService, private responseService: ResponseService) {}

  createRoute(data: CreateRouteData) {
    return this.httpClient.post<IHttpResponse>('@host/route', data);
  }

  getRoutes(collectionId: string): Observable<Route[]> {
    return this.httpClient
      .get<IHttpResponse<RouteRawData[]>>('@host/route', {
        params: {
          collectionId
        }
      })
      .pipe(
        map(res => {
          if (res.statusCode === HTTP_STATUS_CODE.OK) {
            return res.data.map(item => {
              const route = Object.assign({}, ROUTE_DEFAULT_DATA, item);
              return route;
            });
          } else {
            return [];
          }
        })
      );
  }

  getRoute(routeId) {
    return this.httpClient
      .get<IHttpResponse<RouteRawData>>('@host/route/' + routeId)
      .pipe(
        map(res => {
          if (res.statusCode === HTTP_STATUS_CODE.OK) {
            const route = Object.assign({}, ROUTE_DEFAULT_DATA, res.data);
            return route;
          } else {
            return null;
          }
        })
      );
  }

  updateRoute(routeId: string, newValues: Partial<RouteRawData>) {
    return this.httpClient.patch<IHttpResponse>('@host/route/' + routeId, {
      ...newValues
    });
  }

  removeRoute(routeId) {
    return this.httpClient.delete<IHttpResponse>(`@host/route/${routeId}`);
  }

  setActiveRoute(routeId) {
    this.activatedRouteId$.next(routeId);
  }

  updateRouteLocalData(data: Partial<Route>) {
    const newData = _.pick(data, ['id', 'ignore', 'activatedResponseId']);
    this.updateRouteListData$.next(data);
    this.dbService.get('route', data.id).then(route => {
      if (route) {
        this.dbService.update('route', data.id, newData);
      } else {
        this.dbService.add('route', newData);
      }
    });
  }

  getActivatedResponse(routeId: string): Promise<ResponseRawData> {
    return new Promise((resolve, reject) => {
      this.dbService.get<RouteLocalData>('route', routeId).then(route => {
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
