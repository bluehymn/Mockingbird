/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { IndexedDBService } from './indexedDB.service';

describe('Service: IndexedDB', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IndexedDBService]
    });
  });

  it('should ...', inject([IndexedDBService], (service: IndexedDBService) => {
    expect(service).toBeTruthy();
  }));
});
