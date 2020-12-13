import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResellerClientPurchaseHistory } from './resellerClientPurchaseHIstory';

describe('ReportsComponent', () => {
  let component: ResellerClientPurchaseHistory;
  let fixture: ComponentFixture<ResellerClientPurchaseHistory>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResellerClientPurchaseHistory ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResellerClientPurchaseHistory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
