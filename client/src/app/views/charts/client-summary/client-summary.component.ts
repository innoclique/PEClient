import { Component, Input, OnInit } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartScales, ChartType } from 'chart.js';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { Label,Color } from 'ng2-charts';
import {ChartService} from '../../../services/chart.service';
import { AuthService } from '../../../services/auth.service';
import * as moment from 'moment'

@Component({
  selector: 'app-client-summary',
  templateUrl: './client-summary.component.html',
  styleUrls: ['./client-summary.component.css']
})
export class ClientSummaryComponent implements OnInit {
@Input() userType:any;
@Input() chartTypeInput:any;
loginUser:any;
selectedYears:any=[];
currentOrganization:any;

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

  constructor(public chartService:ChartService,private authService: AuthService) {
    
   }

  ngOnInit(): void {
    this.loginUser = this.authService.getCurrentUser();
    this.currentOrganization = this.loginUser.Organization;
    this.clientSummaryBarChartLabels = this.lastYears().toString().split(",");
    if(this.chartTypeInput==='CLIENT_SUMMARY'){
      this.clientSummaryBarChartData=[
        { data: [0, 0, 0, 0], label: 'License' },
        { data: [0, 0, 0, 0], label: 'Employees' }
      ];
      
      this.clientSummaryChartOptions.title.text="";
    }else if(this.chartTypeInput==='STATUS' && this.userType==='Client'){
      this.clientSummaryBarChartData=[
        { data: [0, 0, 0, 0], label: 'Active' },
        { data: [0, 0, 0, 0], label: 'Inactive' }
      ];
      this.clientSummaryChartOptions.title.text=""
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
    }

    this.getClientSummaryChatData(this.chartTypeInput);
  }

  getClientSummaryChatData(chartType){
    let {Organization,_id} = this.loginUser;
    let orgId = Organization._id;
    let reqBody:any = {
      orgId:orgId,
      years:this.lastYears(),
      chartType:chartType,
      userType:this.userType 
    };
    this.chartService.chartSummary(reqBody).subscribe(apiResponse => {
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

  lastYears(){
    let orgStartEnd = this.getOrganizationStartAndEndDates();
    let EvaluationYear = orgStartEnd.start.format("YYYY");
    console.log(`EvaluationYear : ${EvaluationYear}`)
    let back = 4;
    const year = parseInt(EvaluationYear);
    return Array.from({length: back}, (v, i) => year - back + i + 1);
  }

  getOrganizationStartAndEndDates(){
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
      end:evaluationStartMoment
    }
  }

}
