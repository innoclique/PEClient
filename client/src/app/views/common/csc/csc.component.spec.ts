import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CSCComponent } from './csc.component';

describe('CSCComponent', () => {
  let component: CSCComponent;
  let fixture: ComponentFixture<CSCComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CSCComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CSCComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
