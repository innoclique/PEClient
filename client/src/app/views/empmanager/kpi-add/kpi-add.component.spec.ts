import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiAddComponent } from './kpi-add.component';

describe('KpiAddComponent', () => {
  let component: KpiAddComponent;
  let fixture: ComponentFixture<KpiAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KpiAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KpiAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
