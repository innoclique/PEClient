import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiSetupComponent } from './kpi-setup.component';

describe('KpiSetupComponent', () => {
  let component: KpiSetupComponent;
  let fixture: ComponentFixture<KpiSetupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KpiSetupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KpiSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
