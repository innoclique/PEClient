import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiReviewListComponent } from './kpi-review-list.component';

describe('KpiReviewListComponent', () => {
  let component: KpiReviewListComponent;
  let fixture: ComponentFixture<KpiReviewListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KpiReviewListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KpiReviewListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
