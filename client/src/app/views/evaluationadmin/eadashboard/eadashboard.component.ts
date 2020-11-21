import { Component, OnInit } from '@angular/core';
import { ChartDataSets,ChartType, ChartOptions } from 'chart.js';
import { Label } from 'ng2-charts';
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
  enableDownload:any=true;

  columnDefs = [
    {headerName:'Employee',width:'180px' , field: 'name' ,sortable: true},
    { headerName:'Designation',width:'180px',field: 'designation' },
    { headerName:'# Overdue',width:'180px',field: 'noOfDays' }
];

rowData = [];

/**
 * Bar chat
 */

public barChartOptions: ChartOptions = {
  responsive: true,
  // We use these empty structures as placeholders for dynamic theming.
  scales: { xAxes: [{}], yAxes: [{}] },
  plugins: {
    datalabels: {
      anchor: 'end',
      align: 'end',
    }
  }
};
public barChartLabels: Label[] = ['Active','inprogress','completed','not started'];
public barChartType: ChartType = 'bar';
public barChartLegend = true;
public barChartPlugins = [pluginDataLabels];

public barChartData: ChartDataSets[] = [
  { data: [0, 0, 0, 0], label: 'Status' }
  
];




  constructor(
    public router: Router,
    private activatedRoute: ActivatedRoute,
    public evaluationadminService:EvaluationadminService,
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

      let barchatDataArray:any =[];
      this.barChartLabels.forEach((element,index) => {
        console.log(`element = ${element} ,i = ${index}`);
        let obj = chart.find(obj=>obj._id === element);
        console.log(obj);
        barchatDataArray[index]=obj.count;
      });
      let reducer = barchatDataArray.reduce((total,currentval)=>total+currentval);
      if(reducer>0){
        this.enableDownload = false;
      }
      
      this.barChartData[0].data = barchatDataArray;
      //this.loadPie();
     });
     
  }

  downloadCanvas() {
    // get the `<a>` element from click event
    //var anchor = event.target;
    // get the canvas, I'm getting it by tag name, you can do by id
    // and set the href of the anchor to the canvas dataUrl
   // anchor.href = document.getElementsByTagName('canvas')[0].toDataURL();
    // set the anchors 'download' attibute (name of the file to be downloaded)
    //anchor.download = "test.png";
    var pdf = new jsPDF('p', 'mm', 'a4');
    pdf.addImage(document.getElementsByTagName('canvas')[0].toDataURL(), 'JPEG', 0, 0,0,0);
    pdf.save("evaluations.pdf"); 
    
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
  
  public chartClicked({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
    this.router.navigate(['ea/evaluation-list']);
  }



}
