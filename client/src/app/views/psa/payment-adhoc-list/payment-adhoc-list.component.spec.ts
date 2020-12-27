import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentAdhocListComponent } from './payment-adhoc-list.component';

describe('PaymentAdhocListComponent', () => {
  let component: PaymentAdhocListComponent;
  let fixture: ComponentFixture<PaymentAdhocListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentAdhocListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentAdhocListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
