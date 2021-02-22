import { Component, ComponentFactoryResolver, DoCheck, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { navItems } from '../../_nav';
import { AuthService } from '../../services/auth.service';

import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PerfAppService } from '../../services/perf-app.service';
import { DateAgoPipe } from '../../pipes/DateAgoPipe';
import { RemoveHtml } from '../../pipes/RemoveHtml';
import { TimeAgoPipe } from '../../pipes/TimeAgoPipe';
@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html'
})
export class DefaultLayoutComponent implements OnInit {
  public sidebarMinimized = false;
  public navItems = navItems;
  public user: any;
currentUser:any;
isCSA:Boolean = false;
public oneAtATime: boolean = true;
  notificationList=[];
  Intervel: NodeJS.Timeout;
  unReadCount: any=0;
  constructor(public authService: AuthService,
    private router: Router,
    private perfApp: PerfAppService,
    public translate: TranslateService) {
    this.navItems = JSON.parse(localStorage.getItem('NavigationMenu'));

    this.user = JSON.parse(localStorage.getItem('User'));
    translate.addLangs(['en', 'fr']);
    translate.setDefaultLang('en');
  }

  get userObj() {
    this.user = JSON.parse(localStorage.getItem('User'));
    return this.user;
  }
  // ngOnChanges(changes: SimpleChanges): void {
  //   this.getAllEmpNotifications();
  // }
  // ngDoCheck(): void {
  //   this.getAllEmpNotifications();
  // }
  toggleMinimize(e) {
    this.sidebarMinimized = e;
  }
  public logout() {
    
    this.authService.LogOut()
    this.router.navigate(['login'])
  }
  public gotoProfile() {
    //const _role = this.authService.getCurrentUser().Role || ""
    //this.router.navigate([_role.toLowerCase() + '/profile'])
    this.router.navigate(['ea/profile'])
  }

  gotoOrgProfile() {
    if (this.user.Role === 'RSA') {
      this.router.navigate(['rsa/profile']);
    }else {
      this.router.navigate(['csa/profile']);
    }
  }

  gotoMessages(){
    
  }

  

  getAllEmpNotifications() {
    this.perfApp.route = "notifications";
    this.perfApp.method = "";
    this.perfApp.requestBody = { 'email': this.user.Email //"empone@in.com"
  }
      this.perfApp.CallAPI().subscribe(c => {

        if (c) {

          this.notificationList=c;
          this.unReadCount=c.filter(e=> e.IsRead==false).length;

          
        }
      })
  }

  getTime(joiningDate) {
    return new TimeAgoPipe().transform(joiningDate);
  }
  removeHtmlTags(joiningDate) {
    let s= new RemoveHtml().transform(joiningDate).replace(/\s+/g, " ");
   s=  s.replace('Please click here to login and review.',"")
   s=  s.replace('To view details click here to login',"")
   s=  s.replace('To view details, click here',"")
   s=  s.replace('To login click here',"")
   s=  s.replace('click here to login.',"")
   s=  s.replace('Please click here to login',"")
   
   s=  s.replace('please click here to login',"")
   s=  s.replace('to login',"")
   //Please click here
   s=  s.replace('To view details click here',"")
   s=  s.replace(`Dear ${this.user.FirstName},`,"")
   s=  s.replace(`Dear ${this.user.FirstName}`,"")
   //s=  s.replace('Thank you   OPAssess Admin',"")
   s=  s.replace('Thank you, OPAssess Administrator',"")
   s=  s.replace('Thank you OPAssess Administrator',"")
   s=  s.replace('Thank you,OPAssess Administrator',"")
   //Thank you, OPAssess Administrator
   s=  s.replace('Confidentiality Statement: “This communication contains confidential information intended only for the persons to whom it is addressed. Any other distribution, copying or disclosure is strictly prohibited. If you have received this message in error, please notify us immediately and delete this message from your mailbox and trash without reading or copying it.”',"")
     return s;
  }
  removeLogin(s){
    return s.replace('To login, <a href="http://15.223.26.103/#/login">click here</a>.',"")
  }

