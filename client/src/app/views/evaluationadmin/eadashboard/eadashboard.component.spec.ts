import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EadashboardComponent } from './eadashboard.component';

describe('EadashboardComponent', () => {
  let component: EadashboardComponent;
  let fixture: ComponentFixture<EadashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EadashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EadashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
