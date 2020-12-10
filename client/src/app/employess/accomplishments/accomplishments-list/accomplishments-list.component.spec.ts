import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccomplishmentsListComponent } from './accomplishments-list.component';

describe('AccomplishmentsListComponent', () => {
  let component: AccomplishmentsListComponent;
  let fixture: ComponentFixture<AccomplishmentsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccomplishmentsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccomplishmentsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
