import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CompetencyBase } from '../Models/CompetencyFormModel';

//import { QuestionBase } from './question-base';

@Injectable()
export class CompetencyFormService {
  constructor() { }

  toFormGroup(competencies: CompetencyBase<string>[] ) {      
      
    const group: any = {};
    competencies.forEach(question => {
      group[question.key] = question.required ? new FormControl(question.value || '', Validators.required)
                                              : new FormControl(question.value || '');
                                              console.log('qs',question)
                                              
    });
    
    return new FormGroup(group);
  }
}