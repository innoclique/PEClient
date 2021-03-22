import { Component, OnInit } from '@angular/core';
import { EmService } from '../../../services/em.service';
import { AuthService } from '../../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { PerfAppService } from '../../../services/perf-app.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-manager-dashboard',
  templateUrl: './manager-dashboard.component.html',
  styleUrls: ['./manager-dashboard.component.css']
})
export class ManagerDashboardComponent implements OnInit {

  currentRowItem: any;
  dashboardData: any;
  loginUser: any;
  currentOrganization: any;
  empEvaluationYear: any = '';
  selectedEmployeesList: any[] = [];
  dataLoaded: boolean = false;

  evaluationsColumnDefs = [
    { headerName: 'Name', width: '100px', field: 'name', sortable: true },
    { headerName: 'Status', width: '180px', field: 'status', sortable: true },
    {
      headerName: 'Review/Modify', width: '280px',
      cellRenderer: (data) => {
        let actionlinks = ''
        actionlinks = `
            
             <a data-action-type="doevaluationreview" href="javascript:void(0)">View</> |  <a data-action-type="doevaluationreview" href="javascript:void(0)">Sign-off</a> | <a data-action-type="dorequestreview" href="javascript:void(0)" class=${this.getCssStyle(data)} (click)='onRequestPeerReview()'>Request Peer Review<a/>
             
             `
        return actionlinks
          ;
      },
    }
  ];
  evaluationsRowData = [];

  peerreviewColumnDefs = [
    { headerName: 'Peer', width: '220px', field: 'peer', sortable: true },
    { headerName: 'Title', width: '200px', field: 'title', sortable: true },
    { headerName: 'Department', width: '250px', field: 'deparment', sortable: true, filter: true },
    { headerName: 'Days Remaining', width: '200px', field: 'daysRemaining', sortable: true, filter: true },
    {
      headerName: 'Review/Modify', width: '100px',
      cellRenderer: (data) => {
        let actionlinks = ''
        actionlinks = `
            
             <i class="icon-eye font-1xl" style="cursor:pointer ;padding: 7px 20px 0 0;
          font-size: 17px;" data-action-type="doreview" title="View Rating"></i>  
             
             `
        return actionlinks
          ;
      },
    }
  ];
  peerReviewRowData = [];

  directReportColumnDefs = [
    { headerName: 'Name', width: '100px', field: 'name', sortable: true },
    { headerName: 'Start date', width: '120px', field: 'joiningDate', sortable: true },
    { headerName: 'Last Rating', width: '100px', field: 'lastRating', sortable: true },
    { headerName: '# of Evaluations', width: '130px', field: 'noOfEvaluations', sortable: true },
  ];
  directReportsRowData = [];


  constructor(private router: Router, private snack: NotificationService,
    public emService: EmService, private authService: AuthService, private perfApp: PerfAppService) {
    this.loginUser = this.authService.getCurrentUser();
    this.currentOrganization = this.authService.getOrganization();
    this.getEmployeeCurrentEvaluation();
  }

  ngOnInit(): void {
    this.loadDashboard();
    this.loadDirectReports();
  }
  loadDashboard() {
    let { Organization, _id } = this.loginUser;
    console.log(JSON.stringify(this.loginUser, null, 5))
    let orgId = Organization._id;
    let payload: any = { userId: _id, orgId: orgId }
    this.emService.emDashboard(payload).subscribe(apiResponse => {
      this.evaluationsRowData = apiResponse.current_evaluation.list;
      this.peerReviewRowData = apiResponse['peer_review']['list'];
    });
  }
  loadDirectReports() {
    let { Organization, _id } = this.loginUser;
    console.log(JSON.stringify(this.loginUser, null, 5))
    let orgId = Organization._id;
    let payload: any = { userId: _id, orgId: orgId, type: 'EM' }
    this.emService.directReports(payload).subscribe(apiResponse => {
      this.directReportsRowData = apiResponse.list;

      if (this.directReportsRowData.length > 0) {
        this.directReportsRowData.map(row => {
          row.lastRating = row.lastRating == '' ? 'N/A' : row.lastRating

        });
      }
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
          this.reviewEvalForm('reviewEval', 'Manager');
          break;
        case 'dorequestreview':
          this.onRequestPeerReview();
          break;
        default:
      }
    }
  }
  doReview() {
    console.log('currentreview  item', this.currentRowItem)
    this.router.navigate(['employee/submitpeerreview', {
      EvaluationId: this.currentRowItem.EvaluationId,
      EmployeeId: this.currentRowItem.employeeId
    }], { skipLocationChange: true });
  }
  reviewEvalForm(action, actor) {
    let { Organization, _id } = this.loginUser;
    this.router.navigate(['employee/review-evaluation',
      {
        action: action, empId: this.currentRowItem.employeeId, actor: actor, empManagerId: _id
        , empName: this.currentRowItem.name
      }
    ], { skipLocationChange: true });
  }

  onRequestPeerReview() {
if (this.currentRowItem.IsManagerFRSubmited) {
  this.snack.error('Manager has submitted Final Rating, so adding of Peers/Direct Reports is not allowed');
  return;
}

    this.router.navigate(['em/request-rating', { empId: this.currentRowItem.employeeId }]);
  }

  getEvaluationList() {
    this.perfApp.route = "em/request/peer-direct";
    this.perfApp.method = "reports/list",
      this.perfApp.requestBody = {
        "EvaluationYear": this.empEvaluationYear,
        "owner": this.loginUser._id
      }
    this.perfApp.CallAPI().subscribe(c => {

      if (c) {
        let submittedRecords = c.filter(record => record.IsDraft == false);
        this.selectedEmployeesList = submittedRecords;
      }
      this.dataLoaded = true;
    },
      error => {
        this.dataLoaded = true;
      }
    )
  }

  
//Todo: Move the getEmployeeCurrentEvaluation service call to resolver in future to wait till complete data is loaded
  getEmployeeCurrentEvaluation() {
    this.perfApp.route = "app";
    this.perfApp.method = "GetEmployeeCurrentEvaluation",
      this.perfApp.requestBody = {
        'empId': this.loginUser._id,
        'orgId': this.currentOrganization._id
      }
    this.perfApp.CallAPI().subscribe(evaluationYear => {
      this.empEvaluationYear = evaluationYear;
      this.getEvaluationList();
    })
  }

  getCssStyle(rowData) {
    let isSubmittedRequest = this.selectedEmployeesList.findIndex(emp => emp.EmployeeId._id == rowData.data.employeeId);
    if (isSubmittedRequest > -1) {
      return 'submitted';
    } else {
      return 'unSubmitted';
    }
  }


}
