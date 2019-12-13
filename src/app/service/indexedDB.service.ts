import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IndexedDBService {
  db: IDBDatabase;
  version = 1;
  dbRequest = window.indexedDB.open('mockingbird', this.version);
  opened$ = new BehaviorSubject<boolean>(false);
  constructor() {
    this.dbRequest.onerror = function(e) {
      console.log(e);
    };

    this.dbRequest.onsuccess = event => {
      this.db = event.target['result'];
      this.opened$.next(true);
    };

    this.dbRequest.onupgradeneeded = event => {
      // created new db or db updated
      this.db = event.target['result'];
      if (!this.db.objectStoreNames.contains('collection')) {
        const collectionStore = this.db.createObjectStore('collection', {
          keyPath: 'id'
        });
      }
      if (!this.db.objectStoreNames.contains('route')) {
        const routeStore = this.db.createObjectStore('route', {
          keyPath: 'id'
        });
        routeStore.createIndex('collectionId', 'collectionId', {
          unique: false
        });
      }
      if (!this.db.objectStoreNames.contains('response')) {
        const responseStore = this.db.createObjectStore('response', {
          keyPath: 'id'
        });
        responseStore.createIndex('routeId', 'routeId', {
          unique: false
        });
      }
    };
  }

  add<T = any>(storeName: string, data: T): Observable<any> {
    const observable = new Observable(subscriber => {
      const request = this.db
        .transaction([storeName], 'readwrite')
        .objectStore(storeName)
        .add(data);
      request.onsuccess = function(event) {
        subscriber.next(request.result);
        subscriber.complete();
      };
      request.onerror = function(event) {
        throwError(event);
        subscriber.complete();
      };
    });
    return observable;
  }

  get<T = any>(
    storeName: string,
    key: IDBValidKey | IDBKeyRange
  ): Observable<T> {
    const observable = new Observable<T>(subscriber => {
      const request = this.db
        .transaction([storeName], 'readonly')
        .objectStore(storeName)
        .get(key);
      request.onsuccess = function(event) {
        subscriber.next(request.result);
        subscriber.complete();
      };
      request.onerror = function(event) {
        throwError(event);
        subscriber.complete();
      };
    });
    return observable;
  }

  getAll<T = any>(storeName: string) {
    const observable = new Observable<T[]>(subscriber => {
      const request = this.db
        .transaction([storeName], 'readonly')
        .objectStore(storeName)
        .getAll();
      request.onsuccess = function(event) {
        subscriber.next(request.result);
        subscriber.complete();
      };
      request.onerror = function(event) {
        throwError(event);
        subscriber.complete();
      };
    });
    return observable;
  }

  getAllByIndex<T = any>(storeName: string, indexName: string, query: any) {
    const observable = new Observable<T[]>(subscriber => {
      const index = this.db
        .transaction([storeName], 'readonly')
        .objectStore(storeName)
        .index(indexName);

      if (query) {
        const request = index.getAll(query);
        request.onsuccess = function(event) {
          const result = event.target['result'];
          subscriber.next(result);
          subscriber.complete();
        };
        request.onerror = function(event) {
          throwError(event);
          subscriber.complete();
        };
      } else {
        const request = index.getAll();
        request.onsuccess = function(event) {
          subscriber.next(request.result);
          subscriber.complete();
        };
        request.onerror = function(event) {
          throwError(event);
          subscriber.complete();
        };
      }
    });
    return observable;
  }

  update(storeName: string, key: IDBValidKey | IDBKeyRange, data: any) {
    const observable = new Observable(subscriber => {
      this.get(storeName, key).subscribe(oldData => {
        const newData = Object.assign(oldData, data);
        this.put(storeName, newData)
          .then(() => {
            subscriber.next(true);
          })
          .catch(() => {
            throwError(event);
            subscriber.complete();
          });
      });
    });
    return observable;
  }

  put(storeName: string, data: any) {
    return new Promise((resolve, reject) => {
      const request = this.db
        .transaction([storeName], 'readwrite')
        .objectStore(storeName)
        .put(data);
      request.onsuccess = function(event) {
        resolve();
      };
      request.onerror = function(event) {
        reject(new Error('put failed'));
      };
    });
  }

  delete<T = any>(storeName: string, key: IDBValidKey | IDBKeyRange) {
    const observable = new Observable(subscriber => {
      const request = this.db
        .transaction([storeName], 'readwrite')
        .objectStore(storeName)
        .delete(key);
      request.onsuccess = function(event) {
        subscriber.next(true);
      };
      request.onerror = function(event) {
        throwError(event);
        subscriber.complete();
      };
    });

    return observable;
  }
}
