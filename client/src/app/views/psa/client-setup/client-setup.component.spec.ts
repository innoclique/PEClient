import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientSetupComponent } from './client-setup.component';

describe('ClientSetupComponent', () => {
  let component: ClientSetupComponent;
  let fixture: ComponentFixture<ClientSetupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientSetupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
