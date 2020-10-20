import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StrengthsComponent } from './strengths.component';

describe('StrengthsComponent', () => {
  let component: StrengthsComponent;
  let fixture: ComponentFixture<StrengthsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StrengthsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StrengthsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
