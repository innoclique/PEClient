import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientPurchaseHistory } from './clientPurchaseHIstory';

describe('ReportsComponent', () => {
  let component: ClientPurchaseHistory;
  let fixture: ComponentFixture<ClientPurchaseHistory>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientPurchaseHistory ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientPurchaseHistory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
