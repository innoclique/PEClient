import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateResellerComponent } from './create-reseller.component';

describe('CreateResellerComponent', () => {
  let component: CreateResellerComponent;
  let fixture: ComponentFixture<CreateResellerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateResellerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateResellerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
