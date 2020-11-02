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

  constructor(public employeeService:EmployeeService,private authService: AuthService) {
    this.loginUser = this.authService.getCurrentUser();
    this.loadDashboard();
   }

  ngOnInit(): void {
  }
  loadDashboard(){
    let {_id} = this.loginUser;
    let requestBody:any={userId:_id}
    this.employeeService.dashboard(requestBody).subscribe(dashboardResponse => {
      console.log(dashboardResponse);
      this.peerReview = dashboardResponse['peer_review']
    })
  }
}
