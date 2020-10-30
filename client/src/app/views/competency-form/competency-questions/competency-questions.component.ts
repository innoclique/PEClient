import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CompetencyBase } from '../../../Models/CompetencyFormModel';

@Component({
  selector: 'app-competency-questions',
  templateUrl: './competency-questions.component.html',
  styleUrls: ['./competency-questions.component.css']
})
export class CompetencyQuestionsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
  @Input() question: CompetencyBase<string>;
  @Input() form: FormGroup;
  get isValid() { return this.form.controls[this.question.key].valid; }
}
