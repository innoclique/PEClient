import { Component, OnInit, Input, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import { AlertDialog } from '../../Models/AlertDialog';
// import { AlertDialog } from 'src/app/Models/AlertDialog';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css']
})
export class AlertComponent implements OnInit {

  public data: AlertDialog;
  constructor(
    private dialogRef: MatDialogRef<AlertComponent>, @Inject(MAT_DIALOG_DATA) data: any) {    
    this.data = data;
  }

  ngOnInit(): void {
  }
  close() {
    this.dialogRef.close('close');
  }
  save() {
    this.dialogRef.close('yes');
  }
}
