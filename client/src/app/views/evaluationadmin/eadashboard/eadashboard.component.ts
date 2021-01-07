import { Component, OnInit } from '@angular/core';
import { ChartDataSets,ChartType, ChartOptions } from 'chart.js';
import { Label,Color } from 'ng2-charts';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import {EvaluationadminService} from '../../../services/evaluationadmin.service';
import { AuthService } from '../../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
//import * as jsPDF from 'jspdf';
import {jsPDF} from 'jspdf';
@Component({
  selector: 'app-eadashboard',
  templateUrl: './eadashboard.component.html',
  styleUrls: ['./eadashboard.component.css']
})
export class EadashboardComponent implements OnInit {
  nextEvaluationObj:any;
  
  loginUser: any;
  enableDownload:any=true;

  columnDefs = [
    {headerName:'Employee',width:'180px' , field: 'name' ,sortable: true},
    { headerName:'Designation',width:'180px',field: 'designation' },
    //{ headerName:'# Overdue',width:'180px',field: 'noOfDays' }
    { headerName:'Title',width:'180px',field: 'title' },
    { headerName:'Evaluation Status',width:'180px',field: 'status' }
];

rowData = [];



/**
 * 
 * Pie Chart
 */

 // Pie
 public pieChartOptions: ChartOptions = {
  responsive: true,
  legend: {
    position: 'top',
  },
  plugins: {
    datalabels: {
      formatter: (value, ctx) => {
        const label = ctx.chart.data.labels[ctx.dataIndex];
        return value;
      },
    },
  }
};

/*public pieChartLabels: Label[] = ['Employee Goals Completed', 'In Progress', 'Employee Goals Completed Test'];
public pieChartData: number[] = [300, 500, 100];
public pieChartType: ChartType = 'pie';
public pieChartLegend = true;*/

public pieChartLabels: Label[] = [];
public pieChartData: number[] = [];
public pieChartType: ChartType='pie';
public pieChartLegend=true;

public pieChartPlugins = [pluginDataLabels];
public pieChartColors = [
  {
    backgroundColor: ['rgba(255,0,0,0.3)', 'rgba(0,255,0,0.3)', 'rgba(0,0,255,0.3)'],
  },
];
// End Pie Chart
loadPieChat(labels:Label[],values:number[]){
  this.pieChartLabels = labels;
  this.pieChartData = values;
  this.pieChartType = 'pie';
  this.pieChartLegend = true;
  
  this.pieChartColors = [
    {
      backgroundColor: [
        '#F0E68C','#67b262','#00FFFF','#7FFFD4','#808000','#5F9EA0',
        '#6495ED','#008B8B','#B8860B','#006400','#BDB76B','#8FBC8F',
        '#1E90FF','#CD5C5C','#F0E68C','#20B2AA','#00FA9A','#808000'

      ],
    },
  ]
}
  constructor(
    public router: Router,
    public evaluationadminService:EvaluationadminService,
    private authService: AuthService,) {
      this.loginUser = this.authService.getCurrentUser();
      this.getEvalutionDashboardData();
      
   }
   
  ngOnInit(): void {
    
  }
  getEvalutionDashboardData = ():any=>{
    let {_id} = this.loginUser;
    let requestBody:any={userId:_id}
     this.evaluationadminService.evaluationDashboard(requestBody).subscribe(evDashboardResponse => {
      let {pieChart} = evDashboardResponse;
      this.loadPieChat(pieChart.labels,pieChart.numbers);
      if(pieChart && pieChart.labels && pieChart.labels.length>0){
        this.enableDownload=false;
      }
      this.nextEvaluationObj = evDashboardResponse.next_evaluation;
      this.rowData = evDashboardResponse.overdue_evaluation;
      
     });
     
  };

  
  

  downloadCanvas() {
    var pdf = new jsPDF('p', 'mm', 'a4');
    pdf.addImage(document.getElementsByTagName('canvas')[0].toDataURL(), 'JPEG', 0, 0,0,0);
    pdf.save("evaluations.pdf"); 
    
}

  

chartClicked(event){
  console.log(event)
}


}
