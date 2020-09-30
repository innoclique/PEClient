import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SetupmodelComponent } from './setupmodel/setupmodel.component';


@NgModule({
  declarations: [SetupmodelComponent],
  imports: [
    CommonModule
  ],
  exports:[SetupmodelComponent]
})
export class QuestionsModule { }
