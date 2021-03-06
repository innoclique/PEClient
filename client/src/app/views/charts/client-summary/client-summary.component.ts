import { Component, Input, OnInit } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartScales, ChartType } from 'chart.js';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { Label,Color } from 'ng2-charts';
import {ChartService} from '../../../services/chart.service';
import { AuthService } from '../../../services/auth.service';
import * as moment from 'moment';
import { PerfAppService } from '../../../services/perf-app.service';
@Component({
  selector: 'app-client-summary',
  templateUrl: './client-summary.component.html',
  styleUrls: ['./client-summary.component.css']
})
export class ClientSummaryComponent implements OnInit {
@Input() userType:any;
@Input() chartTypeInput:any;
yearsList:any;
loginUser:any;
selectedYears:any=[];
currentOrganization:any;
chartYears:any;
@Input() set onselectChartType(chartType: any) {
  if(chartType){
    this.chartTypeInput = chartType;
  }
 }
 @Input() set onSelectYears(years: any) {
  console.log("inside:OnSelectYears@@");
  if(years && years.length>0){
    this.clientSummaryBarChartLabels= years.toString().split(",");
    this.chartYears = years;
    this.getClientSummaryChatData(this.chartTypeInput,this.chartYears);
  }else{
    this.clientSummaryBarChartLabels= this.lastYears().toString().split(",");
    this.chartYears = this.lastYears();
    this.getClientSummaryChatData(this.chartTypeInput,this.chartYears);
  }
    
 }
 
 @Input() set onSelectRevenue(years: any) {
  console.log("inside:onSelectRevenue:"+this.chartTypeInput);
  if(years && years.length>0){
    if(this.chartTypeInput === 'PSA_CLIENT_REVENUE'){
      this.getClientRevenueSummary("PURCHASE_SUMMARY",years[0]);
    }else if(this.chartTypeInput === 'PSA_RESELLER_REVENUE'){
      this.getClientRevenueSummary("RESELLER_PURCHASE_SUMMARY",years[0]);
    }
  }else{
    let currentYear = new Date().getFullYear();
    if(this.chartTypeInput === 'PSA_CLIENT_REVENUE'){
    this.getClientRevenueSummary("PURCHASE_SUMMARY",currentYear);
    }else if(this.chartTypeInput === 'PSA_RESELLER_REVENUE'){
      this.getClientRevenueSummary("RESELLER_PURCHASE_SUMMARY",currentYear);
    }
  }
  
  /*if(years && years.length>0){
    this.clientSummaryBarChartLabels= years.toString().split(",");
    this.chartYears = years;
    this.getClientSummaryChatData(this.chartTypeInput,this.chartYears);
  }else{
    this.clientSummaryBarChartLabels= this.lastYears().toString().split(",");
    this.chartYears = this.lastYears();
    this.getClientSummaryChatData(this.chartTypeInput,this.chartYears);
  } */
 }
 /**
  * this.getClientRevenueSummary("PURCHASE_SUMMARY");
    this.getClientRevenueSummary("RESELLER_PURCHASE_SUMMARY");
  */
/**
 * =========Start===========
 * Client Summary - by Usage chat
 */
public clientSummaryChartOptions: ChartOptions = {
  responsive: true,
  // We use these empty structures as placeholders for dynamic theming.
  scales: { xAxes: [{}], yAxes: [{}] },
  plugins: {
    datalabels: {
      anchor: 'end',
      align: 'end',
    }
  },
  legend: { position: 'bottom' },
  title:{text:`Client Summary`,position: 'top',display: true}
};
//public clientSummaryBarChartLabels: Label[] = this.lastYears().toString().split(",");
public clientSummaryBarChartLabels: Label[] = [];
public clientSummaryBarChartType: ChartType = 'bar';
public clientSummaryBarChartLegend = true;
public clientSummaryBarChartPlugins = [pluginDataLabels];
public clientSummaryBarChartData: ChartDataSets[] = [];
public barChartColors: Color[] = [
  { backgroundColor: '#006ba9' },
  { backgroundColor: '#67b262' },
]
/**
 * =========End===========
 */

  constructor(private perfApp: PerfAppService,public chartService:ChartService,private authService: AuthService) {
    console.log("====Constructor======")
    console.log(this.yearsList)
   }

