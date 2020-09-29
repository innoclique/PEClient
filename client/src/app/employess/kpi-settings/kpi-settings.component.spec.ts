import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiSettingsComponent } from './kpi-settings.component';

describe('KpiSettingsComponent', () => {
  let component: KpiSettingsComponent;
  let fixture: ComponentFixture<KpiSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KpiSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KpiSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
