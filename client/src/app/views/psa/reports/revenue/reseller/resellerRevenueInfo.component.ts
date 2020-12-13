import { Component, ViewEncapsulation } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import "ag-grid-community";
import { GridApi, GridOptions } from 'ag-grid-community';
import { BsModalService } from 'ngx-bootstrap/modal';
import { AuthService } from '../../../../../services/auth.service';
import { NotificationService } from '../../../../../services/notification.service';
import { PerfAppService } from '../../../../../services/perf-app.service';
import RefData from "../../data/refData";
import ReportTemplates from '../../data/reports-templates';
import { ReportsService } from '../../../../../services/reports.service';

@Component({
    selector: 'my-app',
    templateUrl: './resellerRevenueInfo.component.html',
    styleUrls: ['./resellerRevenueInfo.component.css']
})
export class ResellerRevenueInfoComponent {
    public gridOptions: GridOptions;
    public showGrid: boolean;
    public rowData: any[];
    private api: GridApi;
    detailCellRendererParams: any;
    defaultColDef:any;
    currentUser: any;
    cscData: any = undefined;
    currentOrganization: any;
    detailCellRenderer:any;
    frameworkComponents:any;
    constructor(
        public authService: AuthService,
        public router: Router,
        public reportService:ReportsService,
        private activatedRoute: ActivatedRoute, ) {
        this.currentUser = this.authService.getCurrentUser();
        this.currentOrganization = this.authService.getOrganization();
        this.gridOptions = <GridOptions>{};
        this.gridOptions = {
            columnDefs: this.getPsaResellerRevenueInfoColumnDefs(),
        }
        this.defaultColDef = ReportTemplates.defaultColDef;
    }

    ngOnInit(): void {
        this.currentUser = this.authService.getCurrentUser();
        this.getResellerInfo();
    }


    getResellerInfo(){
        let {Organization,_id} = this.currentUser;
        let orgId = Organization._id;

        let reqBody:any = {
          orgId:orgId,
          reportType:'RESELLER_INFO'
        };
        this.reportService.getReport(reqBody).subscribe(apiResponse => {
          console.log('RESELLER_INFO : ',apiResponse);
          this.getResellerRevenueRowData(apiResponse);
        });
      }

      private getResellerRevenueRowData(resellerInfo:any) {
        const rowData: any[] = [];
        //  resellerInfo = resellerInfo.ClientSummary.usage;
        var options = { year: 'numeric', month: '2-digit', day: '2-digit' };

        console.log('inside getResellerRevenueRowData : ');
        for (let i = 0; i < resellerInfo.length; i++) {                                                           
            rowData.push({
                reSellerName: resellerInfo[i].Name,
                year: new Date(resellerInfo[i].CreatedOn).toLocaleDateString(undefined, options),
                purchasedOn: RefData.DOBs[i % RefData.DOBs.length].getFullYear(),
                active: resellerInfo[i].IsActive?'Yes':'No',
                resellerId:resellerInfo[i]._id,
                purchasesCount: Math.round(Math.random() * 1000),//dummy data
                paymentTypes:RefData.paymentTypes[Math.random() < 0.5 ? 1 : 0],
            });
        }
        this.rowData = rowData;
    }

     headerHeightSetter(event) {
        var padding = 20;
        var height = ReportTemplates.headerHeightGetter() + padding;
        this.api.setHeaderHeight(height);
        this.api.resetRowHeights();
    }

    getPsaResellerRevenueInfoColumnDefs() {
        return  [
            {
                headerName: 'Reseller', field: 'reSellerName', tooltipField: 'Client', minWidth: 200, width: 128, resizable: true, sortable: true, suppressSizeToFit: true, filter: true,
                cellRenderer: 'agGroupCellRenderer'
            },
            { headerName: 'Active', field: 'active', sortable: true, minWidth: 50, resizable: true, width: 128, filter: true },
            { headerName: 'Revenue (all years)', field: 'purchasesCount', sortable: true, minWidth: 50, width: 128, resizable: true, filter: true },
            { headerName: 'Payment Type (Monthly/Yearly)', field: 'paymentTypes', sortable: true, minWidth: 50, width: 128, resizable: true, filter: true },
            {
                headerName: "Actions", suppressSizeToFit: true, filter: false, sorting: false, onCellClicked: this.gotoResellerRevenueDetails.bind(this),
                cellRenderer: () => {
                    return `  <i class="fa fa-bars"   style="cursor:pointer ;padding: 7px 20px 0 0;
                font-size: 17px; color:blue"   title="view Reseller Revenue Details" > Revenue Details</i>`
                }
            }
        ];
    }
   
    gotoDashboard() {
        this.router.navigate(['/psa/dashboard'])
    }

    gotoResellerRevenueDetails(event) {
        console.log(event);
        const cr = event.data;
        this.router.navigate(['psa/reports/revenue/reseller/details/' + cr.resellerId]);
        return;
    }


    onBtExport() {
        var params = {
            columnWidth: parseFloat('200'),
            sheetName: 'Client-Info',
            exportMode: undefined,
            suppressTextAsCDATA: false,
            rowHeight: undefined,
            headerRowHeight: undefined,
        };
        this.api.exportDataAsExcel(params);
    }

    onReady(params: any) {
        this.api = params.api;
        console.log('onReady');
        this.api.sizeColumnsToFit();
        this.gridOptions.rowHeight = 34;
    }

    onQuickFilterChanged($event: any) {
        this.api.setQuickFilter($event.target.value);
    }

}

