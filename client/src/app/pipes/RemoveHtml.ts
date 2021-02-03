import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'removeHtml',
    pure: true
})
export class RemoveHtml implements PipeTransform {

    transform(value: any, args?: any): any {
        if (value) {
           
         return value.replace( /(<([^>]+)>)/ig, '');;

        }
    }

}