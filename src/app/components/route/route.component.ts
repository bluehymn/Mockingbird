import {
  Component,
  OnInit
} from '@angular/core';
import { RouteService } from 'src/app/service/route.service';
import { Route, Response, RouteData } from 'src/app/service/types';
import { HTTP_METHODS, HTTP_STATUS_CODES } from 'src/app/constants/http';
import { HttpMethod } from 'src/app/types/http.types';
import { ResponseService } from 'src/app/service/response.service';
import { Subscription, Subject } from 'rxjs';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { debounceTime } from 'rxjs/operators';
import { CreateResponseComponent } from '../create-response/create-response.component';
import { ServerService } from 'src/app/service/server.service';
import { StatusbarService } from 'src/app/service/statusbar.service';

@Component({
  selector: 'app-route',
  templateUrl: './route.component.html',
  styleUrls: ['./route.component.scss']
})
export class RouteComponent implements OnInit {
  route: Route;
  name: string;
  method: HttpMethod = 'get';
  path: string;
  description: string;
  httpMethods: { value: HttpMethod; name: string }[] = [];
  subscriptions: Subscription[] = [];
  responses: Response[] = [];
  activatedResponseId: string;
  activatedResponse: Response;
  responseBody = '';
  statusCodes = [];
  responseHeaders = [];
  name$ = new Subject<string>();
  method$ = new Subject<HttpMethod>();
  path$ = new Subject<string>();
  description$ = new Subject<string>();
  responseChange$ = new Subject<Partial<Response>>();
  responsesIsEmpty = false;
  isEmpty = false;

  constructor(
    private routeService: RouteService,
    private responseService: ResponseService,
    private modalService: NzModalService,
    private serverService: ServerService,
    private statusbarService: StatusbarService
  ) {
    this.httpMethods = [...HTTP_METHODS].map(method => ({
      value: method,
      name: method.toUpperCase()
    }));
  }

  ngOnInit() {
    this.routeService.activatedRouteId$.subscribe(routeId => {
      this.unsubscribeChanges();
      this.activatedResponse = null;
      this.activatedResponseId = null;
      this.responsesIsEmpty = false;
      if (routeId) {
        this.isEmpty = false;
        this.getRoute(routeId);
      } else {
        this.isEmpty = true;
      }
    });
    this.statusCodes = HTTP_STATUS_CODES;
  }

  getRoute(routeId) {
    this.routeService.getRoute(routeId).subscribe(route => {
      this.route = route;
      this.method = route.method;
      this.path = route.path;
      this.name = route.name;
      this.description = route.description;
      this.getResponse(this.route.id);
      this.subscribeChanges();
    });
  }

  getResponse(routeId) {
    this.responseService.getResponsesByRouteId(routeId).subscribe(responses => {
      this.responses = responses;
      if (this.responses.length) {
        if (this.route.activatedResponseId) {
          this.setActivatedResponse(this.route.activatedResponseId);
        } else {
          this.setActivatedResponse(this.responses[0].id);
        }
      } else {
        this.setActivatedResponse(null);
      }
    });
  }

  setActivatedResponse(responseId, callback?) {
    if (responseId) {
      const response = this.responseService
        .getResponse(responseId)
        .subscribe(ret => {
          this.activatedResponse = ret;
          this.activatedResponseId = responseId;
          this.responseBody = ret.body;
          this.responseHeaders = ret.headers;
          this.updateRoute({
            activatedResponseId: responseId
          });
          if (callback) {
            callback();
          }
        });
    } else {
      this.route.activatedResponseId = responseId;
      this.activatedResponse = null;
      this.activatedResponseId = responseId;
      this.responseBody = '';
    }
  }

  responseChange(key, value) {
    this.responseChange$.next({ [key]: value });
    if (key === 'body') {
      this.responseBody = value;
    }
  }

  updateResponse(data: Partial<Response>) {
    const queueItemId = this.statusbarService.pushSyncQueue();
    this.responseService
      .updateResponse(this.activatedResponse.id, data)
      .subscribe(res => {
        // this.messageService.success('Updated');
        this.statusbarService.popSyncQueue(queueItemId);
      });
  }

  subscribeChanges() {
    const subscribeResponseChanges = this.responseChange$
      .pipe(debounceTime(1000))
      .subscribe(res => {
        this.updateResponse(res);
      });

    const subscribeName = this.name$
      .pipe(debounceTime(1000))
      .subscribe(name => {
        this.updateRoute({ name });
      });

    const subscribeMethod = this.method$
      .pipe(debounceTime(1000))
      .subscribe(method => {
        this.updateRoute({ method });
        this.serverService.haveUpdate(this.route.collectionId);
      });

    const subscribePath = this.path$
      .pipe(debounceTime(1000))
      .subscribe(path => {
        this.updateRoute({ path });
        this.serverService.haveUpdate(this.route.collectionId);
      });

    const subscribeDescription = this.description$
      .pipe(debounceTime(1000))
      .subscribe(description => {
        this.updateRoute({ description });
      });

    this.subscriptions.push(
      subscribeResponseChanges,
      subscribeName,
      subscribeMethod,
      subscribePath,
      subscribeDescription
    );
  }

  unsubscribeChanges() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  updateRoute(data: Partial<Route>) {
    const queueItemId = this.statusbarService.pushSyncQueue();
    this.routeService.updateRoute(this.route.id, data).subscribe(ret => {
      // this.messageService.success(`${this.name} update successful`);
      this.route = Object.assign({}, this.route, data);
      this.routeService.updateRouteListData$.next({
        id: this.route.id,
        ...data
      });
      this.statusbarService.popSyncQueue(queueItemId);
    });
  }

  nameChange(newName) {
    this.name$.next(newName);
  }

  pathChange(newPath) {
    this.path$.next(newPath);
  }

  methodChange(newMethod) {
    this.method$.next(newMethod);
  }

  descriptionChange(newDescription) {
    this.description$.next(newDescription);
  }

  openCreateResponseModal() {
    this.modalService.create({
      nzTitle: 'New Response',
      nzContent: CreateResponseComponent,
      nzComponentParams: {
        routeId: this.route.id
      },
      nzClosable: false,
      nzOnOk: instance => {
        const _return = instance.submit();
        if (_return instanceof Promise) {
          return _return.then(_ => {
            this.getResponse(this.route.id);
          });
        } else {
          return _return;
        }
      }
    });
  }

  removeResponse(responseId, responseName) {
    this.modalService.confirm({
      nzTitle: 'Remove Response',
      nzContent: `Are you sure remove response "${responseName}"`,
      nzOnOk: () => {
        this.responseService.removeResponse(responseId).subscribe(ret => {
          if (responseId === this.route.activatedResponseId) {
            this.setActivatedResponse(null);
          }
          this.getResponse(this.route.id);
        });
      }
    });
  }
}
