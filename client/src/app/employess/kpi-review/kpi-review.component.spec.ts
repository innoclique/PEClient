import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiReviewComponent } from './kpi-review.component';

describe('KpiReviewComponent', () => {
  let component: KpiReviewComponent;
  let fixture: ComponentFixture<KpiReviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KpiReviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KpiReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
