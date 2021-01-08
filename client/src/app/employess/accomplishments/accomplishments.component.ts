
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import html2canvas from 'html2canvas';
import  {jsPDF}  from "jspdf"; 

// import * as jsPDF from 'jspdf';

import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { AlertDialog } from '../../Models/AlertDialog';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { PerfAppService } from '../../services/perf-app.service';
import { ThemeService } from '../../services/theme.service';
import { AlertComponent } from '../../shared/alert/alert.component';
import { Constants } from '../../shared/AppConstants';
import { CustomValidators } from '../../shared/custom-validators';
import ReportTemplates from '../../views/psa/reports/data/reports-templates';

@Component({
  selector: 'app-accomplishments',
  templateUrl: './accomplishments.component.html',
  styleUrls: ['./accomplishments.component.css']
})
export class AccomplishmentsComponent implements OnInit {


  public kpiForm: FormGroup;
  kpiDetails: any = { ShowToManager:false, IsActive: 'true',MeasurementCriteria:[] }
  loginUser: any;
  public alert: AlertDialog;
  appScores: any = [];
  kpiStatus: any = [];
  coachingRemDays: any = [];
  @Input()
  currentAction = 'create';
  isAllSelected = false;
  addMCSwitch = true;
  scoreUnSubmitedCount=0;
  unSubmitedCount=0;
  today = new Date();

  filteredOptionsKPI: Observable<any[]>;
  public empKPIData: any[] = []
  // public selectedKPIItems :any[]=[]
@Input()
accessingFrom:any;



  filteredOptionsTS: Observable<any[]>;
  public empMeasuCriData: any[] = []
  public selectedItems: any[] = []
  weight:any;
  currentKpiId: any;
  selIndex: any;
  isKpiActivated: boolean;
  msSelText="";
  msSelVal="";
  currEvaluation: any;
  showKpiForm=true;
  isEmpFRSignOff=false;
  isFirstTimeCreateing=false;

  @ViewChild('sgsgggjsr', {static: false}) content: ElementRef;
  currentOrganization: any;



  constructor(private fb: FormBuilder,
    private authService: AuthService,
    public router: Router,
    private activatedRoute: ActivatedRoute,
    public dialog: MatDialog,
    public themeService: ThemeService,
    private snack: NotificationService,
    private perfApp: PerfAppService,
    public translate: TranslateService) {
    this.loginUser = this.authService.getCurrentUser();
    this.currentOrganization = this.authService.getOrganization();

    this.initApicallsForKpi();

    this.activatedRoute.params.subscribe(params => {
     
     if (params['action']) {
      this.currentKpiId = params['id'];
      this.currentAction = params['action'];
     }
     
    });   

  }


  async initApicallsForKpi() {

    
    await this.getAllKpiBasicData();
    await this.GetAllAccomplishmentsDetails();
    

  }

  ngOnInit(): void {



    this.initKPIForm()

    this.alert = new AlertDialog();
  }





