import { Component, OnInit } from '@angular/core';
import { CollectionService } from 'src/app/service/collection.service';
import { Collection } from 'src/app/service/types';
import { NzModalService, NzMessageService } from 'ng-zorro-antd';
import { CreateCollectionComponent } from '../create-collection/create-collection.component';
import { IndexedDBService } from 'src/app/service/indexedDB.service';

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
    private dbService: IndexedDBService
  ) {}

  ngOnInit() {
    this.dbService.opened$.subscribe(opened => {
      if (opened) {
        this.getCollections();
      }
    });
    this.collectionService.updateCollectionListData$.subscribe(_ => {
      this.getCollections();
    });
  }

  getCollections() {
    this.collectionService.getCollections().subscribe(res => {
      this.collections = res;
      if (this.collections.length) {
        if (!this.activatedCollectionId) {
          this.setActivateCollection(this.collections[0].id);
        }
      }
    });
  }

  setActivateCollection(collectionId) {
    this.activatedCollectionId = collectionId;
    this.collectionService.activeCollectionId$.next(collectionId);
  }

  handleClick(collectionId) {
    this.setActivateCollection(collectionId);
  }

  openCreateModal(event) {
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
          this.messageService.success('removed!');
          if (collectionId === this.activatedCollectionId) {
            this.activatedCollectionId = null;
            this.collectionService.activeCollectionId$.next(null);
          }
          this.getCollections();
        });
      }
    });
  }

}
