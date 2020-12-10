import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewAccomplishmentsComponent } from './review-accomplishments.component';

describe('ReviewAccomplishmentsComponent', () => {
  let component: ReviewAccomplishmentsComponent;
  let fixture: ComponentFixture<ReviewAccomplishmentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReviewAccomplishmentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewAccomplishmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
