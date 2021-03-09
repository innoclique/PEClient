import { Component, OnInit,ViewChild,Input } from '@angular/core';
import { environment } from '../../../../environments/environment';
import {FormControl} from '@angular/forms';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  clientSummaryByUsage: string[];
  clientSummaryByStatus: string[];
  clientSummaryByStatusReseller: string[];
  clientRevenue: string[];
  resellerRevenue: string[];
  clientSummaryUsageForm = new FormControl();
  clientSummaryStatusForm = new FormControl();
  clientRevenueForm = new FormControl();
  resellerRevenueForm = new FormControl();
  yearsList: string[] = [];
  chartTypeInput:string;
  constructor() { 
    this.yearsList = this.loadXAxisYears();
  }
  ngOnInit(): void {
  }
  loadXAxisYears(){
    let startYear = environment.START_YEAR;
    let endYear = new Date().getFullYear();
    let step=1;
    let years=[];
    for(let i = startYear; i <= endYear; i += step){
        years.push(i);
    }
    return years;
  }
  clientSummaryByUsageChanged(chartType,userType){
    this.chartTypeInput=chartType;
    switch (chartType) {
      case 'CLIENT_SUMMARY':
          if (this.clientSummaryUsageForm.value.length < 5) {
            this.clientSummaryByUsage = this.clientSummaryUsageForm.value;
          } else {
            this.clientSummaryUsageForm.setValue(this.clientSummaryByUsage);
          }
        break;
      case 'STATUS':
        if(userType == 'Client'){
          if (this.clientSummaryStatusForm.value.length < 5) {
            this.clientSummaryByStatus = this.clientSummaryStatusForm.value;
          } else {
            this.clientSummaryStatusForm.setValue(this.clientSummaryByStatus);
          }
          break;
        }
        if(userType == 'Reseller'){
          if (this.clientSummaryStatusForm.value.length < 5) {
            this.clientSummaryByStatusReseller = this.clientSummaryStatusForm.value;
          } else {
            this.clientSummaryStatusForm.setValue(this.clientSummaryByStatusReseller);
          }
          break;
        }
      case 'PSA_CLIENT_REVENUE':
        if (this.clientRevenueForm.value.length < 2) {
          this.clientRevenue = this.clientRevenueForm.value;
        } else {
          this.clientRevenueForm.setValue(this.clientRevenue);
        }
      case 'PSA_RESELLER_REVENUE':
          if (this.resellerRevenueForm.value.length < 2) {
            this.resellerRevenue = this.resellerRevenueForm.value;
          } else {
            this.resellerRevenueForm.setValue(this.resellerRevenue);
          }
    
      default:
        break;
    }
    
  }
  
}
