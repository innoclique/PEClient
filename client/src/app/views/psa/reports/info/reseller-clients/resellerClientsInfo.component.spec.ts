import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResellerClientInfoComponent } from './resellerClientsInfo.component';

describe('ResellerClientInfoComponent', () => {
  let component: ResellerClientInfoComponent;
  let fixture: ComponentFixture<ResellerClientInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResellerClientInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResellerClientInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
