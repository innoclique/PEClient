import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluationSettingsComponent } from './evaluation-settings.component';

describe('EvaluationSettingsComponent', () => {
  let component: EvaluationSettingsComponent;
  let fixture: ComponentFixture<EvaluationSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EvaluationSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EvaluationSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
