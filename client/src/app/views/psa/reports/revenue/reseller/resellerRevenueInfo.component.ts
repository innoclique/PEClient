import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import "ag-grid-community";
import { GridApi, GridOptions } from 'ag-grid-community';
import { AuthService } from '../../../../../services/auth.service';
import { ReportsService } from '../../../../../services/reports.service';
import RefData from "../../data/refData";
import ReportTemplates from '../../data/reports-templates';

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
    defaultColDef: any;
    currentUser: any;
    cscData: any = undefined;
    currentOrganization: any;
    detailCellRenderer: any;
    frameworkComponents: any;
    constructor(
        public authService: AuthService,
        public router: Router,
        public reportService: ReportsService,
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


    getResellerInfo() {
        let { Organization, _id } = this.currentUser;
        let orgId = Organization._id;

        let reqBody: any = {
            orgId: orgId,
            reportType: 'RESELLER_INFO'
        };
        this.reportService.getReport(reqBody).subscribe(apiResponse => {
            console.log('RESELLER_INFO : ', apiResponse);
            this.getResellerRevenueRowData(apiResponse);
        });
    }

    getRevenue(paymentReleases: any[]) {
        var revenue = 0;
        if (paymentReleases && paymentReleases.length > 0) {
            for (let payment of paymentReleases) {
                if(Number(payment.TOTAL_PAYABLE_AMOUNT)){
                    revenue = revenue + parseFloat(payment.TOTAL_PAYABLE_AMOUNT);
                }else{
                    revenue = revenue + parseFloat(payment.TOTAL_PAYABLE_AMOUNT.$numberDecimal);
                }
            }
        }
        return revenue;
    }

    isAnnualPayment(paymentReleases: any[]) {
        if (paymentReleases && paymentReleases.length > 0) {
            return paymentReleases[0].isAnnualPayment;
        }
    }

    private getResellerRevenueRowData(resellerInfo: any) {
        const rowData: any[] = [];
        //  resellerInfo = resellerInfo.ClientSummary.usage;
        var options = { year: 'numeric', month: '2-digit', day: '2-digit' };

        console.log('inside getResellerRevenueRowData : ');
        for (let i = 0; i < resellerInfo.length; i++) {
            rowData.push({
                reSellerName: resellerInfo[i].Organization.Name,
                year: new Date(resellerInfo[i].Organization.CreatedOn).toLocaleDateString(undefined, options),
                purchasedOn: RefData.DOBs[i % RefData.DOBs.length].getFullYear(),
                active: resellerInfo[i].Organization.IsActive ? 'Yes' : 'No',
                resellerId: resellerInfo[i].Organization._id,
                purchasesCount: this.getRevenue(resellerInfo[i].paymentReleases),
                paymentTypes: this.isAnnualPayment(resellerInfo[i].paymentReleases)?"Yearly":"Monthly",
            });
        }
        this.rowData = rowData;
    }

    headerHeightSetter(event) {
        var padding = 20;
        var height = ReportTemplates.headerHeightGetter() + padding;
        this.api.setHeaderHeight(height);
        this.api.resetRowHeights();
        this.api.sizeColumnsToFit();
    }

    getPsaResellerRevenueInfoColumnDefs() {
        return [
            { headerName: 'Reseller', field: 'reSellerName', },
            { headerName: 'Active', field: 'active', },
            { headerName: 'Revenue (CAD)', field: 'purchasesCount', type: 'rightAligned'},
            { headerName: 'Payment Type', field: 'paymentTypes', },
            {
                headerName: "Actions", suppressSizeToFit: true, filter: false, sorting: false, onCellClicked: this.gotoResellerRevenueDetails.bind(this),
                cellRenderer: () => {
                    return `  <i class="fa fa-bars"   style="cursor:pointer ;padding: 7px 20px 0 0;
                font-size: 17px;"   title="view Reseller Revenue Details" ></i>`
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
        this.gridOptions.rowHeight = 40;
    }

    onQuickFilterChanged($event: any) {
        this.api.setQuickFilter($event.target.value);
    }

}

