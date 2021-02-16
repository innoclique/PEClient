
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

// This class is used to enable or disable spinner
export class LoaderService {
  public isLoading = new Subject<boolean>();


  public constructor() {
  }

  /**
   * To show spinner
  */
  public show(): void {
    this.isLoading.next(true);
  }

  /**
   * To hide spinner
  */
  public hide(): void {
    this.isLoading.next(false);
  }
}
