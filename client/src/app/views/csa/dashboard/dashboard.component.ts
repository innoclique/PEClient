import { Component, OnInit } from '@angular/core';
import { FlashMessagesService } from 'angular2-flash-messages';
import { AuthService } from '../../../services/auth.service';
import { CsaService } from '../../../services/csa.service';
import { ChartDataSets,ChartType, ChartOptions } from 'chart.js';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { Label } from 'ng2-charts';
import { Router } from '@angular/router';
import {FormControl} from '@angular/forms';
import * as moment from 'moment/moment';
@Component({
  selector: 'app-csa-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardCSAComponent implements OnInit {
  currentUser:any;
  chartTypeInput:any;
  currentStatus:any = {
    completed:'N/A',
    inprogress:'N/A',
    evaluations_left:'N/A',
    renewalDate:'N/A'
  }
  evaluationSummaryForm = new FormControl();
  evaluationSummary: string[];
  yearsList: any=[];
  currentOrganization:any;
  constructor(
    private router: Router,
    private _flashMessagesService: FlashMessagesService,
    public authService: AuthService,
    private csaService: CsaService,
    ) { 
    this.currentUser = this.authService.getCurrentUser();
    this.currentOrganization = this.authService.getOrganization();
    this.yearsList = this.loadXAxisYears();
  }
  loadXAxisYears(){
    let orgStartYear = moment(this.currentOrganization.CreatedOn).format("YYYY");
    let startYear = Number(orgStartYear);
    let endYear = new Date().getFullYear();
    let step=1;
    let years=[];
    for(let i = startYear; i <= endYear; i += step){
        years.push(i);
    }
    years = this.evaluationYearFormat(years);
    return years;
  }
  evaluationYearFormat(years){
    let Organization = this.currentOrganization;
    let {StartMonth,EndMonth,EvaluationPeriod} = Organization;
    StartMonth = parseInt(StartMonth);
    let evaluationYears:any = [];
    for(var i=0;i<years.length;i++){
        let yearObj:any = {};
        yearObj.value = ""+years[i];
        let evaluationStartMoment;
        let evaluationEndMoment;
        if(EvaluationPeriod === "FiscalYear"){
            evaluationStartMoment = moment([years[i],StartMonth-1]);
            evaluationEndMoment = moment([years[i]+1,StartMonth-2]);
        }
        if(EvaluationPeriod === "CalendarYear"){
            evaluationStartMoment = moment([years[i],0]);
            evaluationEndMoment = moment([years[i],11]);
        }
        yearObj.label = `${evaluationStartMoment.format("MMM'YY")} To ${evaluationEndMoment.format("MMM'YY")}`
        evaluationYears.push(yearObj);
    }
    return evaluationYears;
  }
  clientSummaryByUsageChanged(chartType,userType){
    this.chartTypeInput=chartType;
    switch (chartType) {
      case 'EVALUATION_SUMMARY':
          if (this.evaluationSummaryForm.value.length < 5) {
            this.evaluationSummary = this.evaluationSummaryForm.value;
          } else {
            this.evaluationSummaryForm.setValue(this.evaluationSummary);
          }
        break;
      default:
        break;
    }
    
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }
  showAlert(msg){
    this._flashMessagesService.show(msg, { cssClass: 'alert-danger', timeout: 1500 });
  }

  loadDashboardData(){
    let reqBody:any = {};
    reqBody.userId = this.currentUser._id;
    this.csaService.psaDashboard(reqBody).subscribe(c => {
      this.currentStatus = c.current_status;
    });
  }
  chartClicked(event){
console.log(event)
  }

  navigateEvaluation(){
    this.router.navigate(['csa/reports/evaluationsSummary',{}],{ skipLocationChange: true });
  }
  loadPriceListPage(){
    this.router.navigate(['psa/price-list'],{ skipLocationChange: true });
  }
}
