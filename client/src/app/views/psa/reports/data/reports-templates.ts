export default class RSAReportTemplates {

    // Payment Date	Evaluation Period	Type of Evaluation	# of Evaluations	Amount		
    static csaPaymentsSummaryColumnDefs = {
        columnDefs: [
            { headerName: 'Payment Date', field: 'purchasedOn' },
            { headerName: 'Evaluation Period', field: 'evaluationPeriod', sortable: true, minWidth: 50, width: 128, resizable: true, filter: true },
            { headerName: 'Type of Evaluations', field: 'evaluationsType', minWidth: 50, width: 128, resizable: true, sortable: true, filter: true },
            { headerName: '# of Evaluations', field: 'licPurchasesCount', sortable: true, minWidth: 50, width: 128, resizable: true, filter: true },
            { headerName: 'Amount', field: 'licPurchasesCount' },
        ],
    }

    // Evaluation Period	Type of Evaluations	# of Evaluations				
    static csaEvaluationsSummaryColumnDefs = {
        columnDefs: [
            { headerName: 'Evaluation Period', field: 'evaluationPeriod', sortable: true, minWidth: 50, width: 128, resizable: true, filter: true },
            { headerName: 'Type of Evaluations', field: 'evaluationsType', minWidth: 50, width: 128, resizable: true, sortable: true, filter: true },
            { headerName: '# of Evaluations', field: 'licPurchasesCount', sortable: true, minWidth: 50, width: 128, resizable: true, filter: true },
        ],
    }
    // Client	Client Since	Active	Usage Type	Type of Evaluations	Evaluation Period	#s Purchased (license) (in that evaluation period)	#s Purchased (# of Employees) (in that evaluation period)

    static rsaReportColumnDefs = {
        columnDefs: [
            {
                headerName: 'Client', field: 'name', tooltipField: 'Client', minWidth: 200, width: 128, resizable: true, sortable: true, suppressSizeToFit: true, filter: true,
            },
            { headerName: 'Client Since', field: 'year', resizable: true, minWidth: 50, width: 128, sortable: true, filter: true },
            { headerName: 'Active', field: 'active', sortable: true, minWidth: 50, resizable: true, width: 128, filter: true },
            { headerName: 'Usage Type', field: 'usageType', sortable: true, minWidth: 50, width: 128, resizable: true, filter: true },
            { headerName: 'Type of Evaluations', field: 'evaluationsType', minWidth: 50, width: 128, resizable: true, sortable: true, filter: true },
            { headerName: 'Evaluation Period', field: 'evaluationPeriod', sortable: true, minWidth: 50, width: 128, resizable: true, filter: true },
            { headerName: '#s Purchased (# of licenses) (in that evaluation period)', field: 'licPurchasesCount', sortable: true, minWidth: 50, width: 128, resizable: true, filter: true },
            { headerName: '#s Purchased (# of Employees) (in that evaluation period)', field: 'empPurchasesCount', sortable: true, minWidth: 50, width: 128, resizable: true, filter: true }
        ],
    }

    // Reseller	Active	Revenue (all years)	Payment Type (Monthly/Yearly)				

    static psaResellerRevenueInfoColumnDefs = {
        columnDefs: [
            {
                headerName: 'Reseller', field: 'reSellerName', tooltipField: 'Client', minWidth: 200, width: 128, resizable: true, sortable: true, suppressSizeToFit: true, filter: true,
                cellRenderer: 'agGroupCellRenderer'
            },
            { headerName: 'Active', field: 'active', sortable: true, minWidth: 50, resizable: true, width: 128, filter: true },
            { headerName: 'Revenue (all years)', field: 'purchasesCount', sortable: true, minWidth: 50, width: 128, resizable: true, filter: true },
            { headerName: 'Payment Type (Monthly/Yearly)', field: 'paymentTypes', sortable: true, minWidth: 50, width: 128, resizable: true, filter: true },

        ],
        detailCellRendererParams: {
            detailGridOptions: {
                pagination: true,
                paginationPageSize: 3,
                // Date of Purchase	Usage Type	Revenue from Licenses (CAD)	Revenue from # of Employees (CAD)				
                columnDefs: [
                    { headerName: 'Date of Purchase', field: 'purchasedOn' },
                    { headerName: 'Usage Type', field: 'usageType' },
                    { headerName: 'Revenue from Licenses (CAD)', field: 'purchaseCount' },
                    { headerName: 'Revenue from # of Employees (CAD)', field: 'purchaseCount' },
                ],
                defaultColDef: { flex: 1, sortable: true },
                // detailRowAutoHeight:true,
                onGridReady: function (params) {
                    // params.api.setDomLayout('autoHeight');
                },
            },
            getDetailRowData: function (params) {
                params.successCallback(params.data.children);
            },
        },


    }

    // Client	Active	Usage Type	Type of Evaluations	Revenue (all years)	Payment Type (Monthly/Yearly)		

    static psaClientRevenueInfoColumnDefs = {
        columnDefs: [
            {
                headerName: 'Client', field: 'name', tooltipField: 'Client', minWidth: 200, width: 128, resizable: true, sortable: true, suppressSizeToFit: true, filter: true,
                // onCellClicked: this.onCellClicked.bind(this),
                cellRenderer: 'agGroupCellRenderer'
            },
            { headerName: 'Active', field: 'active', sortable: true, minWidth: 50, resizable: true, width: 128, filter: true },
            { headerName: 'Usage Type', field: 'usageType', sortable: true, minWidth: 50, width: 128, resizable: true, filter: true },
            { headerName: 'Type of Evaluations', field: 'evaluationsType', minWidth: 50, width: 128, resizable: true, sortable: true, filter: true },
            { headerName: 'Revenue (all years)', field: 'purchasesCount', sortable: true, minWidth: 50, width: 128, resizable: true, filter: true },
            { headerName: 'Payment Type (Monthly/Yearly)', field: 'paymentTypes', sortable: true, minWidth: 50, width: 128, resizable: true, filter: true },

        ],
        detailCellRendererParams: {
            detailGridOptions: {
                pagination: true,
                paginationPageSize: 3,
                // Evaluation Period	Date of Purchase	Type of Evaluation	#s Purchased	Amount (CAD)			
                columnDefs: [
                    { headerName: 'Evaluation Period', field: 'evaluationPeriod' },
                    { headerName: 'Date of Purchase', field: 'purchasedOn' },
                    { headerName: 'Type of Evaluation', field: 'evaluationsType' },
                    { headerName: '#s Purchased', field: 'purchaseCount' },
                    { headerName: 'Amount (CAD)', field: 'purchaseCount' },
                ],
                defaultColDef: { flex: 1, sortable: true },
                // detailRowAutoHeight:true,
                onGridReady: function (params) {
                    // params.api.setDomLayout('autoHeight');
                },
            },
            getDetailRowData: function (params) {
                params.successCallback(params.data.children);
            },
        },


    }
    static psaClientInfoColumnDefs = {
        columnDefs: [
            {
                headerName: 'Client', field: 'name', tooltipField: 'Client', minWidth: 200, width: 128, resizable: true, sortable: true, suppressSizeToFit: true, filter: true,
                // onCellClicked: this.onCellClicked.bind(this),
                cellRenderer: 'agGroupCellRenderer'
            },
            { headerName: 'Client Since', field: 'year', resizable: true, minWidth: 50, width: 128, sortable: true, filter: true },
            { headerName: 'Active', field: 'active', sortable: true, minWidth: 50, resizable: true, width: 128, filter: true },
            { headerName: 'Usage Type', field: 'usageType', sortable: true, minWidth: 50, width: 128, resizable: true, filter: true },
            { headerName: 'Type of Evaluations', field: 'evaluationsType', minWidth: 50, width: 128, resizable: true, sortable: true, filter: true },
            { headerName: 'Evaluation Period', field: 'evaluationPeriod', sortable: true, minWidth: 50, width: 128, resizable: true, filter: true },
            { headerName: '#s Purchased (License)', field: 'licPurchasesCount', sortable: true, minWidth: 50, width: 128, resizable: true, filter: true },
            { headerName: '#s Purchased (# of Employees)', field: 'empPurchasesCount', sortable: true, minWidth: 50, width: 128, resizable: true, filter: true },
            {
                headerName: "Actions", suppressSizeToFit: true, Sorting: false,
                cellRenderer: (data) => {
                    return `  <i class="fa fa-history" onCellClicked: this.gotoDashboard.bind(this)  style="cursor:pointer ;padding: 7px 20px 0 0;
                    font-size: 17px;"   data-action-type="edit" title="view purchase history" ></i>`
                }
            }

        ],
        detailCellRendererParams: {
            detailGridOptions: {
                pagination: true,
                paginationPageSize: 3,
                columnDefs: [
                    { headerName: 'Date of Purchase', field: 'purchasedOn' },
                    { headerName: 'Type of Evaluation', field: 'evaluationsType' },
                    { headerName: '#s Purchased (# of Employees)', field: 'purchaseCount' },
                    { headerName: '#s Purchased (License)', field: 'purchaseCount' },
                    {
                        headerName: 'Action',
                        cellRenderer: (data) => {
                            return `<button onCellClicked: this.gotoDashboard.bind(this) ngcontent-fha-c25="" 
                    class="btn btn-primary mr-1 pull-right" data-toggle="modal" type="button">
                    <i class="fa fa-arrow-left"></i> </button>`}
                    }
                ],
                defaultColDef: { flex: 1, sortable: true },
                // detailRowAutoHeight:true,
                onGridReady: function (params) {
                    // params.api.setDomLayout('autoHeight');
                },
            },
            getDetailRowData: function (params) {
                params.successCallback(params.data.children);
            },
        },


    }

    static psaResellerInfoColumnDefs = {
        columnDefs: [
            // default table
            // Reseller	Reseller Since	Active	#s Purchased (License)	#s Purchased (# of Employees)			

            {
                headerName: 'Reseller', field: 'reSellerName', tooltipField: 'Client', pinned: true, minWidth: 200, width: 128, resizable: true, sortable: true, suppressSizeToFit: true, filter: true,
                cellRenderer: 'agGroupCellRenderer'
                // onCellClicked: this.onCellClicked.bind(this)
            },
            { headerName: 'Reseller Since', field: 'year', resizable: true, minWidth: 50, width: 128, sortable: true, filter: true },
            { headerName: 'Active', field: 'active', sortable: true, minWidth: 50, resizable: true, width: 128, filter: true },
            { headerName: '#s Purchased (License)', field: 'purchasesCount', sortable: true, minWidth: 50, width: 128, resizable: true, filter: true },
            { headerName: '#s Purchased (# of Employees)', field: 'purchasesCount', sortable: true, minWidth: 50, width: 128, resizable: true, filter: true },

        ],
        detailCellRendererParams: {
            detailGridOptions: {
                // detailRowAutoHeight:true,
                pagination: true,
                paginationPageSize: 3,
                columnDefs: [
                    {
                        headerName: 'Client', field: 'name', tooltipField: 'Client', minWidth: 200, width: 128, resizable: true, sortable: true, suppressSizeToFit: true, filter: true,
                        // onCellClicked: this.onCellClicked.bind(this),
                        cellRenderer: 'agGroupCellRenderer'
                    },
                    { headerName: 'Client Since', field: 'year', resizable: true, minWidth: 50, width: 128, sortable: true, filter: true },
                    { headerName: 'Active', field: 'active', sortable: true, minWidth: 50, resizable: true, width: 128, filter: true },
                    { headerName: 'Usage Type', field: 'usageType', sortable: true, minWidth: 50, width: 128, resizable: true, filter: true },
                    { headerName: 'Type of Evaluations', field: 'evaluationsType', minWidth: 50, width: 128, resizable: true, sortable: true, filter: true },
                    { headerName: 'Evaluation Period', field: 'evaluationPeriod', sortable: true, minWidth: 50, width: 128, resizable: true, filter: true },
                    { headerName: '#s Purchased (License)', field: 'licPurchasesCount', sortable: true, minWidth: 50, width: 128, resizable: true, filter: true },
                    { headerName: '#s Purchased (# of Employees)', field: 'empPurchasesCount', sortable: true, minWidth: 50, width: 128, resizable: true, filter: true }

                ],
                defaultColDef: { flex: 1, sortable: true },
                masterDetail: true,
                detailCellRendererParams: {
                    detailGridOptions: {
                        pagination: true,
                        paginationPageSize: 3,
                        columnDefs: [
                            { headerName: 'Date of Purchase', field: 'purchasedOn' },
                            { headerName: 'Type of Evaluation', field: 'evaluationsType' },
                            { headerName: '#s Purchased (License)', field: 'purchaseCount' },
                            { headerName: '#s Purchased (# of Employees)', field: 'purchaseCount' },
                        ],
                        defaultColDef: { flex: 1, sortable: true },
                        // detailRowAutoHeight:true,
                        onGridReady: function (params) {
                            // params.api.setDomLayout('autoHeight');
                        },
                    },
                    getDetailRowData: function (params) {
                        params.successCallback(params.data.children);
                    },
                },
                onGridReady: function (params) {
                    // params.api.setDomLayout('autoHeight');
                },
            },
            getDetailRowData: function (params) {
                params.successCallback(params.data.children);
            },
        },


    }
    static defaultColDef = {
        flex: 1,
        resizable: true,
        wrapText: true,
        // autoHeight: true,
        sortable: true,
        filter: true,
        menuTabs: ['filterMenuTab',],
        headerComponentParams: {
            template:
                '<div class="ag-cell-label-container" role="presentation">' +
                '  <span ref="eMenu" class="ag-header-icon ag-header-cell-menu-button"></span>' +
                '  <div ref="eLabel" class="ag-header-cell-label" role="presentation">' +
                '    <span ref="eSortOrder" class="ag-header-icon ag-sort-order"></span>' +
                '    <span ref="eSortAsc" class="ag-header-icon ag-sort-ascending-icon"></span>' +
                '    <span ref="eSortDesc" class="ag-header-icon ag-sort-descending-icon"></span>' +
                '    <span ref="eSortNone" class="ag-header-icon ag-sort-none-icon"></span>' +
                '    <span ref="eText" class="ag-header-cell-text" role="columnheader" style="white-space: normal;"></span>' +
                '    <span ref="eFilter" class="ag-header-icon ag-filter-icon"></span>' +
                '  </div>' +
                '</div>',
        },
    };
    static getYear() {
        var currentYear: string = new Date().getFullYear().toString();
        currentYear = currentYear.substring(2);
        return currentYear;
    }
  
   static getYearStart(month: string) {
        if (this.months.indexOf(month) > new Date().getMonth()) {
            var currentYear: string = (new Date().getFullYear()-1).toString();
            currentYear = currentYear.substring(2);
            return currentYear;
        } else {
            var currentYear: string = new Date().getFullYear().toString();
            currentYear = currentYear.substring(2);
            return currentYear;
        }
    }

    static getYearEnd(month: string) {
        if (this.months.indexOf(month) >= new Date().getMonth()) {
            var currentYear: string = new Date().getFullYear().toString();
            currentYear = currentYear.substring(2);
            return currentYear;
        } else {
            var currentYear: string = (new Date().getFullYear()+1).toString();
            currentYear = currentYear.substring(2);
            return currentYear;
        }
    }
    static months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July",
        "Aug", "Sep", "Oct", "Nov", "Dec"];
    static headerHeightGetter() {
        var columnHeaderTexts = document.querySelectorAll('.ag-header-cell-text');
        var columnHeaderTextsArray = [];
        columnHeaderTexts.forEach(node => columnHeaderTextsArray.push(node));
        var clientHeights = columnHeaderTextsArray.map(
            headerText => headerText.clientHeight
        );
        var tallestHeaderTextHeight = Math.max(...clientHeights);
        return tallestHeaderTextHeight;
    }
}

