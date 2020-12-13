import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportsResellerInfoComponent } from './resellerInfo.component';

describe('ReportsResellerInfoComponent', () => {
  let component: ReportsResellerInfoComponent;
  let fixture: ComponentFixture<ReportsResellerInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportsResellerInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportsResellerInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
