import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportsClientRevenueInfoComponent } from './clientRevenueInfo.component';

describe('ReportsClientRevenueInfoComponent', () => {
  let component: ReportsClientRevenueInfoComponent;
  let fixture: ComponentFixture<ReportsClientRevenueInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportsClientRevenueInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportsClientRevenueInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
