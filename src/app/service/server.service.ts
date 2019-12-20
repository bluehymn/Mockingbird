import { Injectable } from '@angular/core';
import * as express from 'express';
import { RouteService } from './route.service';
import { CollectionService } from './collection.service';
import { Route, Collection, IServer, CollectionData } from './types';
import { NzMessageService } from 'ng-zorro-antd';
import { ERRORS } from '../constants/error';
import { Subject } from 'rxjs';
import * as expressCore from 'express-serve-static-core';
import { CORSHeaders } from '../constants/http';
import * as proxy from 'http-proxy-middleware';

@Injectable({
  providedIn: 'root'
})
export class ServerService {
  servers = new Map<string, IServer>();
  //  Need to restart server for refresh configurations when route change(subscribe the collectionId)
  serverNeedRestart$ = new Subject<string>();
  constructor(
    private collectionService: CollectionService,
    private routeService: RouteService,
    private messageService: NzMessageService
  ) {}

  start(collectionId) {
    const app = express();
    return new Promise((resolve, reject) => {
      this.collectionService.getCollection(collectionId).subscribe(collection => {
        this.collectionService.getCollection(collectionId).subscribe(collectionData => {
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
            haveUpdates: false,
            running: true
          });
          this.setPreFlightOption(app, collectionData);
          this.routeService.getRoutes(collectionId).subscribe(routes => {
            this.setRoutes(app, collection, routes);
            this.setProxy(app, collection);
          });
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
      const path = collection.prefix ? `/${collection.prefix}/${route.path}` : `/${route.path}`;
      app[route.method](
        path,
        (req: expressCore.Request, res: expressCore.Response) => {
          this.routeService.getActivatedResponse(route.id).then(response => {
            if (collection.cors) {
              this.setCorsHeaders(res);
            }
            if (collection.headers.length) {
              this.setHeaders(res, collection.headers);
            }
            if (response) {
              res.send(response.body);
            } else {
              res.send(404);
            }
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

  setProxy(app: expressCore.Application, collection: Collection) {
    if (collection.enableProxy && collection.proxyUrl) {
      const options = {
        target: collection.proxyUrl,
        changeOrigin: true, // needed for virtual hosted sites
        ws: true,
      };
      const proxyInstance = proxy(options);
      app.use('*', proxyInstance);
    }
  }
}
