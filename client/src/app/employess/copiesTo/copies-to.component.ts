
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { EmployeeService } from '../../services/employee.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-copies-to',
  templateUrl: './copies-to.component.html',
  styleUrls: ['./copies-to.component.css']
})
export class CopiesToComponent implements OnInit {
  copiesToList = [];
  loginUser: any;
  empSelected: any;
  copiesToView: boolean = true;
  isPdfView: boolean = false;
  currentRowItem: any;

  public currentOrganization: any = {};

  constructor(
    private authService: AuthService,
    private snack: NotificationService,
    private employeeService: EmployeeService,
  ) {
    this.loginUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.getCopiesToList();
  }

  onGridReady(params) {
    params.api.sizeColumnsToFit();
  }
  onTsGridReady(params) {
    params.api.sizeColumnsToFit();
  }
  onCopiesToGridReady(params) {
    params.api.sizeColumnsToFit();
  }

  getCopiesToList() {
    let { _id } = this.loginUser;
    let requestBody: any = { userId: _id }
    this.employeeService.getCopiesTO(requestBody).subscribe(response => {
      console.log(response);
      this.copiesToList = response.map(row => {
        row.Name = row.FirstName + ' ' + row.LastName;
        return {
          Name: row.Name,
          RowData: row
        }
      }
      )
    })
  }

  public copiesToColumnDefs = [
    { headerName: 'Employee', field: 'Name', sortable: true, filter: true, },
    {
      headerName: 'Action', field: '', autoHeight: true, suppressSizeToFit: true,
      cellRenderer: (data) => {
        var returnString = '';
        returnString += `<i class="cui-map" style="cursor:pointer; padding: 7px 20px 0 0;
      font-size: 17px;"   data-action-type="viewReport" title="View Evaluation Report"></i>`;
        return returnString;
      }
    }
  ];

  onGridSizeChanged(params) {
    params.api.sizeColumnsToFit();
  }
  public getRowHeight = function (params) {
    return 34;
  };

  exitReportView() {
    this.isPdfView = false;
  }

  async pdfView(e) {
    if (e.event.target !== undefined) {
      this.currentRowItem = e.data.RowData;
      this.empSelected = await this.authService.FindUserById(this.currentRowItem._id).subscribe(c => {
        if (c) {
          console.log('user by id pdf view:::', c);
          this.empSelected = c;
          this.currentOrganization = this.authService.getOrganization();
          this.isPdfView = true;
        }
      }
        , error => {
          this.snack.error(error.error.message);
        }
      );
    }
  }
}

