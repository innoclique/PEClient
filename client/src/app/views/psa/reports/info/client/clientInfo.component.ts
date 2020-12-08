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

@Component({
    selector: 'my-app',
    templateUrl: './clientInfo.component.html',
    styleUrls: ['./clientInfo.component.css']
})
export class ClientInfoComponent {

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
        private activatedRoute: ActivatedRoute, ) {
        this.currentUser = this.authService.getCurrentUser();
        this.currentOrganization = this.authService.getOrganization();
      
        // we pass an empty gridOptions in, so we can grab the api out
        this.gridOptions = <GridOptions>{};
        this.gridOptions = {
            columnDefs: this.getPsaClientInfoColumnDefs(),
            masterDetail: true,
        }
        // this.detailCellRenderer = 'myDetailCellRenderer';
        // this.frameworkComponents = { myDetailCellRenderer: ClientInfoReportsComponent };
        // this.gridOptions.detailRowAutoHeight=true;
        this.defaultColDef = { flex: 1 };
        this.createClientRowData();
        this.detailCellRendererParams = ReportTemplates.psaClientInfoColumnDefs.detailCellRendererParams;
      
    }


    ngOnInit(): void {
        this.currentUser = this.authService.getCurrentUser();
    }

    private createClientRowData() {
        const rowData: any[] = [];
        const purchaseDates: any[] = [];
        var options = { year: 'numeric', month: '2-digit', day: '2-digit' };

        console.log('inside createRowData : ');
        for (let i = 0; i < 50; i++) {
            const countryData = RefData.countries[i % RefData.countries.length];
            var year = RefData.DOBs[i % RefData.DOBs.length].getFullYear();
            var month = (Math.random() * 10);
            rowData.push({
                name: RefData.firstNames[i % RefData.firstNames.length] + ' ' + RefData.lastNames[i % RefData.lastNames.length],
                year: RefData.DOBs[i % RefData.DOBs.length].toLocaleDateString(undefined, options),
                purchasedOn: RefData.DOBs[i % RefData.DOBs.length].getFullYear(),
                // address: RefData.addresses[i % RefData.addresses.length],
                // years: Math.round(Math.random() * 100),
                active: Math.random() < 0.5,
                usageType: RefData.usageTypes[Math.random() < 0.5 ? 1 : 0],
                evaluationsType: RefData.evaluationTypes[0],
                evaluationPeriod:"JAN'20-DEC'20",
                empPurchasesCount: Math.round(Math.random() * 100),
                licPurchasesCount: Math.round(Math.random() * 10),
                purchasesCount: Math.round(Math.random() * 1000),
                minPurchasedOn: new Date(2010, 0, 1).toLocaleDateString(undefined, options),
                children: this.createHistoryData()

                // mobile: this.createRandomPhoneNumber(),
                // landline: this.createRandomPhoneNumber()
            });
            // purchaseDates.push(RefData.DOBs[i % RefData.DOBs.length]);
        }
        // console.log(rowData);
        this.rowData = rowData;
        // console.log(this.rowData[0]);
    }

    private createHistoryData() {
        const rowData: any[] = [];
        var options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        // console.log('inside createHistoryData : ');
        for (let i = 0; i < 20; i++) {
            var year = RefData.DOBs[i % RefData.DOBs.length].getFullYear();
            var month = (Math.random() * 10);
            rowData.push({
                evaluationPeriod:"JAN'20-DEC'20",
                purchasedOn: new Date(2010, 0, 1).toLocaleDateString(undefined, options),
                evaluationsType: RefData.evaluationTypes[0],
                purchaseCount: Math.round(Math.random() * 10),

            });
        }
        return rowData;
    }

    getPsaClientInfoColumnDefs() {
        return ReportTemplates.psaClientInfoColumnDefs.columnDefs;
    }
   

    gotoDashboard() {
        this.router.navigate(['/psa/dashboard'])
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

    currencyFormatter(params: any) {
        return '\xA3' + this.formatNumber(params.value);
    }

    formatNumber(number: number) {
        return Math.floor(number)
            .toString()
            .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    }

    filterClientHistory(data: string) {
        let dateFilterComponent = this.api.getFilterInstance('name');
        dateFilterComponent.setModel({
            type: 'equals',
            dateFrom: data
        });
        this.api.onFilterChanged();
    }



    public dobFilter() {
        let dateFilterComponent = this.api.getFilterInstance('dob');
        dateFilterComponent.setModel({
            type: 'equals',
            dateFrom: '2000-01-01'
        });
        this.api.onFilterChanged();
    }

    private sortByColIdAsc(colId) {
        this.gridOptions.columnApi.applyColumnState({
            state: [
                {
                    colId: colId,
                    sort: 'asc',
                },
            ],
            defaultState: { sort: null },
        });
    }

    onReady(params: any) {
        this.api = params.api;
        console.log('onReady');
        this.api.sizeColumnsToFit();
        this.gridOptions.rowHeight = 34;
        this.gridOptions.groupMultiAutoColumn = true;
        this.gridOptions.columnApi.setColumnVisible('isPastData', false);
        if (showingPurchaseHistory) {
            this.sortByColIdAsc('purchasedOn');
        }
        // params.api.setDomLayout('autoHeight');
    }

    private setHeaderNames() {
        var columnDefs = this.getPsaClientInfoColumnDefs();
        columnDefs.forEach(function (colDef, index) {
            if (colDef.headerName === 'Client Since') {
                colDef.headerName = 'Purchased On';
            }
        });
        this.api.setColumnDefs(columnDefs);

    }

    private removeHeaderNames() {
        var columnDefs = this.getPsaClientInfoColumnDefs();
        this.api.setColumnDefs(columnDefs);
    }

    private onCellClicked(event) {
        console.log("inside onCellClicked : ", event.value);
        clientSelected = event.value;
        if (!showingPurchaseHistory) {
            showingPurchaseHistory = true;
            this.setHeaderNames();
            this.api.refreshCells({ force: true });
        } else {
            showingPurchaseHistory = false;
            this.removeHeaderNames();
            this.api.refreshCells({ force: true });
        }
        console.log("inside onCellClicked clientSelected set to : ", clientSelected);
        this.externalFilterChanged(clientSelected);

    }

    private externalFilterChanged(newValue) {
        console.log("inside externalFilterChanged : ", newValue);
        clientSelected = newValue;
        if (clientSelected) {
            this.api.onFilterChanged();
        }
    }

    isExternalFilterPresent() {
        console.log("inside isExternalFilterPresent : ", showingPurchaseHistory);
        // return showingPurchaseHistory;
        return false;//set true to enable external filter
    }

    doesExternalFilterPass(node) {
        if (showingPurchaseHistory) {
            return node.data.name == clientSelected;
        }
        return node.data.year == node.data.minPurchasedOn;
    }


    public onQuickFilterChanged($event: any) {
        this.api.setQuickFilter($event.target.value);
    }

}

var showingPurchaseHistory: boolean = false;
var clientSelected: string;

