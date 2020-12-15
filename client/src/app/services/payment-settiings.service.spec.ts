import { TestBed } from '@angular/core/testing';

import { PaymentSettiingsService } from './payment-settiings.service';

describe('PaymentSettiingsService', () => {
  let service: PaymentSettiingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaymentSettiingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
