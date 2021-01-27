import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import "ag-grid-community";
import { GridApi, GridOptions } from 'ag-grid-community';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { ReportsService } from '../../../services/reports.service';
import RefData from "../../psa/reports/data/refData";
import ReportTemplates from '../../psa/reports/data/reports-templates';
@Component({
    selector: 'my-app',
    templateUrl: './reports.component.html',
    styleUrls: ['./reports.component.css']
})
export class ReportsComponent {

    public gridOptions: GridOptions;
    public showGrid: boolean;
    public rowData: any[];
    private api: GridApi;
    detailCellRendererParams: any;
    defaultColDef: any;
    currentUser: any;
    cscData: any = undefined;
    currentOrganization: any;
    currentOrganizationRow: any;
    detailCellRenderer: any;
    frameworkComponents: any;
    subscription: Subscription = new Subscription();
    constructor(
        public authService: AuthService,
        public router: Router,
        public reportService: ReportsService,
        private activatedRoute: ActivatedRoute, ) {
        this.currentUser = this.authService.getCurrentUser();
        this.currentOrganization = this.authService.getOrganization();
        this.gridOptions = <GridOptions>{};
        this.gridOptions = {
            columnDefs: this.getPsaClientInfoColumnDefs(),
        }
        this.defaultColDef = ReportTemplates.defaultColDef;
    }

    headerHeightSetter(event) {
        var padding = 20;
        var height = ReportTemplates.headerHeightGetter() + padding;
        this.api.setHeaderHeight(height);
        this.api.resetRowHeights();
        this.api.sizeColumnsToFit();
    }

    ngOnInit(): void {
        this.currentUser = this.authService.getCurrentUser();
        this.getClientsInfo();
    }

    getClientsInfo() {
        let { Organization, _id } = this.currentUser;
        let orgId = Organization._id;

        let reqBody: any = {
            orgId: orgId,
            reportType: 'CLIENTS_INFO'
        };
        this.reportService.getReport(reqBody).subscribe(apiResponse => {
            console.log('CLIENTS_INFO : ', apiResponse);
            this.createClientRowData(apiResponse);
        });
    }

    getLicencePurchaseCount(paymentReleases: any[]) {
        var licencesCount = 0;
        var employeesCount = 0;
        if (paymentReleases && paymentReleases.length > 0) {
            for (let payment of paymentReleases) {
                if (payment.UserType === 'License') {
                    if (payment.Type != 'Adhoc') {
                        licencesCount++;
                    } else {
                        employeesCount = employeesCount + payment.NoOfEmployees;
                    }
                } else {
                    employeesCount = employeesCount + payment.NoOfEmployees;
                }

            }
        }
        return [employeesCount, licencesCount];
    }

    private createClientRowData(clientsInfo: any) {
        const rowData: any[] = [];
        var options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        // console.log('inside createRowData : ');
        var clientsInfo = clientsInfo.clientsInfo;
        this.currentOrganizationRow = {
            'Name': this.currentOrganization.Name,
            'year': new Date(this.currentOrganization.CreatedOn).toLocaleDateString(undefined, options),
            'active': this.currentOrganization.IsActive ? 'Yes' : 'No',
        };
        for (let i = 0; i < clientsInfo.length; i++) {
            var employeesCount = 0;
            var licencesCount = 0;
            var counts = this.getLicencePurchaseCount(clientsInfo[i].Organization.paymentReleases);
            employeesCount = counts[0];
            licencesCount = counts[1];
            rowData.push({
                name: clientsInfo[i].Organization.Name,
                year: new Date(clientsInfo[i].Organization.CreatedOn).toLocaleDateString(undefined, options),
                purchasedOn: RefData.DOBs[i % RefData.DOBs.length].getFullYear(),
                active: clientsInfo[i].Organization.IsActive ? 'Yes' : 'No',
                clientId: clientsInfo[i].Organization._id,
                usageType: clientsInfo[i].Organization.UsageType,
                evaluationsType: 'Year - end',
                evaluationPeriod: ReportTemplates.months[clientsInfo[i].Organization.StartMonth] + "'" + ReportTemplates.getYearStart(ReportTemplates.months[clientsInfo[i].Organization.StartMonth]) + ' To ' +  clientsInfo[i].Organization.EndMonth.substring(0, 3) + "'" + ReportTemplates.getYearEnd( clientsInfo[i].Organization.EndMonth.substring(0, 3)),
//                 evaluationPeriod: ReportTemplates.months[clientsInfo[i].Organization.StartMonth] + "'" + ReportTemplates.getYear() + ' To ' + clientsInfo[i].Organization.EndMonth.substring(0, 3) + "'" + ReportTemplates.getYear(),
                empPurchasesCount: employeesCount,
                licPurchasesCount: licencesCount,
            });
        }
        this.rowData = rowData;
    }

    getPsaClientInfoColumnDefs() {
        return [
            { headerName: 'Client', field: 'name', tooltipField: 'name', minWidth: 150 },
            { headerName: 'Client Since', field: 'year', minWidth: 125 },
            { headerName: 'Active', field: 'active', minWidth: 95 },
            { headerName: 'Usage Type', field: 'usageType', minWidth: 130 },
            { headerName: 'Evaluations Type', field: 'evaluationsType', minWidth: 150 },
            { headerName: 'Evaluation Period', field: 'evaluationPeriod', minWidth: 150 },
            { headerName: '#s Purchased (License)', field: 'licPurchasesCount', minWidth: 150 , type: 'rightAligned', valueFormatter: params => params.data.licPurchasesCount.toFixed(2) },
            { headerName: '#s Purchased (Employees)', field: 'empPurchasesCount', minWidth: 150 , type: 'rightAligned', valueFormatter: params => params.data.empPurchasesCount.toFixed(2) },
            {
                headerName: "Review/Modify", suppressSizeToFit: true, filter: false, sorting: false, onCellClicked: this.gotoPurchaseHistory.bind(this),
                cellRenderer: (data) => {
                    return `  <i class="fa fa-history"   style="cursor:pointer ;padding: 7px 20px 0 0;
                    font-size: 17px;"   data-action-type="edit" title="view purchase history" ></i>`
                }
            }

        ];
    }

    gotoDashboard() {
        this.router.navigate(['/rsa/dashboard'])
    }

    gotoPurchaseHistory(event) {
        console.log(event);
        const cr = event.data;
        this.router.navigate(['/rsa/reports/client-purchase-history/' + cr.clientId]);
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
        console.log('onReady');
        this.api = params.api;
        this.gridOptions.rowHeight = 40;
    }

    onQuickFilterChanged($event: any) {
        this.api.setQuickFilter($event.target.value);
    }

}





