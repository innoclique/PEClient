import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluationslistComponent } from './evaluationslist.component';

describe('EvaluationslistComponent', () => {
  let component: EvaluationslistComponent;
  let fixture: ComponentFixture<EvaluationslistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EvaluationslistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EvaluationslistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
