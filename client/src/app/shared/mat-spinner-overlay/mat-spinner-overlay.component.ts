import { Component, OnInit ,Input} from '@angular/core';

@Component({
  selector: 'app-spinner',
  templateUrl: './mat-spinner-overlay.component.html',
  styleUrls: ['./mat-spinner-overlay.component.css']
})
export class MatSpinnerOverlayComponent implements OnInit {
  @Input() value : number = 100;
  @Input() diameter: number = 100;
  @Input() mode : string ="indeterminate";
  @Input() strokeWidth : number = 10;
  @Input() overlay: boolean = false;
  @Input() color: string = "primary";
  constructor() { }

  ngOnInit(): void {
  }

}