  initKPIForm() {
    this.kpiForm = this.fb.group({

    

      Accomplishment: [this.kpiDetails.Accomplishment ? this.kpiDetails.Accomplishment : '', Validators.compose([
        Validators.required, Validators.minLength(2),
        CustomValidators.patternValidator(/(?=.*[#)&.(-:/?])/, { hasKPISplChars: true }, 'hasKPISplChars'),
      ])
      ],
      CompletionDate: [this.kpiDetails.CompletionDate ? new Date(this.kpiDetails.CompletionDate) : '', [Validators.required]],
      Comments: [this.kpiDetails.Comments ? this.kpiDetails.Comments :''],
      IsDraft: [this.kpiDetails.IsDraft ? 'true' : 'false'],
      ShowToManager: [this.kpiDetails.ShowToManager ],

    });

    

  

  }





  get f() {
    return this.kpiForm.controls;
  }


  onCancle() {
    this.router.navigate(['employee/accomplishments-list']);
  }

  submitKpi() {
    
    if (!this.kpiForm.valid) {
      this.kpiForm.markAllAsTouched();
      return;
    }
    else {
    }

    if(this.kpiForm.get('IsDraft').value=='true'){
      this.isFirstTimeCreateing=true;
    }

    this.kpiForm.patchValue({ IsDraft: 'false' });

  
    this.saveKpi();
  }


  draftKpi(){
    this.kpiForm.patchValue({ IsDraft: 'true' });
    this.saveKpi();
  }


  saveKpi() {

if (!this.kpiForm.get('Accomplishment').value) {
  this.snack.error('Accomplishment is required');
  return
}




    this.perfApp.route = "app";
    this.perfApp.method = this.currentAction == 'create' ? "AddAccomplishment" : "UpdateAccomplishmentDataById",


      this.perfApp.requestBody = this.kpiForm.value; //fill body object with form 

     

    this.perfApp.requestBody.Accomplishment = this.perfApp.requestBody.Accomplishment.Accomplishment?
                                    this.perfApp.requestBody.Accomplishment.Accomplishment :this.perfApp.requestBody.Accomplishment;
    // this.perfApp.requestBody.MeasurementCriteria = this.selectedItems.map(e => { e.measureId=e._id});
    this.perfApp.requestBody.AccompId = this.kpiDetails._id?  this.kpiDetails._id : '';
    this.perfApp.requestBody.UpdatedBy = this.loginUser._id;

    if (this.currentAction=='create'){
    this.perfApp.requestBody.CreatedBy = this.loginUser._id;
    this.perfApp.requestBody.Owner = this.loginUser._id;
    this.perfApp.requestBody.ManagerId = this.loginUser.Manager._id;
    
    }else if (this.currentAction=='edit'){
      this.perfApp.requestBody.isFirstTimeCreateing = this.isFirstTimeCreateing;
      this.perfApp.requestBody.Action = 'Update';
    }

   

    if (this.kpiForm.get('IsDraft').value=='true' && this.currentAction=='create') {
      this.perfApp.requestBody.Action = 'Draft';
    }

    if (this.currentAction=='create' && this.kpiForm.get('IsDraft').value=='false') {
      this.openConfirmSubmitKpisDialog();
    }else{
    this.callKpiApi();
    }
  }

  callKpiApi() {

    this.perfApp.CallAPI().subscribe(c => {

      if (c.message == Constants.SuccessText) {

        this.snack.success(this.translate.instant(` The accomplishment has been  ${ this.getActionString(this.currentAction,this.perfApp.requestBody.Action)}  successfully.`));
       this.selectedItems=[];
       // this.GetAllAccomplishmentsDetails();
        if (this.accessingFrom=='currEvaluation') {
          
          this.router.navigate(['employee/current-evaluation']);
        } else {         
        this.router.navigate(['employee/accomplishments-list']);
        }
      }

    }, error => {
      this.snack.error(this.translate.instant(`Accomplishment not  ${ this.getActionString(this.currentAction,this.perfApp.requestBody.Action)}, please try again.`));


    });

  }




  getActionString(currentAction,subAction) {
    if (currentAction=='create' && subAction=='Draft') {
      return 'saved'
    } else  if (currentAction=='create') {
      return 'added '
    }else  if (currentAction=='edit') { //to do eding draft
      return 'updated'
    }
    
   
  }


  getAllKpiBasicData() {
    this.perfApp.route = "app";
    this.perfApp.method = "GetKpiSetupBasicData";
    this.perfApp.requestBody = { 'empId': this.loginUser._id ,
    'orgId':this.authService.getOrganization()._id
  }
      this.perfApp.CallAPI().subscribe(c => {

        if (c) {

          this.appScores = c.KpiScore;
          this.kpiStatus = c.KpiStatus;
          this.coachingRemDays = c.coachingRem;
          this.currEvaluation = c.evaluation;
          
          if(c.evaluation)
          this.isEmpFRSignOff=c.evaluation.Employees[0].FinalRating.Self.SignOff.length>0;
        }
      })
  }



  private _normalizeValue(value: string): string {
    return value.toLowerCase().replace(/\s/g, '');
  }


  displayFn(user: any): string {
    return user && user.Name ? user.Name : '';
  }



  private _filterTD(name: string): any[] {
    const filterValue = this._normalizeValue(name);

    return this.empMeasuCriData.filter(option => this._normalizeValue(option.Name).includes(filterValue));
  }








 








  

  GetAllAccomplishmentsDetails() {
    this.perfApp.route = "app";
    this.perfApp.method = "GetAllAccomplishments",
      this.perfApp.requestBody = { 'empId': this.loginUser._id,'orgId':this.authService.getOrganization()._id}
    this.perfApp.CallAPI().subscribe(c => {

     
      if (c && c.length > 0) {
       
        this.empKPIData = c;
      



      


          if (this.currentAction !='create') {
            this.currentKpiId=this.currentKpiId ? this.currentKpiId:this.empKPIData[0]._id;
            this.kpiDetails=  this.empKPIData.filter(e=> e._id== this.currentKpiId)[0];
            this.selIndex=  this.empKPIData.findIndex(e=> e._id== this.currentKpiId);


          this.initKPIForm();

          }

          

      }else{
        
        if (this.accessingFrom=='currEvaluation') {
          this.showKpiForm=false;
        }
      }

    }
    
    , error => {
      if (error.error.message === Constants.KpiNotActivated) {
        this.isKpiActivated=false;
       
      } else {

      this.snack.error(error.error.message);

       }
    }
    
    )
  }










  




  
   /**To alert user for submit kpis */
   openConfirmSubmitKpisDialog() {
    this.alert.Title = "Alert";
    this.alert.Content = "Are you sure you want to add the accomplishment?";
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
      this.callKpiApi();
     } else {
       
     }
    })
  }




