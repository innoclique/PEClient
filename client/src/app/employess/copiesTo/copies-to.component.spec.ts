import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CopiesToComponent } from './copies-to.component';

describe('CopiesToComponent', () => {
  let component: CopiesToComponent;
  let fixture: ComponentFixture<CopiesToComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CopiesToComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CopiesToComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
