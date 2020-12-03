import { TestBed } from '@angular/core/testing';

import { EmService } from './em.service';

describe('EmService', () => {
  let service: EmService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
