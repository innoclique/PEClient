import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewPerfGoalsComponent } from './review-perf-goals.component';

describe('ReviewPerfGoalsComponent', () => {
  let component: ReviewPerfGoalsComponent;
  let fixture: ComponentFixture<ReviewPerfGoalsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReviewPerfGoalsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewPerfGoalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
