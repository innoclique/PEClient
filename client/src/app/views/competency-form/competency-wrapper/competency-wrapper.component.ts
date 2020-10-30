import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
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
  //form: FormGroup;
  payLoad = '';

  constructor(private qcs: CompetencyFormService) {  }

  ngOnInit() {
    debugger
   // this.form = this.qcs.toFormGroup(this.questions);
  }

  onSubmit() {
    this.payLoad = JSON.stringify(this.form.getRawValue());
  }
}
