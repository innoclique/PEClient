import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientRevenueDetails } from './clientRevenueDetails';

describe('ReportsComponent', () => {
  let component: ClientRevenueDetails;
  let fixture: ComponentFixture<ClientRevenueDetails>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientRevenueDetails ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientRevenueDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
