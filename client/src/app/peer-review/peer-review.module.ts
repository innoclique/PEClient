import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PeerReviewListComponent } from './peer-review-list/peer-review-list.component';
import { DoPeerReviewComponent } from './do-peer-review/do-peer-review.component';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';
import { ModalModule } from 'ngx-bootstrap/modal';
import { SharedModule } from '../shared/shared.module';
import { CompetencyFormModule } from '../views/competency-form/competency-form.module';
import { AccordionModule } from 'ngx-bootstrap/accordion';



@NgModule({
  declarations: [PeerReviewListComponent, DoPeerReviewComponent],
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
export class PeerReviewModule { }
