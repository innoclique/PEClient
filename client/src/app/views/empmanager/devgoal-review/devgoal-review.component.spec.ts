import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DevgoalReviewComponent } from './devgoal-review.component';

describe('DevgoalReviewComponent', () => {
  let component: DevgoalReviewComponent;
  let fixture: ComponentFixture<DevgoalReviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DevgoalReviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DevgoalReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
