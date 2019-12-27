import { Component, OnInit, OnDestroy } from '@angular/core';
import { Route } from 'src/app/service/types';
import { CollectionService } from 'src/app/service/collection.service';
import { Subscription } from 'rxjs';
import { RouteService } from 'src/app/service/route.service';
import { NzModalService, NzMessageService } from 'ng-zorro-antd';
import { CreateRouteComponent } from '../create-route/create-route.component';
import { HTTP_STATUS_CODE } from 'src/app/constants/application';

@Component({
  selector: 'app-route-list',
  templateUrl: './route-list.component.html',
  styleUrls: ['./route-list.component.scss']
})
export class RouteListComponent implements OnInit, OnDestroy {
  collectionId: string;
  activeRouteId: string;
  list: Route[] = [];
  subscriptions: Subscription[] = [];
  httpMethodTagColors = {
    post: '#73d13d',
    get: '#40a9ff',
    delete: '#ff4d4f',
    put: '#ff7a45',
    patch: '#ffa940',
    head: '#597ef7',
    option: '#f759ab'
  };
  constructor(
    private collectionService: CollectionService,
    private routeService: RouteService,
    private modalService: NzModalService,
    private messageService: NzMessageService
  ) {}

  ngOnInit() {
    const collectionIdSubscription = this.collectionService.activeCollectionId$.subscribe(
      collectionId => {
        this.collectionId = collectionId;
        if (collectionId) {
          this.getRoutes();
        }
      }
    );
    const updateLocalRouteDataSubscription = this.routeService.updateRouteListData$.subscribe(
      data => {
        this.updateRouteData(data);
      }
    );

    const needReloadListSubscription = this.routeService.needReloadList$.subscribe(collectionId => {
      if (this.collectionId === collectionId) {
        this.getRoutes();
      }
    })
    this.subscriptions.push(collectionIdSubscription, updateLocalRouteDataSubscription, needReloadListSubscription);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  getRoutes() {
    this.routeService.getRoutes(this.collectionId).subscribe(res => {
      this.list = res;
      if (this.list.length) {
        this.activeRouteId = this.list[0].id;
        this.routeService.setActiveRoute(this.activeRouteId);
      } else {
        this.routeService.setActiveRoute(null);
      }
    });
  }

  selectRoute(routeId) {
    this.activeRouteId = routeId;
    this.routeService.setActiveRoute(routeId);
  }

  openCreateModal(event) {
    this.modalService.create({
      nzTitle: 'New Route',
      nzContent: CreateRouteComponent,
      nzComponentParams: {
        collectionId: this.collectionId
      },
      nzClosable: false,
      nzOnOk: instance => {
        const _return = instance.submit();
        if (_return instanceof Promise) {
          return _return.then(_ => {
            this.getRoutes();
          });
        } else {
          return _return;
        }
      }
    });
  }

  removeRoute(routeId, routeName) {
    this.modalService.confirm({
      nzTitle: 'Remove Route',
      nzContent: `Are you sure you want to remove "${routeName}"`,
      nzOnOk: () => {
        this.routeService.removeRoute(routeId).subscribe(_ => {
          this.messageService.success('removed!');
          this.getRoutes();
        });
      }
    });
  }

  updateRouteData(routeData: Partial<Route>) {
    for (let i = 0; i < this.list.length; i++) {
      if (this.list[i].id === routeData.id) {
        Object.assign(this.list[i], routeData);
        return;
      }
    }
  }
}
