import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IndexedDBService {
  db: IDBDatabase;
  version = 3;
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
      }
      if (!this.db.objectStoreNames.contains('response')) {
        const responseStore = this.db.createObjectStore('response', {
          keyPath: 'id'
        });
      }
    };
  }

  add(storeName: string, data: any) {
    return new Promise((resolve, reject) => {
      const request = this.db
        .transaction([storeName], 'readwrite')
        .objectStore(storeName)
        .add(data);
      request.onsuccess = function(event) {
        resolve();
      };
      request.onerror = function(event) {
        reject(new Error('add failed'));
      };
    });
  }

  get<T = any>(storeName: string, key: IDBValidKey | IDBKeyRange): Promise<T> {
    return new Promise((resolve, reject) => {
      const request = this.db
        .transaction([storeName], 'readwrite')
        .objectStore(storeName)
        .get(key);
      request.onsuccess = function(event) {
        resolve(request.result);
      };
      request.onerror = function(event) {
        reject(new Error('failed'));
      };
    });
  }

  update(storeName: string, key: IDBValidKey | IDBKeyRange, data: any) {
    return new Promise((resolve, reject) => {
      this.get(storeName, key).then(oldData => {
        const newData = Object.assign(oldData, data);
        this.put(storeName, newData)
          .then(() => {
            resolve();
          })
          .catch(() => {
            reject(new Error('update failed'));
          });
      });
    });
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

  delete(storeName: string, key: IDBValidKey | IDBKeyRange) {
    return new Promise((resolve, reject) => {
      const request = this.db
        .transaction([storeName], 'readwrite')
        .objectStore(storeName)
        .delete(key);
      request.onsuccess = function(event) {
        resolve();
      };
      request.onerror = function(event) {
        reject(new Error('delete failed'));
      };
    });
  }

}
