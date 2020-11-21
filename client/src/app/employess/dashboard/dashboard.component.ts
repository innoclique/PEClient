import { Component, OnInit } from '@angular/core';
import { EmployeeService } from '../../services/employee.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
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
    { headerName:'Title',width:'300px',field: 'title',sortable: true},
    { headerName:'Department',width:'300px', field: 'deparment' ,sortable: true,filter: true },
    { headerName:'Rating',width:'200px', field: 'rating' ,sortable: true,filter: true }
  ];
  peerReviewRowData = [];

  constructor(public employeeService:EmployeeService,private authService: AuthService) {
    
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
}
