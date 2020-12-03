import { Component, OnInit } from '@angular/core';
import { EmployeeService } from '../../services/employee.service';
import { AuthService } from '../../services/auth.service';
import { Router,ActivatedRoute } from '@angular/router';

@Component({
  selector: 'employee-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class EmployeeDashboardComponent implements OnInit {
  currentRowItem:any;
  loginUser: any;
  peerReview:any;
  currentEvaluation:any;
  currentEvaluationProgress:any=0;
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

  constructor(private router: Router,public employeeService:EmployeeService,private authService: AuthService) {
    
   }

  ngOnInit(): void {
    this.loginUser = this.authService.getCurrentUser();
    this.loadDashboard();
  }
  loadDashboard(){
    let {_id} = this.loginUser;
    let requestBody:any={userId:_id}
    this.employeeService.dashboard(requestBody).subscribe(dashboardResponse => {
      console.log(dashboardResponse);
      this.peerReviewRowData = dashboardResponse['peer_review']['list'];
      this.currentEvaluation = dashboardResponse['current_evaluation'];
      this.previousEvaluation = dashboardResponse['previous_evaluation'];

      this.currentEvaluationProgress = this.currentEvaluation.status;

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
}
