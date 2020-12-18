import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivateNotesListComponent } from './private-notes-list.component';

describe('PrivateNotesListComponent', () => {
  let component: PrivateNotesListComponent;
  let fixture: ComponentFixture<PrivateNotesListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrivateNotesListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivateNotesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
