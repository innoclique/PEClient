import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { PerfAppService } from '../../services/perf-app.service';
import ReportTemplates from '../../views/psa/reports/data/reports-templates';

@Component({
  selector: 'app-dr-review-list',
  templateUrl: './dr-review-list.component.html',
  styleUrls: ['./dr-review-list.component.css']
})
export class DrReviewListComponent implements OnInit {

  ManagerList: any = [];
  currentRowItem: any = {};
  loginUser: any;
  private subscriptions: Subscription[] = [];
  currentOrganization: any;
  
  public monthList = ["","January", "February", "March", "April", "May", "June", "July",
  "August", "September", "October", "November", "December"]
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
      headerName: 'Employee', field: '', width: 250, sortable: true, filter: true,
      cellRenderer: (data) => {
        return `${data.data.ForEmployee[0].FirstName} ${data.data.ForEmployee[0].LastName}`
        
      }
    },
    {
      headerName: 'Manager', field: '', width: 150, sortable: true, filter: true,
      cellRenderer: (data) => {
        return `${data.data.Manager[0].FirstName} ${data.data.Manager[0].LastName}`
      }
    },
    { headerName: 'Evaluation Period', width: 220, field: 'EvaluationPeriod', sortable: true, filter: true
    ,cellRenderer: (data) => {
      return this.getEVPeriod();
  } },
    { headerName: 'Evaluation Duration',width: 220, field: 'EvaluationDuration', sortable: true, filter: true },
    { headerName: 'Status',width: 220, field: 'Status', sortable: true, filter: true,
    cellRenderer: (data) => {
      debugger
      if(data.data.IsRatingSubmitted && data.data.IsRatingSubmitted){
      return `Submitted`
      }else{
        return `Not Submitted` 
      }
      
    } },
    {
      headerName: 'Action', field: '', width: 150, autoHeight: true, suppressSizeToFit: true,
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
    this.getManagerList();
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
    this.router.navigate(['employee/submitdrreview', { EvaluationId: this.currentRowItem.EvaluationId,
      EmployeeId:this.currentRowItem.ForEmployee[0]._id }], { skipLocationChange: true });
  }
  getManagerList() {
    debugger
    this.perfApp.route = "app";
    this.perfApp.method = "GetDRReviewsList",
      this.perfApp.requestBody = {
        EmployeeId:this.loginUser._id
        // "EvaluationId": "5f9afa0b8705d33cfc4228fb",
        // "EmployeeId": "5f904bdfa8f3771460ef153b"
      }
    this.subscriptions.push(this.perfApp.CallAPI().subscribe(c => {
      if (c) {
        this.ManagerList = c;
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

  
  getEVPeriod(){
     return ReportTemplates.getEvaluationPeriod(this.currentOrganization.StartMonth, this.currentOrganization.EndMonth);
  }

}
