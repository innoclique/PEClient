import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResellerRevenueDetails } from './resellerRevenueDetails';

describe('ResellerRevenueDetails', () => {
  let component: ResellerRevenueDetails;
  let fixture: ComponentFixture<ResellerRevenueDetails>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResellerRevenueDetails ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResellerRevenueDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
