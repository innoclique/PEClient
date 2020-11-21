import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NumberDirective } from './numbersonly';



@NgModule({
  declarations: [
    NumberDirective
  ],
  imports: [
    CommonModule
  ]
})
export class AppDirectiveModule { }
