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
    templateUrl: './clientRevenueInfo.component.html',
    styleUrls: ['./clientRevenueInfo.component.css']
})
export class ClientRevenueInfoComponent {

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
    clientInfo: any;
    clientRow: any;
    constructor(
        public authService: AuthService,
        public reportService: ReportsService,
        public router: Router,
        private activatedRoute: ActivatedRoute,) {
        this.currentUser = this.authService.getCurrentUser();
        this.currentOrganization = this.authService.getOrganization();
        this.gridOptions = <GridOptions>{};
        this.gridOptions = {
            columnDefs: this.getPsaClientRevenueInfoColumnDefs(),
        }
        this.defaultColDef = ReportTemplates.defaultColDef;
    }

    ngOnInit(): void {
        this.currentUser = this.authService.getCurrentUser();
        this.getClientsRevenue();
    }

    headerHeightSetter(event) {
        var padding = 20;
        var height = ReportTemplates.headerHeightGetter() + padding;
        this.api.setHeaderHeight(height);
        this.api.resetRowHeights();
        this.api.sizeColumnsToFit();
    }

    getClientsRevenue() {
        let { Organization, _id } = this.currentUser;
        let orgId = Organization._id;

        let reqBody: any = {
            orgId: orgId,
            reportType: 'CLIENTS_REVENUE'
        };
        this.reportService.getReport(reqBody).subscribe(apiResponse => {
            console.log('CLIENTS_REVENUE : ', apiResponse);
            this.createClientRowData(apiResponse);
        });
    }

    getRevenue(paymentReleases: any[]) {
        var revenue = 0;
        if (paymentReleases && paymentReleases.length > 0) {
            for (let payment of paymentReleases) {
                revenue = revenue + payment.TOTAL_PAYABLE_AMOUNT;
            }
        }
        return revenue;
    }

    isAnnualPayment(paymentReleases: any[]) {
        if (paymentReleases && paymentReleases.length > 0) {
            return paymentReleases[0].isAnnualPayment;
        }
    }

    private createClientRowData(clientsInfo: any) {
        const rowData: any[] = [];
        const purchaseDates: any[] = [];
        var options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        console.log('inside createRowData : ');
        var clientsInfo = clientsInfo.clientsInfo;
        for (let i = 0; i < clientsInfo.length; i++) {
            rowData.push({
                name: clientsInfo[i].Organization.Name,
                year: new Date(clientsInfo[i].Organization.CreatedOn).toLocaleDateString(undefined, options),
                active: clientsInfo[i].Organization.IsActive ? 'Yes' : 'No',
                clientId: clientsInfo[i].Organization._id,
                usageType: clientsInfo[i].Organization.UsageType,
                evaluationsType: RefData.evaluationTypes[0],
                paymentTypes: this.isAnnualPayment(clientsInfo[i].paymentReleases)?"Yearly":"Monthly",
                purchasesCount: this.getRevenue(clientsInfo[i].paymentReleases),
            });
        }
        this.rowData = rowData;
    }

    getPsaClientRevenueInfoColumnDefs() {
        return [
            { headerName: 'Client', field: 'name' },
            { headerName: 'Active', field: 'active' },
            { headerName: 'Usage Type', field: 'usageType' },
            { headerName: 'Evaluations Type', field: 'evaluationsType', minWidth: 200 },
            { headerName: 'Revenue (CAD)', field: 'purchasesCount', type: 'rightAligned', valueFormatter: params => params.data.purchasesCount.toFixed(2) },
            { headerName: 'Payment Type', field: 'paymentTypes' },
            {
                headerName: "Actions", filter: false, sorting: false, onCellClicked: this.gotoClientRevenueDetails.bind(this),
                cellRenderer: () => {
                    return `  <i class="fa fa-bars"   style="cursor:pointer ;padding: 7px 10px 0 0;
            font-size: 17px; "   title="view Client Revenue Details" ></i>`
                }
            }
        ];
    }

    gotoDashboard() {
        this.router.navigate(['/psa/dashboard'])
    }

    gotoClientRevenueDetails(event) {
        console.log(event);
        const cr = event.data;
        this.router.navigate(['psa/reports/revenue/client/details/' + cr.clientId]);
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
        this.gridOptions.rowHeight = 40;
    }

    onQuickFilterChanged($event: any) {
        this.api.setQuickFilter($event.target.value);
    }

}


