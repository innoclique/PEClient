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
            { headerName: '#s Purchased (# of Employees)', field: 'empPurchasesCount', sortable: true, minWidth: 50, width: 128, resizable: true, filter: true }

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
            // template: function (params) {
            //     var personName = params.data.reSellerName;
            //     return (
            //       '<div style="height: 100%; background-color: #EDF6FF; padding: 20px; box-sizing: border-box;">' +
            //       '  <div style="height: 10%; padding: 2px; font-weight: bold;">###### Reseller : ' +
            //       personName +
            //       '</div>' +
            //       '  <div ref="eDetailGrid" style="height: 90%;"></div>' +
            //       '</div>'
            //     );
            //   },
        },


    }
}