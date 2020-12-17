
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { countriesData } from '../../../shared/AppConstants/countries';
import { stateData } from '../../../shared/AppConstants/states';

@Component({
  selector: 'app-csc',
  templateUrl: './csc.component.html',
  styleUrls: ['./csc.component.css']
})
export class CSCComponent implements OnInit,OnChanges {
 
@Input()
showValidateMsg:boolean=false;

isCSelect=false;
isStateSelect=false;


@Input() set reset(value: boolean) {
 if (value) {
   this.countryForm.reset();
   this.countryForm.patchValue({Country:''});
 }
}



@Input() set CSCData(value) {
 
  if (value &&value.Country) {
    this.isCSelect=true;
    if (value &&value.State)
    this.isStateSelect=true;

    let country=this.countries.filter(e=>e.name==value.Country)[0];
    this.countryForm.patchValue({Country:country});

    this.states=this.states.filter(s => s.country_code==country.iso2);

    this.filteredStates = this.countryForm.controls['State'].valueChanges.pipe(
     startWith(''),
     map(value => this.state_filter(value))
   );
    this.countryForm.patchValue({State:this.masterStates.filter(e=>e.name==value.State)[0]});
  
     this.countryForm.patchValue({City:value.City});
  
    // this.sHttp.get<any>(`assets/sgcitys${this.getFileByCountryId(country.id)}.ts`).subscribe((data)=>{

    //   const citys = data;
    //   this.countryForm.patchValue({City:citys.filter(e=>e.name==value.City)[0]});

    // } )
  
  }
 }

  constructor( private fb: FormBuilder,
    private sHttp: HttpClient){

      this.countryForm = this.fb.group({ 
        Country: ['', [Validators.required]],
        State: ['', [Validators.required]],
        City: ['', [Validators.required]]
      });


    } 
  ngOnChanges(changes: SimpleChanges): void {
  
  }

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

 
  cInputChange(){
    this.isCSelect=false;
  }
  sInputChange(){
    this.isStateSelect=false;
  }

  checkIsSelected(){
    
   if(!this.isCSelect)
   this.countryForm.patchValue({Country:''});
  
  }
  checkIsStateSelected(){
   
    if(!this.isStateSelect)
    this.countryForm.patchValue({State:''});
 
   }

  onCountrySelected(event){

    this.isCSelect=true;

   let selectedCountry = event.option.value;
   this.states=this.masterStates;
  
   this.countryForm.patchValue({Country:selectedCountry});

   this.countryForm.patchValue({State:''});
   this.countryForm.patchValue({City:''});

   this.states=this.states.filter(s => s.country_code==event.option.value.iso2);

   this.filteredStates = this.countryForm.controls['State'].valueChanges.pipe(
    startWith(''),
    map(value => this.state_filter(value))
  );

  if(this.isCSelect)
    this.onSelect.emit(this.countryForm.value);

  }



 async onStateSelected(event){
   this.isStateSelect=true;
   this.countryForm.patchValue({State:event.option.value});
    this.citys=this.citys.filter(s => s.state_code==event.option.value.state_code);

            this.countryForm.patchValue({City:''});

// const fileNo= this.getFileByCountryId(event.option.value.country_id);

//             this.sHttp.get<any>(`assets/sgcitys${fileNo}.ts`).subscribe((data)=>{

//              this.citys = data;
//            this.citys=this.citys.filter(s => s.state_code==event.option.value.state_code);

//            this.filteredCitys = this.countryForm.controls['City'].valueChanges.pipe(
//             startWith(''),
//             map(value => this.city_filter(value))
//           ); 

//            } )
        


 

     this.onSelect.emit(this.countryForm.value);
 
   }

   
   onCitySelected(event){

    let cscObject=this.countryForm.value;
    cscObject.City={name:event.target.value}
     this.onSelect.emit(cscObject);
 
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