  ngOnInit(): void {
    this.loginUser = this.authService.getCurrentUser();
    this.currentOrganization = this.loginUser.Organization;
    this.clientSummaryBarChartLabels= this.lastYears().toString().split(",");
    this.chartYears = this.lastYears();

    if(this.chartTypeInput==='CLIENT_SUMMARY'){
      let scales = { xAxes: [], yAxes: [
         {
           
              ticks: {
                beginAtZero: true,
                userCallback: function(label, index, labels) {
                  // when the floored value is the same as the value we have a whole number
                  if (Math.floor(label) === label) {
                      return label;
                  }

              },
              }
            }
      ] };

      this.clientSummaryBarChartData=[
        { data: [0, 0, 0, 0], label: 'License' },
        { data: [0, 0, 0, 0], label: 'Employees' }
      ];
      
      this.clientSummaryChartOptions.title.text="";
      this.clientSummaryChartOptions.scales=scales;
    }else if(this.chartTypeInput==='STATUS' && this.userType==='Client'){
      let scales = { xAxes: [], yAxes: [
        {
          
             ticks: {
               beginAtZero: true,
               userCallback: function(label, index, labels) {
                 // when the floored value is the same as the value we have a whole number
                 if (Math.floor(label) === label) {
                     return label;
                 }

             },
             }
           }
     ] };
      this.clientSummaryBarChartData=[
        { data: [0, 0, 0, 0], label: 'Active' },
        { data: [0, 0, 0, 0], label: 'Inactive' }
      ];
      this.clientSummaryChartOptions.title.text="";
      this.clientSummaryChartOptions.scales=scales;
    }else if(this.chartTypeInput==='STATUS' && this.userType==='Reseller'){
      this.clientSummaryBarChartData=[
        { data: [0, 0, 0, 0], label: 'Active' },
        { data: [0, 0, 0, 0], label: 'Inactive' }
      ];
      this.clientSummaryChartOptions.title.text=""
    }else if(this.chartTypeInput === 'EVALUATION_SUMMARY'){
      this.clientSummaryBarChartData=[
        { data: [0, 0, 0, 0], label: 'Year-end' }
        
      ];
      this.clientSummaryChartOptions.title.text="";
      let scales = { xAxes: [{scaleLabel: {
        display: true,
        labelString: "Evaluation Period",
       },}], yAxes: [
         {
            display: true,
            scaleLabel: {
            display: true,
            labelString: "Number of Evaluations",
              },
              ticks: {
                beginAtZero: true,
                userCallback: function(label, index, labels) {
                  // when the floored value is the same as the value we have a whole number
                  if (Math.floor(label) === label) {
                      return label;
                  }

              },
              }
            }
      ] };
       this.clientSummaryChartOptions.scales=scales;
    }else if(this.chartTypeInput === 'PSA_CLIENT_REVENUE'){
      this.clientSummaryBarChartData=[
        { data: [0,0,0,0,0,0,0,0,0,0,0,0], label: 'License' },
        { data: [0,0,0,0,0,0,0,0,0,0,0,0], label: '# of Employees' },
        //{ data: [180, 480, 770, 90, 1000, 270, 400], label: 'Series C', yAxisID: 'y-axis-1' }
      ];
      
      this.clientSummaryBarChartLabels = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August','September','October','November','December'];
       this.clientSummaryChartOptions={
        responsive: true,
        scales: {
          // We use this empty structure as a placeholder for dynamic theming.
          xAxes: [{}],
          yAxes: [
            {
              id: 'y-axis-0',
              position: 'left',
            },
            
          ]
        },
        
      };
      this.barChartColors = [
        { 
          backgroundColor: 'rgba(10,86,152,0.2)', 
          borderColor: 'rgba(10,86,152,1)',
           pointBackgroundColor: 'rgba(10,86,152,1)', 
           pointBorderColor: '#fff', 
           pointHoverBackgroundColor: '#fff', 
           pointHoverBorderColor: 'rgba(10,86,152,0.8)' 
          },
        { 
          backgroundColor: 'rgba(87,166,79,0.2)', 
           borderColor: 'rgba(87,166,79,1)', 
           pointBackgroundColor: 'rgba(87,166,79,1)', 
           pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(77,83,96,1)'
          }
      ];
      this.clientSummaryBarChartLegend= true;
      this.clientSummaryBarChartType = 'line';
    }
    else if(this.chartTypeInput === 'PSA_RESELLER_REVENUE'){
      this.clientSummaryBarChartData=[
        { data: [0,0,0,0,0,0,0,0,0,0,0,0], label: 'Reseller' },
        //{ data: [180, 480, 770, 90, 1000, 270, 400], label: 'Series C', yAxisID: 'y-axis-1' }
      ];
      
      this.clientSummaryBarChartLabels = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August','September','October','November','December'];
       this.clientSummaryChartOptions={
        responsive: true,
        scales: {
          // We use this empty structure as a placeholder for dynamic theming.
          xAxes: [{}],
          yAxes: [
            {
              id: 'y-axis-0',
              position: 'left',
            },
          ]
        },
        
      };
      this.barChartColors = [
        { 
          backgroundColor: 'rgba(10,86,152,0.2)', 
          borderColor: 'rgba(10,86,152,1)',
           pointBackgroundColor: 'rgba(10,86,152,1)', 
           pointBorderColor: '#fff', 
           pointHoverBackgroundColor: '#fff', 
           pointHoverBorderColor: 'rgba(10,86,152,0.8)' 
          },
        { 
          backgroundColor: 'rgba(87,166,79,0.2)', 
           borderColor: 'rgba(87,166,79,1)', 
           pointBackgroundColor: 'rgba(87,166,79,1)', 
           pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(77,83,96,1)'
          }
      ];
      this.clientSummaryBarChartLegend= true;
      this.clientSummaryBarChartType = 'line';
    }

    this.getClientSummaryChatData(this.chartTypeInput,this.chartYears);
    let currentYear = new Date().getFullYear();
    this.getClientRevenueSummary("PURCHASE_SUMMARY",currentYear);
    this.getClientRevenueSummary("RESELLER_PURCHASE_SUMMARY",currentYear);
  }
  getClientRevenueSummary(reportType,selectedYear){
    let {Organization,_id} = this.loginUser;
    let orgId = Organization._id;
    let revenueSummaryOptions:any={};
    revenueSummaryOptions.orgId=orgId;
    revenueSummaryOptions.reportType=reportType;
    revenueSummaryOptions.year=selectedYear;
    
    this.perfApp.route = "reports";
    //this.perfApp.method = "reports",
    this.perfApp.requestBody = revenueSummaryOptions;
    this.perfApp.CallAPI().subscribe(revenueSummary => {
      if(this.chartTypeInput==='PSA_CLIENT_REVENUE' && revenueSummary){
        let {employees,license} = revenueSummary;
        console.log("revenueSummary=>>"+JSON.stringify(revenueSummary));
        if(license && employees){
          this.clientSummaryBarChartData=[
            { data: [...license], label: 'License' },
            { data: [...employees], label: '# of Employees' },
          ];
        }
    }else if(this.chartTypeInput==='PSA_RESELLER_REVENUE'){
      let {data} = revenueSummary;
      if(data){
        this.clientSummaryBarChartData=[
          { data: [...data], label: 'Reseller' },
        ];
      }
    }
    });
  }
  getClientSummaryChatData(chartType,chartYears){
    console.log(chartYears);
    console.log(chartType);
    if(this.loginUser){
      let {Organization,_id} = this.loginUser;
      let orgId = Organization._id;
      let reqBody:any = {
        orgId:orgId,
        years:chartYears,
        chartType:chartType,
        userType:this.userType 
      };
      this.chartService.chartSummary(reqBody).subscribe(apiResponse => {
        console.log(apiResponse)
        let {ClientSummary,Evaluation} = apiResponse;
        if(this.chartTypeInput==='CLIENT_SUMMARY'){
          let {usage} =ClientSummary;
          this.clientSummaryBarChartData=usage.chartDataSets;
          this.clientSummaryBarChartLabels=usage.Label;
        }else if(this.chartTypeInput==='STATUS'){
          let {status} =ClientSummary;
          this.clientSummaryBarChartData=status.chartDataSets;
          this.clientSummaryBarChartLabels=status.Label;
        }else if(this.chartTypeInput === 'EVALUATION_SUMMARY'){
          let {summary} =Evaluation;
          this.clientSummaryBarChartData=summary.chartDataSets;
          this.clientSummaryBarChartLabels=summary.Label;
        }
        
      });
    }
    
  }

