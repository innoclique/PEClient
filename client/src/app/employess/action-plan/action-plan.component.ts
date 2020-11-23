import { Component, OnInit,ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { GridOptions } from 'ag-grid-community';
import { TabsetComponent } from 'ngx-bootstrap/tabs';
import { AlertDialog } from '../../Models/AlertDialog';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { PerfAppService } from '../../services/perf-app.service';
import { ThemeService } from '../../services/theme.service';
import { AlertComponent } from '../../shared/alert/alert.component';

@Component({
  selector: 'app-action-plan',
  templateUrl: './action-plan.component.html',
  styleUrls: ['./action-plan.component.css']
})
export class ActionPlanComponent implements OnInit {
  loginUser: any;
  devGoalRecords: any;
  strengthRecords: any;
  activeTabIndex:any=0;
  @ViewChild('staticTabs', { static: false }) staticTabs: TabsetComponent;
 
  
  public goalsItemColumns: GridOptions = {
    columnDefs: this.getColDef()      
  }
  public strengthItemColumns: GridOptions = {
    columnDefs: this.getStrengthColDef()      
  }

  
  currentRowItem: any;
  alert = new AlertDialog();
  unSubmitedCount=0;
  unSubmitedStrenthCount=0;


  constructor(private formBuilder: FormBuilder,
    private authService: AuthService,
    public router: Router,
    private activatedRoute: ActivatedRoute,
    public dialog: MatDialog,
    public themeService: ThemeService,
    private snack: NotificationService,
    private perfApp: PerfAppService,
    public translate: TranslateService) {
      this.activatedRoute.params.subscribe(params => {
        if (params['activeTab']) {
         this.activeTabIndex = params['activeTab'];
        }
       });
    this.loginUser = this.authService.getCurrentUser();

    this.getAllDevGoalsDetails();
    this.getAllStrengthDetails();
     
    }

  ngOnInit(): void {
    
  }
  
  selectTab(tabId: number) {
    this.staticTabs.tabs[tabId].active = true;
  }

  
  getColDef(){
    return [
       { headerName: 'Developmental Goals', field: 'DevGoal', width: 250, autoHeight: true ,
       cellRenderer: (data) => {
        return `<a href="/" onclick="return false;"   data-action-type="VF">${data.value}</a>`
       }
      } ,
       { headerName: 'Desired Outcomes', field: 'DesiredOutcomes', width: 250, autoHeight: true },
       { headerName: '# of Action Steps', field: 'GoalActionItems', width: 150, autoHeight: true ,
       cellRenderer: (data) => {
        return data.data.GoalActionItems?data.data.GoalActionItems.length:0
       }
      },
      { headerName: 'Draft', field: 'IsDraft', width: 180, sortable: true, filter: true ,
      cellRenderer: (data) => {
        return data.data.IsDraft?'Yes':'No'
       }
      },
       { headerName: 'Submited', field: 'IsGoalSubmited', width: 200, sortable: true, filter: true ,
       cellRenderer: (data) => {
         return data.data.IsGoalSubmited?'Yes':'No'
        }
      },
       {
         headerName: "Action",
         suppressMenu: true,
         Sorting: false,
         width: 200,
         template: `
         
         <i class="icon-pencil" style="cursor:pointer ;padding: 7px 20px 0 0;
        font-size: 17px;"   data-action-type="EDG" title="Edit Goal" ></i>     
        
                
        `
   
       }
   
   
     ];
   }

   getStrengthColDef(){
    return [
       { headerName: 'Strength', field: 'Strength', width: 220, autoHeight: true ,
       cellRenderer: (data) => {
        return `<a href="/" onclick="return false;"   data-action-type="VF">${data.value}</a>`
       }
      } ,
       { headerName: 'Leverage', field: 'Leverage', width: 200, autoHeight: true },
       { headerName: 'Team Benefit', field: 'TeamBenifit', width: 150, autoHeight: true },
       { headerName: 'Self Benefit', field: 'SelfBenifit', width: 150, autoHeight: true },
       
      { headerName: 'Draft', field: 'IsDraft', width: 150, sortable: true, filter: true ,
      cellRenderer: (data) => {
        return data.data.IsDraft?'Yes':'No'
       }
      },
      { headerName: 'Submited', field: 'IsStrengthSubmited', width: 150, sortable: true, filter: true ,
      cellRenderer: (data) => {
        return data.data.IsStrengthSubmited?'Yes':'No'
       }
     },
       
       {
         headerName: "Action",
         suppressMenu: true,
         Sorting: false,
         width: 210,
         template: `
         
         <i class="icon-pencil" style="cursor:pointer ;padding: 7px 20px 0 0;
        font-size: 17px;"   data-action-type="EDG" title="Edit Goal" ></i>     
        
                
        `
   
       }
   
   
     ];
   }

   openStrengthsForm(){
    this.router.navigate(['employee/strengths']);

   }

   openDevGoalForm(){
    this.router.navigate(['employee/dev-goal']);
   }
   
getAllDevGoalsDetails() {
  this.perfApp.route = "app";
  this.perfApp.method = "GetAllDevGoals",
    this.perfApp.requestBody = { 'empId': this.loginUser._id,
    'currentOnly':true,'fetchAll':true,
    'orgId':this.authService.getOrganization()._id}
  this.perfApp.CallAPI().subscribe(c => {

    this.unSubmitedCount=c.filter(e=>e.IsGoalSubmited==false && e.IsDraft==false ).length;
      this.devGoalRecords=c;
    

  }
  
  , error => {
   

    this.snack.error(error.error.message);

  }
  
  )
}



getAllStrengthDetails() {
  this.perfApp.route = "app";
  this.perfApp.method = "GetAllStrengths",
    this.perfApp.requestBody = { 'empId': this.loginUser._id,
    'currentOnly':true,'fetchAll':true,
    'orgId':this.authService.getOrganization()._id}
  this.perfApp.CallAPI().subscribe(c => {

    this.unSubmitedStrenthCount=c.filter(e=>e.IsStrengthSubmited==false && e.IsDraft==false ).length;
    this.strengthRecords=c;
      this.selectTab(this.activeTabIndex);

  }
  
  , error => {
   

    this.snack.error(error.error.message);

  }
  
  )
}



public onDevGoalGridRowClick(e) {
  if (e.event.target !== undefined) {
    this.currentRowItem = e.data;

    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {

      case "VF":
        this.viewKpiForm(this.currentRowItem);
        break;
      case "EDG":
          this.editKpiForm(this.currentRowItem);
        break;

       

          case "Track":
            this.trackKpi();
        break;



      default:
    }
  }
}
trackKpi() {

   // this.trackViewRef = this.modalService.show(this.kpiTrackView, this.config);
}





editKpiForm(currentRowItem: any) {
   

  this.router.navigate(['employee/dev-goal',{action:'edit',id:this.currentRowItem._id}],{ skipLocationChange: true });
  
}



viewKpiForm(currentRowItem: any) {


this.router.navigate(['employee/dev-goal',{action:'view',id:this.currentRowItem._id}],{ skipLocationChange: true });

}


viewStrengthForm(currentRowItem: any) {


  this.router.navigate(['employee/strengths',{action:'view',id:this.currentRowItem._id}],{ skipLocationChange: true });
  
  }

public onStrengthGridRowClick(e) {
  if (e.event.target !== undefined) {
    this.currentRowItem = e.data;

    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {

      case "VF":
        this.viewStrengthForm(this.currentRowItem);
        break;
      case "EDG":
          this.editStrengthForm(this.currentRowItem);
        break;

       

          case "Track":
            //this.trackKpi();
        break;



      default:
    }
  }
}




   /**To alert user for submit */
   openConfirmSubmitDialog() {
    this.alert.Title = "Alert";
    this.alert.Content = "Are you sure you want to submit the action plan?";
    this.alert.ShowCancelButton = true;
    this.alert.ShowConfirmButton = true;
    this.alert.CancelButtonText = "Cancel";
    this.alert.ConfirmButtonText = "Continue";
  
  
    const dialogConfig = new MatDialogConfig()
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = this.alert;
    dialogConfig.height = "300px";
    dialogConfig.maxWidth = '40%';
    dialogConfig.minWidth = '40%';
  
  
    var dialogRef = this.dialog.open(AlertComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(resp => {
     if (resp=='yes') {
      this.perfApp.requestBody.IgnoreEvalAdminCreated=true;
      this.submitActionPlan();
     } else {
      
     }
    })
  }

submitActionPlan() {

  this.perfApp.route = "app";
  this.perfApp.method = "SubmitActionPlanByEmp",
    this.perfApp.requestBody = { 'empId': this.loginUser._id }
  this.perfApp.CallAPI().subscribe(c => {

   if (c) {
    this.snack.success(c.message);
    this.getAllDevGoalsDetails();
    this.getAllStrengthDetails();
   } else {
     
   }

  }
  
  , error => {

    this.snack.error(error.error.message);

  }
  
  )
}

editStrengthForm(currentRowItem: any) {
   

  this.router.navigate(['employee/strengths',{action:'edit',id:this.currentRowItem._id}],{ skipLocationChange: true });
  
}

}
