import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetupclientComponent } from './setupclient.component';

describe('SetupclientComponent', () => {
  let component: SetupclientComponent;
  let fixture: ComponentFixture<SetupclientComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetupclientComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetupclientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
