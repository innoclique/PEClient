import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewActionPlanComponent } from './review-action-plan.component';

describe('ReviewActionPlanComponent', () => {
  let component: ReviewActionPlanComponent;
  let fixture: ComponentFixture<ReviewActionPlanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReviewActionPlanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewActionPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
