import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetupEmployeeComponent } from './setup-employee.component';

describe('SetupEmployeeComponent', () => {
  let component: SetupEmployeeComponent;
  let fixture: ComponentFixture<SetupEmployeeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetupEmployeeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetupEmployeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
