import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetupmodelComponent } from './setupmodel.component';

describe('SetupmodelComponent', () => {
  let component: SetupmodelComponent;
  let fixture: ComponentFixture<SetupmodelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetupmodelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetupmodelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