  nextKpi(){

    
   this.selIndex=this.selIndex+1;
    this.kpiDetails=  this.empKPIData[this.selIndex];
    this.initKPIForm();
    this.currentKpiId=this.kpiDetails._id;
  }

  priKpi(){

    this.selIndex=this.selIndex-1;
    this.kpiDetails=  this.empKPIData[this.selIndex];
    this.initKPIForm();
    this.currentKpiId=this.kpiDetails._id;
  }



  public downloadPDF1() {
    const doc = new jsPDF();

    const specialElementHandlers = {
      '#editor': function (element, renderer) {
        return true;
      }
    };

    const content = this.content.nativeElement;
  
    // doc.fromHTML(content.innerHTML, 15, 15, { 
    //   width: 190,
    //   'elementHandlers': specialElementHandlers 
    // });

    doc.save('test.pdf');
  }


  downloadPDF() { 
    // get the `<a>` element from click event
    //var anchor = event.target;
    // get the canvas, I'm getting it by tag name, you can do by id
    // and set the href of the anchor to the canvas dataUrl
   // anchor.href = document.getElementsByTagName('canvas')[0].toDataURL();
    // set the anchors 'download' attibute (name of the file to be downloaded)
    //anchor.download = "test.png";
    debugger
    
    var pdf = new jsPDF('p', 'mm', 'a4');
    var image=document.getElementById('sgsgggjsr')[0].toDataURL();
    pdf.addImage(image, 'JPEG', 0, 0,0,0);
    pdf.save("evaluations.pdf"); 
    
}
 

  downloadPDF3() {
    
   
    const div = document.getElementById('printToPDF');
    
    const button = document.getElementById('btnPrintPRForm');
    const btnPRFormClose = document.getElementById('btnPRFormClose');
    // button.style.display = 'none';
    // btnPRFormClose.style.display = 'none';
    debugger
    var HTML_Width = div.clientWidth;
    var HTML_Height = div.clientHeight;
    var top_left_margin = 1;
    var PDF_Width = HTML_Width + (top_left_margin * 2);
    var PDF_Height = (PDF_Width * 1.5) + (top_left_margin * 2);
    var canvas_image_width = HTML_Width;
    var canvas_image_height = HTML_Height;

    var totalPDFPages = Math.ceil(HTML_Height / PDF_Height) - 1;

    
    html2canvas(div, { allowTaint: false,useCORS : true, }).then(function (canvas) {
      canvas.getContext('2d');
      
      console.log(canvas.height + "  " + canvas.width);


      var imgData = canvas.toDataURL("image/PNG", 1.0);
      var pdf = new jsPDF('landscape', 'in', [PDF_Width, PDF_Height]);

    //  var pdf = new jsPDF();
      //  const pdf = new jsPDF({
      //   orientation: "landscape",
      //   unit: "in",
      //   format: [4, 2]
      // });
      
      
      pdf.addImage(imgData, 'PNG', top_left_margin, top_left_margin, canvas_image_width, canvas_image_height);


      // for (var i = 1; i <= totalPDFPages; i++) {
      //   pdf.addPage( [PDF_Width, PDF_Height]);
      //   pdf.addImage(imgData, 'PNG', top_left_margin, -(PDF_Height * i) + (top_left_margin * 4), canvas_image_width, canvas_image_height);
      // }

      pdf.save("PurchageRequest.pdf");
    });
    // button.style.display = 'block';
    // btnPRFormClose.style.display = 'block';

 
  }

  
  public monthList = ["","January", "February", "March", "April", "May", "June", "July",
  "August", "September", "October", "November", "December"];
  
  getEVPeriod(){
    return ReportTemplates.getEvaluationPeriod(this.currentOrganization.StartMonth, this.currentOrganization.EndMonth);
      }


      
  printPage() {
    window.print();
  }


}
