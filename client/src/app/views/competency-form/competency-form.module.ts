import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompetencyQuestionsComponent } from './competency-questions/competency-questions.component';
import { CompetencyWrapperComponent } from './competency-wrapper/competency-wrapper.component';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { CompetencyFormService } from '../../services/CompetencyFormService';



@NgModule({
  declarations: [CompetencyQuestionsComponent, CompetencyWrapperComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule
    
  ],
  exports:[CompetencyWrapperComponent],
  providers:[CompetencyFormService]

})
export class CompetencyFormModule { }
