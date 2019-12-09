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
} from './types';

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
    return this.dbService.getAll('collection').pipe(
      map(res => {
        this.collections = res || [];
        return this.collections;
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
    return this.dbService.delete('collection', collectionId);
  }

  getCollectionLocalData(collectionId) {
    return this.dbService.get<CollectionData>('collection', collectionId);
  }
}
