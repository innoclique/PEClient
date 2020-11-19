import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StrengthReviewComponent } from './strength-review.component';

describe('StrengthReviewComponent', () => {
  let component: StrengthReviewComponent;
  let fixture: ComponentFixture<StrengthReviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StrengthReviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StrengthReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
