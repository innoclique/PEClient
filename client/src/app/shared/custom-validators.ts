import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {


  static patternValidator(regex: RegExp, error: ValidationErrors, name): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      if (!control.value) {
        // if control is empty return no error
        return null;
      }
      var valid;
      
      if (name === 'hasAlphaNum') {
        valid = !regex.test(control.value)
        return valid ? null : error;
      }

      if (name === 'hasNameSplChars') {
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`]+/.test(control.value)) {
          valid = true;
          return valid ? null : error;
        }
        valid = !/[!@#$%^&*_+\=\[\]{};'"\\|<>\/?`]+/.test(control.value)
        return valid ? null : error;
      }

      if (name === 'hasAddressSplChars') {
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`]+/.test(control.value)) {
          valid = true;
          return valid ? null : error;
        }
        valid = !/[!@$%^*_+\=\[\]{};'"\\|<>?`]+/.test(control.value)
        return valid ? null : error;
      }

      if (name === 'hasPhoneSplChars') {

        if (/^[0-9]*$/.test(control.value)) {
          valid = true;
          return valid ? null : error;
        }

        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`]+/.test(control.value) || /^[a-zA-Z]*$/.test(control.value)) {
          valid = regex.test(control.value)
          return valid ? null : error;
        }

      }



      // test the value of the control against the regexp supplied
      valid = regex.test(control.value);

      // if true, return no error (no error), else return error passed in the second parameter
      return valid ? null : error;
    };
  }
}
