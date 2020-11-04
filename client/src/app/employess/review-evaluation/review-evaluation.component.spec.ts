import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewEvaluationComponent } from './review-evaluation.component';

describe('ReviewEvaluationComponent', () => {
  let component: ReviewEvaluationComponent;
  let fixture: ComponentFixture<ReviewEvaluationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReviewEvaluationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewEvaluationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
