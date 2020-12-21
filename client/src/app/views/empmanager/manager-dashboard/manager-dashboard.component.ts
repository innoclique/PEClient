import { Component, OnInit } from '@angular/core';
import {EmService} from '../../../services/em.service';
import { AuthService } from '../../../services/auth.service';
import { Router,ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-manager-dashboard',
  templateUrl: './manager-dashboard.component.html',
  styleUrls: ['./manager-dashboard.component.css']
})
export class ManagerDashboardComponent implements OnInit {

  currentRowItem:any;
  dashboardData:any;
  loginUser: any;
  evaluationsColumnDefs = [
    { headerName:'Name',width:'100px',field: 'name',sortable: true},
    { headerName:'Status',width:'180px',field: 'status',sortable: true},
    { headerName:'Action',width:'280px',
    cellRenderer: (data) => {
      let actionlinks=''
             actionlinks= `
            
             <a data-action-type="doevaluationreview" href="javascript:void(0)">View</> |  <a data-action-type="doevaluationreview" href="javascript:void(0)">Sign-off</a> | <a href="javascript:void(0)">Request Peer Review<a/>
             
             `
            return actionlinks
            ;
           },
          }
  ];
  evaluationsRowData = [];

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


  constructor(private router: Router,public emService:EmService,private authService: AuthService) {
    
   }
   
  ngOnInit(): void {
    this.loginUser = this.authService.getCurrentUser();
    this.loadDashboard();
  }
  loadDashboard(){
    let {Organization,_id} = this.loginUser;
    console.log(JSON.stringify(this.loginUser,null,5))
    let orgId = Organization._id;
    let payload:any={userId:_id,orgId:orgId}
    this.emService.emDashboard(payload).subscribe(apiResponse => {
      this.evaluationsRowData = apiResponse.current_evaluation.list;
      this.peerReviewRowData = apiResponse['peer_review']['list'];
    });
  }

  public onGridRowClick(e) {
    if (e.event.target !== undefined) {
      this.currentRowItem = e.data;
      //doevaluationreview
      let actionType = e.event.target.getAttribute("data-action-type");
      console.log(actionType)
      switch (actionType) {
        case "doreview":
          this.doReview();
          break;
        case "doevaluationreview":
          this.reviewEvalForm('reviewEval','Manager');
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
    let {Organization,_id} = this.loginUser;
    this.router.navigate(['employee/review-evaluation',
     { action: action, empId: this.currentRowItem.employeeId,actor:actor,empManagerId:_id 
      ,empName: this.currentRowItem.name}
  ], { skipLocationChange: true });
}

}