  switchLang(lang: string) {
    this.translate.use(lang);
  }
  ngOnInit() {
    if (this.user) {


      this.getAllEmpNotifications(); 
      this.Intervel = setInterval(() => {
        this.getAllEmpNotifications(); 
      }, 180000);


      if (this.user.SelectedRoles) {
        var navigationMenu = [];
        if(this.user.Role.indexOf('EO')>-1  || this.user.SelectedRoles.indexOf("EO") !== -1){
          let dashboard = {
            "IsActive": true,
            "url": "/dashboard",
            "name": "Dashboard",
            "code": "Dashboard",
            "icon": "icon-calculator",
            // "badge": {
            //   "variant": "info",
            //   "text": "Home"
            // },
            "linkProps": {
              "routerLinkActive": "dashboard"
            }
          };
          if(this.user.SelectedRoles.indexOf("EA") !== -1){
            dashboard.url = "/ea/dashboard";
          }
          
        navigationMenu.push(
          dashboard,
       {
          "IsActive": true,
          "url": "/employee/kpi-setup",
          "name": "Performance Goals",
          "code": "KPISetting",
          "icon": "icon-wrench"
        }, 
        // {
          
        //   "IsActive": true,
        //   "url": "/employee/review-kpi-list",
        //   "name": "Performance Goal Review",
        //   "code": "KPISetting",
        //   "icon": "icon-wrench"
          
        // },
       
        {
          "IsActive": true,
          "url": "/employee/action-plan",
          "name": "Action Plan",
          "code": "ActionPlan",
          "icon": "icon-layers"
        },
        {
          "IsActive": true,
          "url": "/employee/current-evaluation",
          "name": "Current Evaluation",
          "code": "CurrentEvaluation",
          "icon": "icon-puzzle"
        },
        {
          "IsActive": true,
           "url": "/employee/accomplishments-list",
          "name": "Accomplishments",
          "code": "Accomplishments",
          "icon": "cui-tags"
         },      
        {
          "IsActive": true,
          "url": "/employee/peerreview",
          "name": "Peer Review",
          "code": "CurrentEvaluation",
          "icon": "icon-speedometer"
        },
        {
          "IsActive": true,
          "url": "/employee/drreview",
          "name": "Review your Manager",
          "code": "CurrentEvaluation",
          "icon": "icon-layers"
        },
        {
          "IsActive": true,
          "url": "/employee/copiesTo",
          "name": "Peer Evaluations",
          "code": "CopiesTo",
          "icon": "icon-layers"
        },
        {
          "IsActive": true,
           "url": "/employee/private-notes-list",
          "name": "Notes",
          "code": "Notes",
          "icon": "icon-note"
        },
        // {
        //   "IsActive": true,
        //   "url": "/employee/reports",
        //   "name": "Reports",
        //   "code": "Reports",
        //   "icon": "icon-list"
        // }
        )
        this.navItems=navigationMenu;


        if (this.user.SelectedRoles.indexOf('EA') > -1 || this.user.Role==='CSA') {
          navigationMenu.push(
            {
              "IsActive": true,
              "url": "/ea/setup-employee",
              "name": "Set up Employees",
              "code": "Employees",
              "icon": "icon-user-follow",
              "linkProps": {
                  "routerLinkActive": "employee"
              }
          }, {
              "IsActive": true,
              "url": "/ea/evaluation-list",
              "name": "Evaluations",
              "code": "Evaluations",
              "icon": "icon-star"
          }
         

          )
          this.navItems = navigationMenu;
        }

     

          if (this.user.SelectedRoles.indexOf('EM') > -1 || this.user.SelectedRoles.indexOf('TS') > -1) {
            navigationMenu.push(
             

   {
          
    "IsActive": true,
    "url": "/employee/review-perf-goals-list",
    "name": "Performance Goal Review",
    "code": "KPISetting",
    "icon": "icon-wrench"
    
  },
  {

    "IsActive": true,
    "url": "/employee/review-action-plan-list",
    "name": "Action Plan Review",
    "code": "KPISetting",
    "icon": "icon-layers"
    
  },

  {
    "IsActive": true,
    "url": "/employee/review-accomplishments-list",
    "name": "Review Accomplishments",
    "code": "Review Accomplishments",
    "icon": "cui-tags"
  },
              {
                "IsActive": true,
                "url": "/employee/review-evaluation-list",
                "name": "Review Evaluations",
                "code": "Review Evaluations",
                "icon": "icon-star"
              }


            )
            this.navItems = navigationMenu;
          }

      if (this.user.SelectedRoles.indexOf('EA') > -1) {
          navigationMenu.push(
        {
          "IsActive": true,
          "url": "/employee/reports",
          "name": "Reports",
          "code": "Reports",
          "icon": "icon-list",
//           "children":[ {
//             "IsActive": true,
//             "url": "/ea/reports",
//             "name": "Evaluations",
//             "code": "EvaluationsReports",
           
            
//           }]
        })
      }else{
        navigationMenu.push(
          {
                "IsActive": true,
                "url": "/employee/reports",
                "name": "Reports",
                "code": "Reports",
                "icon": "icon-list",
//                 "children": [{
//                   "IsActive": true,
//                   "url": "/employee/reports/current-evaluation",
//                   "name": "Evaluation Report",
//                   "code": "Current Evaluation",
//                   "icon": "icon-list"
//                 }]
          })
      }

          this.navItems = navigationMenu;

        

       // return  this.navItems;
        }
        
        if(this.user.Role==='RSA'){
          let piInfo = JSON.parse(localStorage.getItem('pi'));
          localStorage.setItem("currentUser", "RSA");
          if(piInfo.initialPaymentRequired || piInfo.renewalRequired){
            navigationMenu.push(
              {
                "IsActive": true,
                "url": "/rsa/payments",
                "name": "Make Payment",
                "code": "MakePayment",
                "icon": "icon-star"
            }
            );
            this.navItems = navigationMenu;
          }
        }

      console.log("current menu items", navigationMenu);
      if(this.user.Role=="CSA"){
        let piInfo = JSON.parse(localStorage.getItem('pi'));
        localStorage.setItem("currentUser", "CSA");
        //{initialPaymentRequired: true, renewalRequired: false}
        let dashboard = {
          "IsActive": true,
          "url": "/dashboard",
          "name": "Dashboard",
          "code": "Dashboard",
          "icon": "icon-calculator",
          // "badge": {
          //   "variant": "info",
          //   "text": "Home"
          // },
       
        };
        this.navItems=[];
        navigationMenu=[];
        if(piInfo.initialPaymentRequired || piInfo.renewalRequired){
          navigationMenu.push(
            {
              "IsActive": true,
              "url": "/csa/payments",
              "name": "Make Payment",
              "code": "Make Payment",
              "icon": "icon-star"
          }
          )
        }else{
           navigationMenu.push(
            dashboard,
            {
              "IsActive": true,
              "url": "/employee/kpi-setup",
              "name": "Performance Goals",
              "code": "KPISetting",
              "icon": "icon-wrench"
            },
            {
              "IsActive": true,
              "url": "/employee/action-plan",
              "name": "Action Plan",
              "code": "ActionPlan",
              "icon": "icon-layers"
            },
            {
              "IsActive": true,
              "url": "/employee/current-evaluation",
              "name": "Current Evaluation",
              "code": "CurrentEvaluation",
              "icon": "icon-puzzle"
            },
            {
              "IsActive": true,
               "url": "/employee/accomplishments-list",
              "name": "Accomplishments",
              "code": "Accomplishments",
              "icon": "cui-tags"
             },
             {
              "IsActive": true,
              "url": "/employee/peerreview",
              "name": "Peer Review",
              "code": "CurrentEvaluation",
              "icon": "icon-speedometer"
            },
            {
              "IsActive": true,
              "url": "/employee/drreview",
              "name": "Review your Manager",
              "code": "CurrentEvaluation",
              "icon": "icon-layers"
            },
            {
              "IsActive": true,
              "url": "/employee/copiesTo",
              "name": "Peer Evaluations",
              "code": "CopiesTo",
              "icon": "icon-layers"
            },
            {
              "IsActive": true,
               "url": "/employee/private-notes-list",
              "name": "Notes",
              "code": "Notes",
              "icon": "icon-note"
            },
            {
            "IsActive": true,
            "url": "/ea/setup-employee",
            "name": "Set up Employees",
            "code": "Employees",
            "icon": "icon-user-follow",
            "linkProps": {
                "routerLinkActive": "employee"
            }
          },
          {
            "IsActive": true,
            "url": "/ea/evaluation-list",
            "name": "Evaluations",
            "code": "Evaluations",
            "icon": "icon-star"
        },
             {
               "IsActive": true,
               "url": "/csa/payments",
               "name": "Payments",
               "code": "Payments",
               "icon": "icon-star",
               "children": [{
                 "IsActive": true,
                 "url": "/csa/payments",
                 "name": "Make Payment",
                 "code": "Make Payment",
                 "icon": "icon-settings"
               },
               {
                 "IsActive": true,
                 "url": "/csa/adhoc-payment",
                 "name": "Adhoc Payment",
                 "code": "adhocPayment",
                 "icon": "icon-settings"
               }]
             },
      {
        "IsActive": true,
        "url": "/ea/settings",
        "name": "Backend Setup",
        "code": "BackendSetup",
        "icon": "icon-settings"
    },
    {
          
      "IsActive": true,
      "url": "/employee/review-perf-goals-list",
      "name": "Performance Goal Review",
      "code": "KPISetting",
      "icon": "icon-wrench"
      
    },
    {
  
      "IsActive": true,
      "url": "/employee/review-action-plan-list",
      "name": "Action Plan Review",
      "code": "KPISetting",
      "icon": "icon-layers"
      
    },
    {
      "IsActive": true,
      "url": "/employee/review-accomplishments-list",
      "name": "Review Accomplishments",
      "code": "Review Accomplishments",
      "icon": "cui-tags"
    },
    {
      "IsActive": true,
      "url": "/employee/review-evaluation-list",
      "name": "Review Evaluations",
      "code": "Review Evaluations",
      "icon": "icon-star"
    },
    {
      "IsActive": true,
      "url": "/ea/reports",
      "name": "Reports",
      "code": "CSA Reports",
      "icon": "icon-list",
    "children":[ {
        "IsActive": true,
        "url": "/csa/reports/evaluationsSummary",
        "name": "Evaluations Summary",
        "code": "evaluationsSummary",
      },
      {
        "IsActive": true,
        "url": "/csa/reports/paymentSummary",
        "name": "Payment Summary",
        "code": "paymentSummary",
      },]
    })
  }

          this.navItems = navigationMenu;

      }
        

      // FOR SELECTED USER CSA

      if(this.user.SelectedRoles.indexOf('CSA') > -1){
        localStorage.setItem("currentUser", "CSA")
        let dashboard = {
          "IsActive": true,
          "url": "/dashboard",
          "name": "Dashboard",
          "code": "Dashboard",
          "icon": "icon-calculator",
          // "badge": {
          //   "variant": "info",
          //   "text": "Home"
          // },
       
        };
        this.navItems=[];
        navigationMenu=[]
          navigationMenu.push(
            dashboard,
            {
              "IsActive": true,
              "url": "/employee/kpi-setup",
              "name": "Performance Goals",
              "code": "KPISetting",
              "icon": "icon-wrench"
            },
            {
              "IsActive": true,
              "url": "/employee/action-plan",
              "name": "Action Plan",
              "code": "ActionPlan",
              "icon": "icon-layers"
            },
            {
              "IsActive": true,
              "url": "/employee/current-evaluation",
              "name": "Current Evaluation",
              "code": "CurrentEvaluation",
              "icon": "icon-puzzle"
            },
            {
              "IsActive": true,
               "url": "/employee/accomplishments-list",
              "name": "Accomplishments",
              "code": "Accomplishments",
              "icon": "cui-tags"
             },
             {
              "IsActive": true,
              "url": "/employee/peerreview",
              "name": "Peer Review",
              "code": "CurrentEvaluation",
              "icon": "icon-speedometer"
            },
            {
              "IsActive": true,
              "url": "/employee/drreview",
              "name": "Review your Manager",
              "code": "CurrentEvaluation",
              "icon": "icon-layers"
            },
            {
              "IsActive": true,
              "url": "/employee/copiesTo",
              "name": "Peer Evaluations",
              "code": "CopiesTo",
              "icon": "icon-layers"
            },
            {
              "IsActive": true,
               "url": "/employee/private-notes-list",
              "name": "Notes",
              "code": "Notes",
              "icon": "icon-note"
            },
            {
            "IsActive": true,
            "url": "/ea/setup-employee",
            "name": "Set up Employees",
            "code": "Employees",
            "icon": "icon-user-follow",
            "linkProps": {
                "routerLinkActive": "employee"
            }
          },
          {
            "IsActive": true,
            "url": "/ea/evaluation-list",
            "name": "Evaluations",
            "code": "Evaluations",
            "icon": "icon-star"
        },
    
 
    {
      "IsActive": true,
      "url": "/ea/reports",
      "name": "Reports",
      "code": "CSA Reports",
      "icon": "icon-list",
    "children":[ {
        "IsActive": true,
        "url": "/csa/reports/evaluationsSummary",
        "name": "Evaluations Summary",
        "code": "evaluationsSummary",
      },
      {
        "IsActive": true,
        "url": "/csa/reports/paymentSummary",
        "name": "Payment Summary",
        "code": "paymentSummary",
      },]
    }


          )

          this.navItems = navigationMenu;

      }

        return  this.navItems; 
      }
    }
  }

  
  markAsRead(data) {
    if(!data.IsRead){
    this.perfApp.route = "app";
    this.perfApp.method = "updateNotificationAsRead",
      this.perfApp.requestBody = { id: data._id ,
        'email': this.user.Email }
      this.perfApp.CallAPI().subscribe(c => {

    console.log('chrhrhr', c)
    this.unReadCount=c.filter(e=> e.IsRead==false).length;

      }, error => {
        console.log('error', error)
       
      // this.snack.error('something went wrong')
      })
    }
  }
  

  ngOnDestroy() {
    if (this.Intervel) {
      clearInterval(this.Intervel);
    }
  }
}
