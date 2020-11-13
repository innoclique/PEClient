import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { ModalModule } from 'ngx-bootstrap/modal';
import { SharedModule } from '../shared/shared.module';
import { CompetencyFormModule } from '../views/competency-form/competency-form.module';
import { DrReviewListComponent } from './dr-review-list/dr-review-list.component';
import { DoDrReviewComponent } from './do-dr-review/do-dr-review.component';


//DrReviewListComponent
@NgModule({
  declarations: [DrReviewListComponent,DoDrReviewComponent],
  imports: [
    
    CommonModule,    
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    AgGridModule.withComponents([]),
    ModalModule.forRoot(),
    SharedModule,    
    CompetencyFormModule,
    AccordionModule.forRoot(),
  ]
})
export class DRReviewModule { }
