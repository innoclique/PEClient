import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { CompetencyBase } from '../../../Models/CompetencyFormModel';
import { CompetencyFormService } from '../../../services/CompetencyFormService';

@Component({
  selector: 'app-competency-wrapper',
  templateUrl: './competency-wrapper.component.html',
  styleUrls: ['./competency-wrapper.component.css']
})
export class CompetencyWrapperComponent implements OnInit {

  @Input() questions: CompetencyBase<string>[] = [];
  @Input() form: FormGroup;
  @Input() comments:String;
  @Input() empComments: String;
  @Input() showEmployeeRatingColumn: boolean = true;
  @Input() disableManagerRatingField: boolean = false;
  @Input() currentUserRole: any;
  //form: FormGroup;
  payLoad = '';

  constructor(private qcs: CompetencyFormService) {
    
    }

  ngOnInit() {
    
    if(this.form){
      this.form.addControl('Comments', new FormControl())
      this.form.controls['Comments'].setValue(this.comments);
      this.form.addControl('EmpComments', new FormControl())
      this.form.controls['EmpComments'].setValue(this.empComments);

    }
   
  }

  onSubmit() {
    this.payLoad = JSON.stringify(this.form.getRawValue());
  }
}
