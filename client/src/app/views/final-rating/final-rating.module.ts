import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewComponent } from './view/view.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { SharedModule } from '../../shared/shared.module';

const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Employee'
    },
    children: [{
      path: '',
      redirectTo: 'finalrating'
    },
    { path: 'finalrating', component: ViewComponent }]
  }
]

@NgModule({
  declarations: [ViewComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    TabsModule,
    AgGridModule.withComponents([]),
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class FinalRatingModule { }
