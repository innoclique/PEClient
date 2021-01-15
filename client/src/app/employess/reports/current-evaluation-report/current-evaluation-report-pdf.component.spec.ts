import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentEvaluationReportPdfComponent } from './current-evaluation-report-pdf.component';

describe('CurrentEvaluationReportPdfComponent', () => {
  let component: CurrentEvaluationReportPdfComponent;
  let fixture: ComponentFixture<CurrentEvaluationReportPdfComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CurrentEvaluationReportPdfComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrentEvaluationReportPdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
