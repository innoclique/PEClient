import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { GridOptions } from 'ag-grid-community';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { PerfAppService } from '../../services/perf-app.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-action-plan',
  templateUrl: './action-plan.component.html',
  styleUrls: ['./action-plan.component.css']
})
export class ActionPlanComponent implements OnInit {
  loginUser: any;
  devGoalRecords: any;

  
  public goalsItemColumns: GridOptions = {
    columnDefs: this.getColDef()      
  }
  currentRowItem: any;

  constructor(private formBuilder: FormBuilder,
    private authService: AuthService,
    public router: Router,
    private activatedRoute: ActivatedRoute,
    public dialog: MatDialog,
    public themeService: ThemeService,
    private snack: NotificationService,
    private perfApp: PerfAppService,
    public translate: TranslateService) {

    this.loginUser = this.authService.getCurrentUser();

    this.getAllDevGoalsDetails();

    }

  ngOnInit(): void {
  }


  
  getColDef(){
    return [
       { headerName: 'Developmental Goals', field: 'DevGoal', width: 250, autoHeight: true ,
       cellRenderer: (data) => {
        return `<a href="/" onclick="return false;"   data-action-type="VF">${data.value}</a>`
       }
      } ,
       { headerName: 'Desired Outcomes', field: 'DesiredOutcomes', width: 200, autoHeight: true },
       { headerName: '# of Action Steps', field: 'GoalActionItems', width: 150, autoHeight: true ,
       cellRenderer: (data) => {
        return data.data.GoalActionItems?data.data.GoalActionItems.length:0
       }
      },
      { headerName: 'Is Draft', field: 'IsDraft', width: 120, sortable: true, filter: true ,
      cellRenderer: (data) => {
        return data.data.IsDraft?'Yes':'No'
       }
      },
       { headerName: 'Is Submited', field: 'IsSubmited', width: 150, sortable: true, filter: true ,
       cellRenderer: (data) => {
         return data.data.IsSubmited?'Yes':'No'
        }
      },
       {
         headerName: "Action",
         suppressMenu: true,
         Sorting: false,
         width: 120,
         template: `
         
         <i class="icon-pencil" style="cursor:pointer ;padding: 7px 20px 0 0;
        font-size: 17px;"   data-action-type="EDG" title="Edit Goal" ></i>     
        
                
        `
   
       }
   
   
     ];
   }

   openStrengthsForm(){
    this.router.navigate(['employee/dev-goal']);

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

       
      this.devGoalRecords=c;
    

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

}
