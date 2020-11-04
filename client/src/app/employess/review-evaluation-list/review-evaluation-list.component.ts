
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ModalDirective, BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { AlertDialog } from '../../Models/AlertDialog';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { PerfAppService } from '../../services/perf-app.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-review-evaluation-list',
  templateUrl: './review-evaluation-list.component.html',
  styleUrls: ['./review-evaluation-list.component.css']
})
export class ReviewEvaluationListComponent implements OnInit {


  public empForm: FormGroup;
  departments=[];
  jobRoles=[];
  appRoles: any;
  jobLevels: any;
  loginUser: any;

  filteredOptions: Observable<any[]>;
  filteredOptionsTS: Observable<any[]>;
  filteredOptionsDR: Observable<any[]>;
  config = {
    backdrop: true,
    ignoreBackdropClick: true,
    class: 'gray modal-lg'
  };
  currentRowItem: any;
  // @ViewChild('addEmployee', { static: true }) addEmployeeView: TemplateRef<any>;
  @ViewChild("addEmployee", { static: true }) emoModal: ModalDirective;
  viewEmpFormRef: BsModalRef;
  countyFormReset: boolean;
  isRoleChanged: boolean;
  empDetails: any={}
  currentAction='create';
  cscData:any=undefined;

  public alert: AlertDialog;
  public currentOrganization:any={};
  employeeData: any;

  constructor(private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    public themeService: ThemeService,
    private modalService: BsModalService,
    private snack: NotificationService,
    private perfApp: PerfAppService,
    public translate: TranslateService) { 


      this.loginUser=this.authService.getCurrentUser();
    }



  ngOnInit(): void {

    this.getEmployees();
  }



  
  public columnDefs = [
    {headerName: 'Employee', field: 'Name', width: 320, sortable: true, filter: true,
    cellRenderer: (data) => {
      return `<a href="/" onclick="return false;"   data-action-type="VF">${data.value}</a>`
    }},
    {headerName: 'Title', field: 'Title', sortable: true, filter: true },
    // {headerName: 'Department', field: 'Department', sortable: true, filter: true },
    {headerName: 'Phone', field: 'PhoneNumber', sortable: true, filter: true },
    // {headerName: 'IsDraft', field: 'IsDraft',  width: 120, sortable: true, filter: true },
    {headerName: 'IsActive', field: 'IsActive',  width: 120, sortable: true, filter: true },
    {
      headerName: 'Action', field: '', width: 200, autoHeight: true, suppressSizeToFit: true,
      cellRenderer: (data) => {

        var returnString = '';
        returnString += `<i class="cui-pencil" style="cursor:pointer; padding: 7px 20px 0 0;
        font-size: 17px;"   data-action-type="EF" title="Edit"></i>`;
        return returnString;
      }
    }
];



public onEmpGridRowClick(e) {
  if (e.event.target !== undefined) {
    this.currentRowItem = e.data.RowData;;
  
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
    
      case "VF":
        this.viewEmpForm(this.currentRowItem);
        break;
        case "EF":
          this.editEmpForm(this.currentRowItem);
          break;
     
      default:
    }
  }
}
  editEmpForm(currentRowItem: any) {
    
    this.router.navigate(['employee/review-evaluation']);
  }
  viewEmpForm(currentRowItem: any) {
    throw new Error('Method not implemented.');
  }


getEmployees(){
  this.perfApp.route="app";
  this.perfApp.method="GetDirectReporteesOfManager",
 this.perfApp.requestBody = { id: this.loginUser._id }
  this.perfApp.CallAPI().subscribe(c=>{
    
    
    this.employeeData=c.map(function (row) {
      
     
     return  {Name:row.FirstName+' '+row.LastName
       
        ,RowData:row
      }
    }
    )
  })
}

}

