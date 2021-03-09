import { Component, OnInit,ViewChild } from '@angular/core';
import {RsaService} from '../../../services/rsa.service';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Color, BaseChartDirective, Label } from 'ng2-charts';
import * as pluginAnnotations from 'chartjs-plugin-annotation';
import { environment } from '../../../../environments/environment';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardRSAComponent implements OnInit {
  clientSummaryByUsage: string[];
  yearsList: string[] = [];
chartTypeInput:string;
clientSummaryByStatus: string[];
  dashboardData:any;
  clientSummaryUsageForm = new FormControl();
  clientSummaryStatusForm = new FormControl();
  
  constructor(public rsaService:RsaService) { 
    this.yearsList = this.loadXAxisYears();
    this.rsaService.rsaDashboard().subscribe(apiResponse => {
      this.dashboardData = apiResponse;
    });
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
    
      default:
        break;
    }
    
  }
  ngOnInit(): void {
  }

  /**
   * Chart
   */
  public lineChartData: ChartDataSets[] = [
    { data: [65, 59, 80, 81, 56, 55, 40], label: 'Clients' },
    { data: [28, 48, 40, 19, 86, 27, 90], label: 'Product' },
    { data: [180, 480, 770, 90, 1000, 270, 400], label: 'Licences', yAxisID: 'y-axis-1' }
  ];
  public lineChartLabels: Label[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  public lineChartOptions: (ChartOptions & { annotation: any }) = {
    responsive: true,
    scales: {
      // We use this empty structure as a placeholder for dynamic theming.
      xAxes: [{}],
      yAxes: [
        {
          id: 'y-axis-0',
          position: 'left',
        },
        {
          id: 'y-axis-1',
          position: 'right',
          gridLines: {
            color: 'rgba(255,0,0,0.3)',
          },
          ticks: {
            fontColor: 'green',
          }
        }
      ]
    },
    annotation: {
      annotations: [
        {
          type: 'line',
          mode: 'vertical',
          scaleID: 'x-axis-0',
          value: 'March',
          borderColor: 'orange',
          borderWidth: 2,
          label: {
            enabled: true,
            fontColor: 'orange',
            content: 'LineAnno'
          }
        },
      ],
    },
  };
  public lineChartColors: Color[] = [
    { // grey
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    },
    { // dark grey
      backgroundColor: 'rgba(77,83,96,0.2)',
      borderColor: 'rgba(77,83,96,1)',
      pointBackgroundColor: 'rgba(77,83,96,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(77,83,96,1)'
    },
    { // green
      backgroundColor: 'rgba(255,0,0,0.3)',
      borderColor: 'green',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }
  ];
  public lineChartLegend = true;
  public lineChartType: ChartType = 'line';
  public lineChartPlugins = [pluginAnnotations];
  @ViewChild(BaseChartDirective, { static: true }) chart: BaseChartDirective;


  chartClicked(event){
    console.log(event)
  }
  
  chartHovered(event){
    console.log(event)
  }

}
