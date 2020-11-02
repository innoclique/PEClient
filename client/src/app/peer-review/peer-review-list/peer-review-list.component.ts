import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { PerfAppService } from '../../services/perf-app.service';


@Component({
  selector: 'app-peer-review-list',
  templateUrl: './peer-review-list.component.html',
  styleUrls: ['./peer-review-list.component.css']
})
export class PeerReviewListComponent implements OnInit {
  peerReviewList: any = [];
  currentRowItem: any = {};
  loginUser: any;
  private subscriptions: Subscription[] = [];
  constructor(private authService: AuthService,
    private router: Router,
    private snack: NotificationService,
    private perfApp: PerfAppService,
    public translate: TranslateService) {
    this.loginUser = this.authService.getCurrentUser();

  }

  public columnDefs = [
    {
      headerName: 'Employee', field: '', width: 320, sortable: true, filter: true,
      cellRenderer: (data) => {
        return `${data.data.ForEmployee[0].FirstName} ${data.data.ForEmployee[0].LastName}`
        
      }
    },
    {
      headerName: 'Manager', field: '', width: 320, sortable: true, filter: true,
      cellRenderer: (data) => {
        return `${data.data.Manager[0].FirstName} ${data.data.Manager[0].LastName}`
      }
    },
    { headerName: 'Evaluation Period', field: 'EvaluationPeriod', sortable: true, filter: true },
    { headerName: 'Evaluation Duration', field: 'EvaluationDuration', sortable: true, filter: true },
    { headerName: 'Status', field: 'Status', sortable: true, filter: true },
    {
      headerName: 'Action', field: '', width: 200, autoHeight: true, suppressSizeToFit: true,
      cellRenderer: (data) => {
        //if(data.data.Status && data.data.Status!=='Submitted'){
        return `<i class="icon-check font-1xl" style="cursor:pointer ;padding: 7px 20px 0 0;
        font-size: 17px;"   data-action-type="doreview" title="Submit Review"></i>       
        `
        //}
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

  onGridReady(params) {
    params.api.sizeColumnsToFit();
  }
  
}
