import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateGoalsComponent } from './create-goals.component';

describe('CreateGoalsComponent', () => {
  let component: CreateGoalsComponent;
  let fixture: ComponentFixture<CreateGoalsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateGoalsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateGoalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
