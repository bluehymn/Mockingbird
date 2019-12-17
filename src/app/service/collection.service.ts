import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';
import {
  Collection,
  CollectionData,
} from './types';

import { IndexedDBService } from './indexedDB.service';

@Injectable({
  providedIn: 'root'
})
export class CollectionService {
  activeCollectionId$ = new BehaviorSubject<string>(null);
  collections: Collection[] = [];
  updateCollectionListData$ = new Subject<Partial<Collection>>();
  constructor(
    private dbService: IndexedDBService
  ) {}

  createCollection(data: CollectionData) {
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

  updateCollection(collectionId, newValues: Partial<CollectionData>) {
    return this.dbService.update('collection', collectionId, newValues);
  }

  removeCollection(collectionId) {
    return this.dbService.delete('collection', collectionId);
  }

  getCollection(collectionId) {
    return this.dbService.get<CollectionData>('collection', collectionId);
  }
}
