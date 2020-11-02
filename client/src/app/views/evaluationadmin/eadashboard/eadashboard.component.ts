import { Component, OnInit } from '@angular/core';
import { ChartType, ChartOptions } from 'chart.js';
import { Label } from 'ng2-charts';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import {EvaluationadminService} from '../../../services/evaluationadmin.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-eadashboard',
  templateUrl: './eadashboard.component.html',
  styleUrls: ['./eadashboard.component.css']
})
export class EadashboardComponent implements OnInit {
  pieChartLabelsList=[];
  pieChartLabelsValues=[];
  nextEvaluationObj:any;
  public pieChartOptions: ChartOptions;
  public pieChartLabels: Label[];
  public pieChartData: number[];
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = true;
  public pieChartPlugins;
  loginUser: any;

  columnDefs = [
    {headerName:'Employee',width:'180px' , field: 'name' ,sortable: true},
    { headerName:'Designation',width:'180px',field: 'designation' },
    { headerName:'# Overdue',width:'180px',field: 'noOfDays' }
];

rowData = [];

  constructor(public evaluationadminService:EvaluationadminService,
    private authService: AuthService,) {
      this.loginUser = this.authService.getCurrentUser();
      this.getEvalutionDashboardData();
      this.loadPie();
   }
   
  ngOnInit(): void {
  }
  getEvalutionDashboardData = ():any=>{
    let {_id} = this.loginUser;
    let requestBody:any={userId:_id}
     this.evaluationadminService.evaluationDashboard(requestBody).subscribe(evDashboardResponse => {
      let {chart} = evDashboardResponse;
      this.nextEvaluationObj = evDashboardResponse.next_evaluation;
      this.rowData = evDashboardResponse.overdue_evaluation;
      let statusList = chart.map(obj =>{ return [obj._id]});
      this.pieChartLabelsList = statusList;
      this.pieChartLabelsValues=chart.map(obj =>obj.count);
      this.loadPie();
     });
     
  }
  // Pie
  loadPie(){
    this.pieChartOptions = {
      responsive: true,
      legend: {
        position: 'top',
      },
      plugins: {
        datalabels: {
          formatter: (value, ctx) => {
            const label = ctx.chart.data.labels[ctx.dataIndex];
            return label;
          },
        },
      }
    };
    this.pieChartLabels = [...this.pieChartLabelsList];
    this.pieChartData = this.pieChartLabelsValues;
    this.pieChartPlugins = [pluginDataLabels];
  }
  
  
  
  
  public pieChartColors = [
    {
      backgroundColor: ['rgba(255,0,0,0.3)', 'rgba(0,255,0,0.3)', 'rgba(0,0,255,0.3)'],
    },
  ];
  


}
