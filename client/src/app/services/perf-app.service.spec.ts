import { TestBed } from '@angular/core/testing';

import { PerfAppService } from './perf-app.service';

describe('PerfAppService', () => {
  let service: PerfAppService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PerfAppService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
