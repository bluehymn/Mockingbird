import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Response,
  ResponseData
} from './types';
import { IndexedDBService } from './indexedDB.service';

// const RESPONSE_DEFAULT_DATA: Pick<
//   ResponseLocalData,
//   Exclude<keyof ResponseLocalData, 'id'>
// > = {};

@Injectable({
  providedIn: 'root'
})
export class ResponseService {
  constructor(private dbService: IndexedDBService) {}

  createResponse(data: ResponseData) {
    return this.dbService.add('response', data);
  }

  getResponse(id) {
    return this.dbService.get('response', id);
  }

  getResponsesByRouteId(routeId): Observable<Response[]> {
    return this.dbService.getAllByIndex('response', 'routeId', routeId);
  }

  updateResponse(responseId: string, newValues: Partial<Response>) {
    return this.dbService.update('response', responseId, newValues);
  }

  removeResponse(responseId: string) {
    return this.dbService.delete('response', responseId);
  }
}
