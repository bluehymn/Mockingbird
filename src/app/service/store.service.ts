import { Injectable } from '@angular/core';
import * as Store from 'electron-store';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  store: Store;
  constructor() {
    this.store = new Store();
  }

  set(object: { [key: string]: any });
  set(key: string, value: any);
  set() {
    if (arguments.length === 1) {
      return this.store.set(arguments[0]);
    }
    if (arguments.length === 2) {
      return this.store.set(arguments[0], arguments[1]);
    }
    throw 'invalid parameters';
  }

  get(key, _default?) {
    return this.store.get(key, _default);
  }

  has(key) {
    return this.store.has(key);
  }

  delete(key) {
    return this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }
}

