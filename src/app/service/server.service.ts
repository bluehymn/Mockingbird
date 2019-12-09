import { Injectable } from '@angular/core';
import * as express from 'express';
import { RouteService } from './route.service';
import { CollectionService } from './collection.service';
import { Route, Collection, IServer, CollectionData } from './types';
import { NzMessageService } from 'ng-zorro-antd';
import { ERRORS } from '../constants/error';
import { ResponseService } from './response.service';
import { Subject } from 'rxjs';
import * as expressCore from 'express-serve-static-core';
import { CORSHeaders } from '../constants/http';

@Injectable({
  providedIn: 'root'
})
export class ServerService {
  servers = new Map<string, IServer>();
  // route变化时需要重启server更新配置 订阅collectionId
  serverNeedRestart$ = new Subject<string>();
  constructor(
    private collectionService: CollectionService,
    private routeService: RouteService,
    private responseService: ResponseService,
    private messageService: NzMessageService
  ) {}

  start(collectionId) {
    const app = express();
    const collection = this.collectionService.getCollectionById(collectionId);
    return new Promise((resolve, reject) => {
      this.collectionService.getCollectionLocalData(collectionId).subscribe(collectionData => {
        const server = app.listen(collection.port, () => {
          console.log(`collection ${collection.name} is started!`);
          resolve();
        });
        server.on('error', (error: any) => {
          if (error.code === 'EADDRINUSE') {
            this.messageService.error(ERRORS.PORT_ALREADY_USED);
          } else if (error.code === 'EACCES') {
            this.messageService.error(ERRORS.INVALID_PORT);
          }
          reject(error);
        });
        this.servers.set(collectionId, {
          server,
          haveUpdates: false
        });
        this.setPreFlightOption(app, collectionData);
        this.routeService.getRoutes(collectionId).subscribe(routes => {
          this.setRoutes(app, collection, routes);
        });
      });
    });
  }

  stop(collectionId) {
    const server = this.servers.get(collectionId).server;
    return new Promise((resolve, reject) => {
      server.close(() => {
        this.servers.delete(collectionId);
        console.log(`collection  is stopped!`);
        resolve();
      });
    });
  }

  setRoutes(app: expressCore.Express, collection: Collection, routes: Route[]) {
    routes.forEach(route => {
      app[route.method](
        `/${collection.prefix}/${route.path}`,
        (req: expressCore.Request, res: expressCore.Response) => {
          this.routeService.getActivatedResponse(route.id).then(response => {
            this.collectionService
              .getCollectionLocalData(collection.id)
              .subscribe(data => {
                if (data.cors) {
                  this.setCorsHeaders(res);
                }
                if (data.headers.length) {
                  this.setHeaders(res, data.headers);
                }
                if (response) {
                  res.send(response.body);
                } else {
                  res.send(404);
                }
              });
          });
        }
      );
    });
  }

  setPreFlightOption(app: expressCore.Express, collection: CollectionData) {
    app.options('/*', (req, res) => {
      this.setHeaders(res, CORSHeaders);
      this.setHeaders(res, collection.headers);
      res.send(200);
    });
  }

  setCorsHeaders(response: expressCore.Response) {
    this.setHeaders(response, CORSHeaders);
  }

  setHeaders(response: expressCore.Response, headers) {
    headers.forEach(header => {
      response.setHeader(header.key, header.value);
    });
  }

  haveUpdate(collectionId) {
    const server = this.servers.get(collectionId);
    if (server) {
      server.haveUpdates = true;
      this.serverNeedRestart$.next(collectionId);
    }
  }

  getServer(collectionId) {
    return this.servers.get(collectionId);
  }
}
