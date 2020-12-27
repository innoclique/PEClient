import { TestBed } from '@angular/core/testing';

import { PaymentCaluculationService } from './payment-caluculation.service';

describe('PaymentCaluculationService', () => {
  let service: PaymentCaluculationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaymentCaluculationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
