import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewPerfGoalsListComponent } from './review-perf-goals-list.component';

describe('ReviewPerfGoalsListComponent', () => {
  let component: ReviewPerfGoalsListComponent;
  let fixture: ComponentFixture<ReviewPerfGoalsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReviewPerfGoalsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewPerfGoalsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
