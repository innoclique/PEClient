import { TestBed } from '@angular/core/testing';

import { PsaService } from './psa.service';

describe('PsaService', () => {
  let service: PsaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PsaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
