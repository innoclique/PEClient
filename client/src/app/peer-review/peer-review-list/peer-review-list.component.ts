import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { PerfAppService } from '../../services/perf-app.service';
import ReportTemplates from '../../views/psa/reports/data/reports-templates';


@Component({
  selector: 'app-peer-review-list',
  templateUrl: './peer-review-list.component.html',
  styleUrls: ['./peer-review-list.component.css']
})
export class PeerReviewListComponent implements OnInit {
  peerReviewList: any = [];
  currentRowItem: any = {};
  loginUser: any;
  
  public monthList = ["","January", "February", "March", "April", "May", "June", "July",
  "August", "September", "October", "November", "December"]
  private subscriptions: Subscription[] = [];
  currentOrganization: any;
  constructor(private authService: AuthService,
    private router: Router,
    private snack: NotificationService,
    private perfApp: PerfAppService,
    public translate: TranslateService) {
    this.loginUser = this.authService.getCurrentUser();
    this.currentOrganization = this.authService.getOrganization();

  }

  public columnDefs = [
    {
      headerName: 'Employee', field: '', width: 230, sortable: true, filter: true,
      cellRenderer: (data) => {
        return `${data.data.ForEmployee[0].FirstName} ${data.data.ForEmployee[0].LastName}`
        
      }
    },
    {
      headerName: 'Manager', field: '', width: 200, sortable: true, filter: true,
      cellRenderer: (data) => {
        return `${data.data.Manager[0].FirstName} ${data.data.Manager[0].LastName}`
      }
    },
    { headerName: 'Evaluation Period', width: 240,field: 'EvaluationPeriod', sortable: true, filter: true
    ,cellRenderer: (data) => {
        return this.getEVPeriod();
    } },
    { headerName: 'Evaluation Duration',width: 240, field: 'EvaluationDuration', sortable: true, filter: true },
    { headerName: 'Status', field: 'Status',width: 150, sortable: true, filter: true,
    cellRenderer: (data) => {
      debugger
      if(data.data.IsRatingSubmitted && data.data.IsRatingSubmitted){
      return `Submitted`
      }else{
        return `<span title='Not Submitted'>Not Submitted</span>` 
      }
      
    } },
    {
      headerName: 'Review/Modify', field: '', width: 150, autoHeight: true, suppressSizeToFit: true,
      cellRenderer: (data) => {
        debugger
        if(!data.data.IsRatingSubmitted){
        return `<i class="icon-cursor font-1xl" style="cursor:pointer ;padding: 7px 20px 0 0;
        font-size: 17px;"   data-action-type="doreview" title="Submit Review"></i>       
        `
        }else{
          return `<i class="icon-check font-1xl" style="cursor:pointer ;padding: 7px 20px 0 0;
          font-size: 17px;" data-action-type="doreview" title="View Rating"></i>       
          ` 
        }
        
      }
    }
  ];
  ngOnInit(): void {
    this.getPeerReviewList();
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
      EmployeeId:this.currentRowItem.ForEmployee[0]._id }], { skipLocationChange: true });
  }
  getPeerReviewList() {
    this.perfApp.route = "app";
    this.perfApp.method = "GetPendingPeerReviewsList",
      this.perfApp.requestBody = {
        EmployeeId:this.loginUser._id
        // "EvaluationId": "5f9afa0b8705d33cfc4228fb",
        // "EmployeeId": "5f904bdfa8f3771460ef153b"
      }
    this.subscriptions.push(this.perfApp.CallAPI().subscribe(c => {
      if (c) {
        this.peerReviewList = c;
      }
    }, error => {
      this.snack.error(error.message)
    })
    )
  }
  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe())
  }

  
  onGridSizeChanged(params) {
    params.api.sizeColumnsToFit();
}

public getRowHeight = function (params) {
return 34;
};


  onGridReady(params) {
    params.api.sizeColumnsToFit();
  }

  
  getEVPeriod(){
    return ReportTemplates.getEvaluationPeriod(this.currentOrganization.StartMonth, this.currentOrganization.EndMonth);
  }
  
}
