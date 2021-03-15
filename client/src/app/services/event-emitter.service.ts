import { Injectable, EventEmitter, Output } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';

@Injectable({
  providedIn: 'root',
})
export class EventEmitterService {

  private selectedEmp: Subject<any> = new Subject<any>();


  public getSelectedEmp() {
    return this.selectedEmp.asObservable();

  }


  public selectedEmpObserver(value: any) {
    this.selectedEmp.next(value);
  }

  @Output() search: EventEmitter<string> = new EventEmitter();
  toggle(value: any) {
    this.search.emit(value);
  }
}
