import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentEvaluationReportComponent } from './current-evaluation-report.component';

describe('CurrentEvaluationReportComponent', () => {
  let component: CurrentEvaluationReportComponent;
  let fixture: ComponentFixture<CurrentEvaluationReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CurrentEvaluationReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrentEvaluationReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
