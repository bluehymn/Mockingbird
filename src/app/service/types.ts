import { HttpMethod } from '../types/http.types';
import { HTTP_STATUS_CODE } from '../constants/application';
import { Server } from 'http';

export type HttpStatusCode = HTTP_STATUS_CODE.OK | HTTP_STATUS_CODE.CREATED;

export type HttpErrorStatusCode = HTTP_STATUS_CODE.BAD_REQUEST;

export interface IHttpResponse<T = any, Code = HttpStatusCode> {
  statusCode: Code;
  message: string;
  data: T;
}

export interface IHttpResponseError<Code = HttpErrorStatusCode> {
  statusCode: Code;
  error: string;
}

// Collection
export interface CollectionRawData {
  id: string;
  name: string;
  port: number;
  prefix: string;
  proxyUrl: string;
}

export interface CollectionLocalData {
  id?: string;
  headers: { key: string; value: string }[];
  routes: Route[];
  running: boolean;
  cors: boolean;
  delay: number;
  template: string;
}

export type Collection = CollectionRawData & CollectionLocalData;

export type CreateCollectionData = Pick<Collection, 'name' | 'port'> &
  Partial<Pick<Collection, 'prefix' | 'headers' | 'proxyUrl'>>;

// Route
export interface RouteRawData {
  id: string;
  collectionId: string;
  name: string;
  path: string;
  method: HttpMethod;
  description: string;
}
export interface RouteLocalData {
  ignore: boolean;
  activatedResponseId: string;
}

export type CreateRouteData = Pick<
  Route,
  'collectionId' | 'method' | 'path' | 'name'
> &
  Partial<Pick<Route, 'description'>>;

export type Route = RouteRawData & RouteLocalData;

// Response
export interface ResponseRawData {
  id: string;
  routeId: string;
  body: string;
  name: string;
  statusCode: number;
  headers: any[];
}

// export interface ResponseLocalData {
//   id: string;
// }

export type CreateResponseData = Pick<
  Response,
  'routeId' | 'name' | 'body' | 'statusCode'
>;

export type Response = ResponseRawData;

export interface IHttpHeader {
  key: string;
  value: string;
}

export interface IServer {
  server: Server;
  haveUpdates: boolean;
}