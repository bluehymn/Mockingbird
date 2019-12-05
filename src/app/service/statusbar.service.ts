import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import * as cuid from 'cuid';

@Injectable({
  providedIn: 'root'
})
export class StatusbarService {
  syncQueue = [];
  syncingQueueLength$ = new Subject<number>();
  constructor() {}

  pushSyncQueue() {
    const syncItemId = cuid();
    this.syncQueue.push(syncItemId);
    this.syncingQueueLength$.next(this.syncQueue.length);
    return syncItemId;
  }

  popSyncQueue(itemId) {
    for (let i = 0; i < this.syncQueue.length; i++) {
      if (itemId === this.syncQueue[i]) {
        this.syncQueue.splice(i, 1);
        continue;
      }
    }
    this.syncingQueueLength$.next(this.syncQueue.length);
  }
}
