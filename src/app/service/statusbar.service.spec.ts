/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { StatusbarService } from './statusbar.service';

describe('Service: Statusbar', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StatusbarService]
    });
  });

  it('should ...', inject([StatusbarService], (service: StatusbarService) => {
    expect(service).toBeTruthy();
  }));
});
