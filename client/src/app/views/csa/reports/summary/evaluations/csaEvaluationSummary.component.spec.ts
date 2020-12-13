import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CSAPaymentSummary } from './csaPaymentSummary.component';

describe('ReportsComponent', () => {
  let component: CSAPaymentSummary;
  let fixture: ComponentFixture<CSAPaymentSummary>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CSAPaymentSummary ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CSAPaymentSummary);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