  lastYears(){
    let back = 4;
    let year;
    console.log("this.loginUser.UserType");
    if(this.loginUser){
      if(this.loginUser && this.loginUser.Role === "PSA" || this.loginUser.Role==="RSA"){
        year = new Date().getFullYear();
      }else{
        let orgStartEnd = this.getOrganizationStartAndEndDates();
        let EvaluationYear = orgStartEnd.start.format("YYYY");
        year = parseInt(EvaluationYear);
      }
      return Array.from({length: back}, (v, i) => year - back + i + 1);
    }
    return [];
  }
  getOrganizationStartAndEndDates(){
    if(this.currentOrganization){
      let Organization = this.currentOrganization;
      let {StartMonth,EndMonth,EvaluationPeriod} = Organization;
      StartMonth = parseInt(StartMonth);
      let currentMoment = moment();
      let evaluationStartMoment;
      let evaluationEndMoment
      if(EvaluationPeriod === "FiscalYear"){
        var currentMonth = parseInt(currentMoment.format('M'));
        console.log(`${currentMonth} <= ${StartMonth}`)
        if(currentMonth <= StartMonth){
          evaluationStartMoment = moment().month(StartMonth-1).startOf('month').subtract(1, 'years');
          evaluationEndMoment = moment().month(StartMonth-2).endOf('month');
          console.log(`${evaluationStartMoment.format("MM DD,YYYY")} = ${evaluationEndMoment.format("MM DD,YYYY")}`);
        }else{
          evaluationStartMoment = moment().month(StartMonth-1).startOf('month');
          evaluationEndMoment = moment().month(StartMonth-2).endOf('month').add(1, 'years');
          console.log(`${evaluationStartMoment.format("MM DD,YYYY")} = ${evaluationEndMoment.format("MM DD,YYYY")}`);
        }
      }else if(EvaluationPeriod === "CalendarYear"){
        evaluationStartMoment = moment().startOf('month');
        evaluationEndMoment = moment().month(0).endOf('month').add(1, 'years');
      }
      return {
        start:evaluationStartMoment,
        end:evaluationEndMoment
      }
    }
    
  }

}
