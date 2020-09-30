import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetupModelComponent } from './setup-model.component';

describe('SetupModelComponent', () => {
  let component: SetupModelComponent;
  let fixture: ComponentFixture<SetupModelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetupModelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetupModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
