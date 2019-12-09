import { Component, OnInit } from '@angular/core';
import { ServerService } from 'src/app/service/server.service';
import { CollectionService } from 'src/app/service/collection.service';
import { Collection } from 'src/app/service/types';
import { HTTP_STATUS_CODE } from 'src/app/constants/application';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { CollectionSettingsComponent } from '../collection-settings/collection-settings.component';
import { StatusbarService } from 'src/app/service/statusbar.service';

@Component({
  selector: 'app-collection-action-header',
  templateUrl: './collection-action-header.component.html',
  styleUrls: ['./collection-action-header.component.scss']
})
export class CollectionActionHeaderComponent implements OnInit {
  collectionIsRunning = false;
  collection: Collection;
  port: number;
  prefix: string;
  name: string;
  needRestart = false;

  collectionChange$ = new Subject<Partial<Collection>>();
  constructor(
    private serverService: ServerService,
    private collectionService: CollectionService,
    private messageService: NzMessageService,
    private modalService: NzModalService,
    private statusbarService: StatusbarService
  ) {}

  ngOnInit() {
    this.collectionService.activeCollectionId$.subscribe(collectionId => {
      const collection = this.collectionService.collections.find(
        _collection => _collection.id === collectionId
      );
      if (collection) {
        this.collection = collection;
        this.port = collection.port;
        this.prefix = collection.prefix;
        this.name = collection.name;
        this.collectionIsRunning = collection && collection.running;
        if (this.serverService.getServer(collectionId)) {
          this.needRestart = this.serverService.getServer(collectionId).haveUpdates;
        } else {
          this.needRestart = false;
        }
      } else {
        this.needRestart = false;
      }
    });

    this.collectionChange$.pipe(debounceTime(500)).subscribe(data => {
      this.updateCollection(data);
    });

    this.serverService.serverNeedRestart$.subscribe(collectionId => {
      if (collectionId && collectionId === this.collection.id) {
        this.needRestart = true;
      }
    });
  }

  start() {
    return this.serverService
      .start(this.collection.id)
      .then(() => {
        this.collectionIsRunning = true;
        this.collectionService.updateCollectionLocally(this.collection.id, {
          running: true
        });
      })
      .catch(e => {
        console.error(e);
      });
  }

  stop() {
    return this.serverService.stop(this.collection.id).then(() => {
      this.collectionIsRunning = false;
      this.collectionService.updateCollectionLocally(this.collection.id, {
        running: false
      });
      return true;
    });
  }

  restart() {
    this.stop().then(stopped => {
      if (stopped) {
        this.start().then(() => {
          this.needRestart = false;
        });
      }
    });
  }

  collectionChange(key: 'prefix' | 'port' | 'name', value: any) {
    this.collectionChange$.next({
      [key]: value
    });
  }

  updateCollection(data: Partial<Collection>) {
    const queueItemId = this.statusbarService.pushSyncQueue();
    this.collectionService
      .updateCollection(this.collection.id, data)
      .subscribe(_ => {
        this.statusbarService.popSyncQueue(queueItemId);
      });
  }

  openSettingModal() {
    this.modalService.create({
      nzTitle: 'Collection Settings',
      nzContent: CollectionSettingsComponent,
      nzComponentParams: {
        collectionId: this.collection.id
      },
      nzWidth: 750,
      nzOnOk: (instance) => {
        instance.updateCollection();
      }
    });
  }
}
