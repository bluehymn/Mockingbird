import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';
import {
  Collection,
  CollectionData,
  CreateCollectionData,
  IHttpResponse,
  IHttpResponseError
} from './types';
import { HTTP_STATUS_CODE, REQUEST_CODE_TEMPLATE } from '../constants/application';
import { StoreService } from './store.service';
import { IndexedDBService } from './indexedDB.service';

// const COLLECTION_DEFAULT_DATA: CollectionData = {
//   routes: [],
//   headers: [],
//   running: false,
//   cors: true,
//   delay: 0,
//   template: REQUEST_CODE_TEMPLATE
// };

@Injectable({
  providedIn: 'root'
})
export class CollectionService {
  activeCollectionId$ = new BehaviorSubject<string>(null);
  collections: Collection[] = [];
  constructor(
    private httpClient: HttpClient,
    private storeService: StoreService,
    private dbService: IndexedDBService
  ) {}

  createCollection(data: CreateCollectionData) {
    return this.dbService.add('collection', data);
  }

  getCollections(): Observable<Collection[]> {
    return this.httpClient
      .get<IHttpResponse<CollectionData[]>>('@host/collection')
      .pipe(
        map(res => {
          if (res.statusCode === HTTP_STATUS_CODE.OK) {
            const data = res.data;
            this.collections = data;
            return this.collections;
          } else {
            return [];
          }
        })
      );
  }

  getCollectionById(collectionId) {
    return this.collections.find(collection => collection.id === collectionId);
  }

  updateCollection(collectionId, data: Partial<CollectionData>) {
    return this.httpClient.patch<IHttpResponse>(
      `@host/collection/${collectionId}`,
      data
    );
  }

  updateCollectionLocally(collectionId, newValues: Partial<Collection>) {
    const collection = this.collections.find(item => item.id === collectionId);
    const propertyNames = Reflect.ownKeys(newValues);
    propertyNames.forEach(propertyName => {
      collection[propertyName] = newValues[propertyName];
    });
    this.dbService.update('collection', collectionId, {
      id: collectionId,
      ...newValues
    });
  }

  removeCollection(collectionId) {
    return this.httpClient.delete<IHttpResponse>(
      `@host/collection/${collectionId}`
    );
  }

  syncLocalCollections(collections: Collection[]) {
    this.dbService.opened$.subscribe(opened => {
      if (opened) {
        collections.forEach(collection => {
          this.dbService.get('collection', collection.id).subscribe((existed) => {
            if (!existed) {
              this.dbService.add('collection', _.pick(collection, ['id', 'delay', 'cors', 'headers', 'template']));
            }
          });
        });
      }
    });
  }

  getCollectionLocalData(collectionId) {
    return this.dbService.get<CollectionData>('collection', collectionId);
  }
}
