import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';

import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { countriesData } from '../../shared/AppConstants/countries';
import { stateData } from '../../shared/AppConstants/states';
import { HttpClient } from '@angular/common/http';



@Component({
  selector: 'app-country-state-city',
  templateUrl: './country-state-city.component.html',
  styleUrls: ['./country-state-city.component.css']
})
export class CountryStateCityComponent implements OnInit {
 
  constructor( private fb: FormBuilder,
    private sHttp: HttpClient){} 

   countries: any[] = countriesData;
    
    public citys: any = [];
    
    
   
   states: any[] = stateData;
   public masterStates=this.states;
  //  citys: any[] = stateData;
  
 @Output()
 onSelect = new EventEmitter();

  filteredCountries: Observable<string[]>;
  filteredStates: Observable<string[]>;
  filteredCitys: Observable<string[]>;
  public countryForm: FormGroup;

  

  ngOnInit():void {
     this.countryForm = this.fb.group({ 
      Country: ['', [Validators.required]],
      State: ['', [Validators.required]],
      City: ['', [Validators.required]]
    });


       this.filteredCountries = this.countryForm.controls['Country'].valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );

    // this.filteredCitys = this.countryForm.controls['City'].valueChanges.pipe(
    //   startWith(''),
    //   map(value => this.city_filter(value))
    // ); 

  

  }

  get f(){
    return this.countryForm.controls;
  }


  private _filter(value: string): string[] {
    const filterValue = this._normalizeValue(value);
    return this.countries.filter(street => this._normalizeValue(street.name).includes(filterValue));
  }

  
  private state_filter(value: string): string[] {
    const filterValue = this._normalizeValue(value);
    return this.states.filter(street => this._normalizeValue(street.name).includes(filterValue));
  }

  private city_filter(value: string): string[] {
    const filterValue = this._normalizeValue(value);
    return this.citys.filter(street => this._normalizeValue(street.name).includes(filterValue));
  }



  private _normalizeValue(value: string): string {
    if(typeof value === 'string')
    return value.toLowerCase().replace(/\s/g, '');
  }

  displayFn(user: any) {
    return user && user.name ? user.name : '';
  }

  onCountrySelected(event){

   let selectedCountry = event.option.value;
   this.states=this.masterStates;
  
   this.countryForm.patchValue({State:''});
   this.countryForm.patchValue({City:''});

   this.states=this.states.filter(s => s.country_code==event.option.value.iso2);

   this.filteredStates = this.countryForm.controls['State'].valueChanges.pipe(
    startWith(''),
    map(value => this.state_filter(value))
  );

    this.onSelect.emit(this.countryForm.value);

  }



 async onStateSelected(event){
    this.citys=this.citys.filter(s => s.state_code==event.option.value.state_code);

            this.countryForm.patchValue({City:''});

const fileNo= this.getFileByCountryId(event.option.value.country_id);

            this.sHttp.get<any>(`assets/sgcitys${fileNo}.ts`).subscribe((data)=>{

             this.citys = data;
           this.citys=this.citys.filter(s => s.state_code==event.option.value.state_code);

           this.filteredCitys = this.countryForm.controls['City'].valueChanges.pipe(
            startWith(''),
            map(value => this.city_filter(value))
          ); 

           } )
        


 

     this.onSelect.emit(this.countryForm.value);
 
   }

   
   onCitySelected(event){

 
     this.onSelect.emit(this.countryForm.value);
 
   }

   getFileByCountryId(countryNo){

    if(countryNo>=1 && countryNo<=48 ){
      return '1-48'
    } else  if(countryNo>=49 && countryNo<=97 ){
      return '49-97'
    }else  if(countryNo>=98 && countryNo<=109 ){
      return '97-109'
    }else  if(countryNo>=110 && countryNo<=174 ){
      return '109-174'
    }else  if(countryNo>=175 && countryNo<=207 ){
      return '174-207'
    }else  if(countryNo>=208 && countryNo<=232 ){
      return '207-232'
    }else  if(countryNo>=233 && countryNo<=247 ){
      return '232-247'
    }

   }

}
