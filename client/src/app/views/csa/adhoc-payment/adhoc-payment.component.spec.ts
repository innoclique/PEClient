import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdhocPaymentComponent } from './adhoc-payment.component';

describe('AdhocPaymentComponent', () => {
  let component: AdhocPaymentComponent;
  let fixture: ComponentFixture<AdhocPaymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdhocPaymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdhocPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
