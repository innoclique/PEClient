import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewActionPlanListComponent } from './review-action-plan-list.component';

describe('ReviewActionPlanListComponent', () => {
  let component: ReviewActionPlanListComponent;
  let fixture: ComponentFixture<ReviewActionPlanListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReviewActionPlanListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewActionPlanListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
