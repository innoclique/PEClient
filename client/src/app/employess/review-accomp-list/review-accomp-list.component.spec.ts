import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewAccompListComponent } from './review-accomp-list.component';

describe('ReviewAccompListComponent', () => {
  let component: ReviewAccompListComponent;
  let fixture: ComponentFixture<ReviewAccompListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReviewAccompListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewAccompListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
