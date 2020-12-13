import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import "ag-grid-community";
import { GridApi, GridOptions } from 'ag-grid-community';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../../../services/auth.service';
import { ReportsService } from '../../../../../services/reports.service';
import RefData from "../../data/refData";
import ReportTemplates from '../../data/reports-templates';

@Component({
    selector: 'my-app',
    templateUrl: './resellerClientsInfo.component.html',
    styleUrls: ['./resellerClientsInfo.component.css']
})
export class ResellerClientInfoComponent {

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
    resellerInfo: any;
    resellerRow: any;
    subscription: Subscription = new Subscription();
    constructor(
        public authService: AuthService,
        public reportService: ReportsService,
        public router: Router,
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
    }

    ngOnInit(): void {
        this.currentUser = this.authService.getCurrentUser();
        this.subscription.add(this.activatedRoute.params.subscribe(params => {
            if (params['resellerId']) {
                this.getResellerClientsInfo(params['resellerId']);
            }
        }));
    }

    getResellerClientsInfo(resellerId) {
        console.log('resellerId : ', resellerId)
        let reqBody: any = {
            orgId: resellerId,
            reportType: 'RESELLER_CLIENTS_INFO'
        };
        this.reportService.getReport(reqBody).subscribe(apiResponse => {
            console.log('RESELLER_CLIENTS_INFO : ', apiResponse);
            this.createResellerClientRowData(apiResponse);
        });
    }

    createResellerRowData(apiResponse: any) {
        throw new Error("Method not implemented.");
    }

    gotoPurchaseHistory(event) {
        console.log(event);
        const cr = event.data;
        this.router.navigate(['/psa/reports/info/reseller/clients/purchase-history/' + cr.clientId]);
        return;
    }

    private createResellerClientRowData(resellerClientsInfo: any) {
        const rowData: any[] = [];
        var options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        this.resellerInfo = resellerClientsInfo.resellerInfo;
        var resellerClientsInfo = resellerClientsInfo.clientsInfo;
        this.resellerRow = {
            'Name': this.resellerInfo.Name,
            'year': new Date(this.resellerInfo.CreatedOn).toLocaleDateString(undefined, options),
            'active': this.resellerInfo.IsActive ? 'Yes' : 'No',
        };
        // console.log('inside createRowData : ');
        for (let i = 0; i < resellerClientsInfo.length; i++) {
            rowData.push({
                name: resellerClientsInfo[i].Name,
                year: new Date(resellerClientsInfo[i].CreatedOn).toLocaleDateString(undefined, options),
                purchasedOn: RefData.DOBs[i % RefData.DOBs.length].getFullYear(),
                active: resellerClientsInfo[i].IsActive ? 'Yes' : 'No',
                clientId: resellerClientsInfo[i]._id,
                usageType: resellerClientsInfo[i].UsageType,
                evaluationsType: resellerClientsInfo[i].EvaluationPeriod,
                evaluationPeriod: "JAN'20-DEC'20",
                empPurchasesCount: Math.round(Math.random() * 100),
                licPurchasesCount: Math.round(Math.random() * 10),
                purchasesCount: Math.round(Math.random() * 1000),
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
            { headerName: '#s Purchased (License)', field: 'licPurchasesCount', minWidth: 150 },
            { headerName: '#s Purchased (Employees)', field: 'empPurchasesCount', minWidth: 150 },
            {
                headerName: "Actions", filter: false, Sorting: false, onCellClicked: this.gotoPurchaseHistory.bind(this),
                cellRenderer: () => {
                    return `  <i class="fa fa-history"   style="cursor:pointer ;padding: 7px 20px 0 0;
                        font-size: 17px;"   data-action-type="edit" title="view purchase history" ></i>`
                }
            }
        ];
    }

    gotoReseller() {
        this.router.navigate(['/psa/reports/info/reseller']);
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

