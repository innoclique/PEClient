import { Component, Input, OnInit } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { Label } from 'ng2-charts';
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
public clientSummaryBarChartLabels: Label[] = this.lastYears().toString().split(",");
public clientSummaryBarChartType: ChartType = 'bar';
public clientSummaryBarChartLegend = true;
public clientSummaryBarChartPlugins = [pluginDataLabels];
public clientSummaryBarChartData: ChartDataSets[] = [];
/**
 * =========End===========
 */

  constructor(public chartService:ChartService,private authService: AuthService) {
    
   }

  ngOnInit(): void {
    this.loginUser = this.authService.getCurrentUser();
    if(this.chartTypeInput==='CLIENT_SUMMARY'){
      this.clientSummaryBarChartData=[
        { data: [0, 0, 0, 0], label: 'License' },
        { data: [0, 0, 0, 0], label: 'Employees' }
      ];
      this.clientSummaryChartOptions.title.text="Client Summary - by usage";
    }else if(this.chartTypeInput==='STATUS' && this.userType==='Client'){
      this.clientSummaryBarChartData=[
        { data: [0, 0, 0, 0], label: 'Active' },
        { data: [0, 0, 0, 0], label: 'Inactive' }
      ];
      this.clientSummaryChartOptions.title.text="Client Summary - Status"
    }else if(this.chartTypeInput==='STATUS' && this.userType==='Reseller'){
      this.clientSummaryBarChartData=[
        { data: [0, 0, 0, 0], label: 'Active' },
        { data: [0, 0, 0, 0], label: 'Inactive' }
      ];
      this.clientSummaryChartOptions.title.text="Reseller Summary - Status"
    }else if(this.chartTypeInput === 'EVALUATION_SUMMARY'){
      this.clientSummaryBarChartData=[
        { data: [0, 0, 0, 0], label: 'Year-end' }
        
      ];
      this.clientSummaryChartOptions.title.text="Evaluation Summary"
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
    let back = 4;
    const year = new Date().getFullYear();
    return Array.from({length: back}, (v, i) => year - back + i + 1);
  }

}
