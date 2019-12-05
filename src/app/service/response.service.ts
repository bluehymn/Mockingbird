import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import {
  Response,
  IHttpResponse,
  ResponseRawData,
  CreateResponseData
} from './types';
import { HTTP_STATUS_CODE } from '../constants/application';
import { HttpClient } from '@angular/common/http';

// const RESPONSE_DEFAULT_DATA: Pick<
//   ResponseLocalData,
//   Exclude<keyof ResponseLocalData, 'id'>
// > = {};

@Injectable({
  providedIn: 'root'
})
export class ResponseService {
  constructor(private httpClient: HttpClient) {}

  createResponse(data: CreateResponseData) {
    return this.httpClient.post<IHttpResponse>('@host/response', data);
  }

  getResponse(id) {
    return this.httpClient.get<IHttpResponse<ResponseRawData>>(`@host/response/${id}`);
  }

  getResponsesByRouteId(routeId): Observable<Response[]> {
    return this.httpClient
      .get<IHttpResponse<ResponseRawData[]>>(
        '@host/response/?routeId=' + routeId
      )
      .pipe(
        map(res => {
          if (res.statusCode === HTTP_STATUS_CODE.OK) {
            const data = res.data.map(item => {
              const response = Object.assign({}, item);
              return response;
            });
            return data;
          }
        })
      );
  }

  updateResponse(responseId: string, newValues: Partial<Response>) {
    return this.httpClient.patch<IHttpResponse>(
      '@host/response/' + responseId,
      {
        ...newValues
      }
    );
  }
}
