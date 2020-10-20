import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GridOptions } from 'ag-grid-community';

@Component({
  selector: 'app-create-goals',
  templateUrl: './create-goals.component.html',
  styleUrls: ['./create-goals.component.css']
})
export class CreateGoalsComponent implements OnInit {


  goalsItemRows = [];
  goalsActionItemsForm: FormGroup;
  goalsBuildForm: FormGroup;


  public goalsItemColumns: GridOptions = {
    columnDefs: this.getColDef()      
  }
  rowItemSubmitted: boolean;
  
  constructor(private formBuilder: FormBuilder) {
    
   }

  ngOnInit(): void {

    this.goalsBuildForm = this.formBuilder.group({
      RequireDate: ['', [Validators.required]],
      Category: ['', Validators.required],
      Other: [''],
      Urgent: [''],
      approvalList: ['', [Validators.required]],
      GoalActionItems: this.formBuilder.group({
        ActionStep: ['', [Validators.required]],
       
      })
    })
    this.goalsActionItemsForm = this.goalsBuildForm.get('GoalActionItems') as FormGroup;
  }








  getColDef(){
 return [
    { headerName: 'Task', field: 'Task', width: 150, autoHeight: true },
    { headerName: 'Meterial Description', field: 'Description', width: 170, autoHeight: true },
    { headerName: 'Make', field: 'Make', width: 100, autoHeight: true },
    { headerName: 'Qty', field: 'Qty', width: 80, autoHeight: true },
    { headerName: 'Units', field: 'Units', width: 80, autoHeight: true },
    { headerName: 'Notes', field: 'Notes', width: 175, autoHeight: true },
    {
      headerName: "Actions",
      suppressMenu: true,
      Sorting: false,
      width: 80,
      template: `
      <button type="button" style="cursor:pointer;     margin-top: 5px !important;"  class=" report_req_edit   ">
      <i class="fa fa-trash-alt" data-action-type="remove" ></i>
      </button> `

    }


  ];
}


addItemRow() {

  this.rowItemSubmitted = true;
  if (this.goalsActionItemsForm.invalid)
    return;

  this.goalsItemRows.push(this.goalsActionItemsForm.value);
  this.goalsActionItemsForm.reset();
  this.rowItemSubmitted = false;
}

}
