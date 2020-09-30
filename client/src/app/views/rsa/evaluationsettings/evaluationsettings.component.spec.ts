import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluationsettingsComponent } from './evaluationsettings.component';

describe('EvaluationsettingsComponent', () => {
  let component: EvaluationsettingsComponent;
  let fixture: ComponentFixture<EvaluationsettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EvaluationsettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EvaluationsettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
