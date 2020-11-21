import { TestBed } from '@angular/core/testing';

import { CsaService } from './csa.service';

describe('CsaService', () => {
  let service: CsaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CsaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
