import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CountryStateCityComponent } from './country-state-city.component';

describe('CountryStateCityComponent', () => {
  let component: CountryStateCityComponent;
  let fixture: ComponentFixture<CountryStateCityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CountryStateCityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CountryStateCityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
