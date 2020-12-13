import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import "ag-grid-community";
import { GridApi, GridOptions } from 'ag-grid-community';
import { AuthService } from '../../../../../services/auth.service';
import RefData from "../../data/refData";
import ReportTemplates from '../../data/reports-templates';
import { ReportsService } from '../../../../../services/reports.service';

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
        private activatedRoute: ActivatedRoute, ) {
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

    private createClientRowData(clientsInfo: any) {
        const rowData: any[] = [];
        const purchaseDates: any[] = [];
        var options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        console.log('inside createRowData : ');
        var clientsInfo = clientsInfo.clientsInfo;
        for (let i = 0; i < clientsInfo.length; i++) {
            rowData.push({
                name: clientsInfo[i].Name,
                year: new Date(clientsInfo[i].CreatedOn).toLocaleDateString(undefined, options),
                purchasedOn: RefData.DOBs[i % RefData.DOBs.length].getFullYear(),
                active: clientsInfo[i].IsActive ? 'Yes' : 'No',
                clientId: clientsInfo[i]._id,
                usageType: clientsInfo[i].UsageType,
                evaluationsType: RefData.evaluationTypes[0],
                evaluationPeriod: ReportTemplates.months[clientsInfo[i].StartMonth] + "'" + ReportTemplates.getYear() + ' To ' + clientsInfo[i].EndMonth.substring(0, 3) + "'" + ReportTemplates.getYear(),
                paymentTypes: RefData.paymentTypes[Math.random() < 0.5 ? 1 : 0],
                empPurchasesCount: Math.round(Math.random() * 100),
                licPurchasesCount: Math.round(Math.random() * 10),
                purchasesCount: Math.round(Math.random() * 1000),
                minPurchasedOn: new Date(2010, 0, 1).toLocaleDateString(undefined, options),
                children: this.createHistoryData()
            });
        }
        this.rowData = rowData;
    }

    private createHistoryData() {
        const rowData: any[] = [];
        var options = { year: 'numeric', month: '2-digit', day: '2-digit' };

        for (let i = 0; i < 20; i++) {
            rowData.push({
                purchasedOn: new Date(2010, 0, 1).toLocaleDateString(undefined, options),
                purchaseCount: Math.round(Math.random() * 1000),
                paymentTypes: RefData.paymentTypes[Math.random() < 0.5 ? 1 : 0],
                usageType: RefData.usageTypes[Math.random() < 0.5 ? 1 : 0],
                evaluationsType: RefData.evaluationTypes[0],
                evaluationPeriod: "JAN'20-DEC'20",
            });
        }
        return rowData;
    }

    getPsaClientRevenueInfoColumnDefs() {
        return [
            { headerName: 'Client', field: 'name' },
            { headerName: 'Active', field: 'active' },
            { headerName: 'Usage Type', field: 'usageType' },
            { headerName: 'Type of Evaluations', field: 'evaluationsType' },
            { headerName: 'Revenue (all years)', field: 'purchasesCount' },
            { headerName: 'Payment Type (Monthly/Yearly)', field: 'paymentTypes' },
            { headerName: "Actions", suppressSizeToFit: true, filter: false, sorting: false, onCellClicked: this.gotoClientRevenueDetails.bind(this),
                cellRenderer: () => {
                    return `  <i class="fa fa-bars"   style="cursor:pointer ;padding: 7px 10px 0 0;
            font-size: 17px; color:blue"   title="view Client Revenue Details" > Revenue Details</i>`
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
        this.gridOptions.rowHeight = 34;
    }

    onQuickFilterChanged($event: any) {
        this.api.setQuickFilter($event.target.value);
    }

}


