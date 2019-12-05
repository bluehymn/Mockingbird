import { Component, OnInit } from '@angular/core';
import { CollectionService } from 'src/app/service/collection.service';
import { Collection } from 'src/app/service/types';
import { NzModalService, NzMessageService } from 'ng-zorro-antd';
import { CreateCollectionComponent } from '../create-collection/create-collection.component';
import { HTTP_STATUS_CODE } from 'src/app/constants/application';
import { StoreService } from 'src/app/service/store.service';

@Component({
  selector: 'app-collection-list',
  templateUrl: './collection-list.component.html',
  styleUrls: ['./collection-list.component.scss']
})
export class CollectionListComponent implements OnInit {
  collections: Collection[] = [];
  activatedCollectionId: string;
  constructor(
    private collectionService: CollectionService,
    private modalService: NzModalService,
    private messageService: NzMessageService,
    private storeService: StoreService
  ) {}

  ngOnInit() {
    this.getCollections();
  }

  getCollections() {
    this.collectionService.getCollections().subscribe(res => {
      this.collections = res;
      if (this.collections.length) {
        this.activateCollection(this.collections[0].id);
      }
      this.updateLocalCollections(this.collections);
    });
  }

  activateCollection(collectionId) {
    this.activatedCollectionId = collectionId;
    this.collectionService.activeCollectionId$.next(collectionId);
  }

  handleClick(collectionId) {
    this.activateCollection(collectionId);
  }

  openCreateModal() {
    this.modalService.create({
      nzTitle: 'New Collection',
      nzContent: CreateCollectionComponent,
      nzComponentParams: {},
      nzClosable: false,
      nzOnOk: instance => {
        const _return = instance.submit();
        if (_return instanceof Promise) {
          return _return.then(_ => {
            this.getCollections();
          });
        } else {
          return _return;
        }
      }
    });
  }

  removeCollection(collectionId, collectionName) {
    this.modalService.confirm({
      nzTitle: 'Remove Collection',
      nzContent: `Are you sure you want to remove "${collectionName}"`,
      nzOnOk: () => {
        this.collectionService.removeCollection(collectionId).subscribe(ret => {
          if (ret.statusCode === HTTP_STATUS_CODE.OK) {
            this.messageService.success('removed!');
            this.getCollections();
          }
        });
      }
    });
  }

  updateLocalCollections(collections: Collection[]) {
    this.collectionService.syncLocalCollections(collections);
  }
}
