import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewEvaluationListComponent } from './review-evaluation-list.component';

describe('ReviewEvaluationListComponent', () => {
  let component: ReviewEvaluationListComponent;
  let fixture: ComponentFixture<ReviewEvaluationListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReviewEvaluationListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewEvaluationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
