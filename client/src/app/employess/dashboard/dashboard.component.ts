import { Component, OnInit, Input } from '@angular/core';
import { EmployeeService } from '../../services/employee.service';
import { AuthService } from '../../services/auth.service';
import { Router,ActivatedRoute } from '@angular/router';
import { ChartDataSets, ChartOptions, ChartScales, ChartType } from 'chart.js';
import { Label,Color } from 'ng2-charts';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import {ChartService} from '../../../app/services/chart.service'

@Component({
 selector: 'employee-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class EmployeeDashboardComponent implements OnInit {
@Input()   userType:any;
 @Input() chartTypeInput:any;
selectedYears:any=[];

  currentRowItem:any;
  loginUser: any;
  peerReview:any;
  currentEvaluation:any;
  currentEvaluationProgress:any=0;
  currentEvaluationProgressTitle:any='N/A';
  previousEvaluation:any={
    'period':'N/A',
    'rating':'N/A',
    'peer_review':'N/A'
  };
  peerreviewColumnDefs = [
    { headerName:'Peer',width:'220px',field: 'peer',sortable: true},
    { headerName:'Title',width:'200px',field: 'title',sortable: true},
    { headerName:'Department',width:'250px', field: 'deparment' ,sortable: true,filter: true },
    { headerName:'Days Remaining',width:'200px', field: 'daysRemaining' ,sortable: true,filter: true },
    { headerName:'Action',width:'100px',
    cellRenderer: (data) => {
      let actionlinks=''
             actionlinks= `
            
             <i class="icon-eye font-1xl" style="cursor:pointer ;padding: 7px 20px 0 0;
          font-size: 17px;" data-action-type="doreview" title="View Rating"></i>  
             
             `
            return actionlinks
            ;
           },
          }
  ];
  peerReviewRowData = [];

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
public barChartColors: Color[] = [
  { backgroundColor: '#006ba9' },
  { backgroundColor: '#67b262' },
]
/**
 * =========End===========
 */

  constructor(private router: Router,public employeeService:EmployeeService,private authService: AuthService,public  chartService:ChartService) {
    
   }

  ngOnInit(): void {
    this.loginUser = this.authService.getCurrentUser();
    this.loadDashboard();
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
      this.clientSummaryChartOptions.title.text="Evaluation Summary";
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

  // FOR CHART
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
  // FOR CHART
  loadDashboard(){
    let {_id} = this.loginUser;
    let requestBody:any={userId:_id}
    this.employeeService.dashboard(requestBody).subscribe(dashboardResponse => {
      console.log(dashboardResponse);
      if(dashboardResponse['peer_review'] &&  dashboardResponse['peer_review']['list']){
        this.peerReviewRowData = dashboardResponse['peer_review']['list'];
      }
      this.currentEvaluation = dashboardResponse['current_evaluation'];
      this.previousEvaluation = dashboardResponse['previous_evaluation'];
      this.currentEvaluationProgress = this.currentEvaluation.status;
      this.currentEvaluationProgressTitle = this.currentEvaluation.status_title || "N/A";

    })
  }

  public onGridRowClick(e) {
    if (e.event.target !== undefined) {
      this.currentRowItem = e.data;

      let actionType = e.event.target.getAttribute("data-action-type");
      switch (actionType) {

        case "doreview":
          this.doReview();
          break;
        default:
      }
    }
  }
  doReview() {
    console.log('currentreview  item',this.currentRowItem)
    this.router.navigate(['employee/submitpeerreview', { EvaluationId: this.currentRowItem.EvaluationId,
      EmployeeId:this.currentRowItem.employeeId }], { skipLocationChange: true });
  }

    reviewEvalForm(action,actor) {
      this.router.navigate(['employee/review-evaluation',
      { action: action, empId: this.currentRowItem._id,actor:actor,empManagerId:this.currentRowItem.Manager 
        ,empName: this.currentRowItem.Name}
    ], { skipLocationChange: true });
  }
}
