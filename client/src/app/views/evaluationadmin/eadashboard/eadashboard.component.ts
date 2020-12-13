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
public barChartLabels: Label[] = ['Active','inprogress','Completed','not started'];
public barChartType: ChartType = 'bar';
public barChartLegend = true;
public barChartPlugins = [pluginDataLabels];

public barChartData: ChartDataSets[] = [
  { data: [0, 0, 0, 0], label: 'Status' }
  
];
public barChartColors: Color[] = [
  { backgroundColor: '#006ba9' },
  { backgroundColor: '#67b262' },
  { backgroundColor: '#FF9033' },
  { backgroundColor: '#F487E5' }
]




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
      let {chart} = evDashboardResponse;
      this.nextEvaluationObj = evDashboardResponse.next_evaluation;
      this.rowData = evDashboardResponse.overdue_evaluation;
      
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
    var pdf = new jsPDF('p', 'mm', 'a4');
    pdf.addImage(document.getElementsByTagName('canvas')[0].toDataURL(), 'JPEG', 0, 0,0,0);
    pdf.save("evaluations.pdf"); 
    
}

  

chartClicked(event){
  console.log(event)
}


}
