import { Component, ComponentFactoryResolver, OnInit } from '@angular/core';
import { navItems } from '../../_nav';
import { AuthService } from '../../services/auth.service';

import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
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
  constructor(public authService: AuthService,
    private router: Router,
    public translate: TranslateService) {
    this.navItems = JSON.parse(localStorage.getItem('NavigationMenu'));

    this.user = JSON.parse(localStorage.getItem('User'));
    translate.addLangs(['en', 'fr']);
    translate.setDefaultLang('en');
  }
  toggleMinimize(e) {
    this.sidebarMinimized = e;
  }
  public logout() {
    
    this.authService.LogOut()
    this.router.navigate(['login'])
  }
  public gotoProfile() {
    const _role = this.authService.getCurrentUser().Role || ""
    this.router.navigate([_role.toLowerCase() + '/profile'])
  }

  gotoMessages(){
    
  }

  switchLang(lang: string) {
    this.translate.use(lang);
  }
  ngOnInit() {
    if (this.user) {
    
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
          "name": "Review Manager",
          "code": "CurrentEvaluation",
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
        
   /*      if(this.user.Role==='CSA'){
          
          navigationMenu= [{
            "IsActive": true,
            "__v": 0,
            "url": "/csa/dashboard",
            "name": "CSA Dashboard",
            "code": "CSA Dashboard",
            "icon": "icon-calculator",
            // "badge": {
            //     "variant": "info",
            //     "text": "Home"
            // },
            "linkProps": {
                "routerLinkActive": "dashboard"
            }
        }, 
        // {
        //     "IsActive": true,
        //     "url": "/ea/setup-employee",
        //     "name": "Set up Employees",
        //     "code": "Employees",
        //     "icon": "icon-user-follow",
        //     "linkProps": {
        //         "routerLinkActive": "employee"
        //     }
        // }, {
        //     "IsActive": true,
        //     "url": "/ea/evaluation-list",
        //     "name": "Evaluations",
        //     "code": "Evaluations",
        //     "icon": "icon-star"
        // },
        
        {
            "IsActive": true,
            "url": "/ea/settings",
            "name": "Backend Setup",
            "code": "BackendSetup",
            "icon": "icon-settings"
        },
        {
          "IsActive": true,
          "url": "/csa/payments",
          "name": "Payments",
          "code": "Payments",
          "icon": "icon-star"
      },
         {
            "IsActive": true,
            "url": "/ea/reports",
            "name": "CSA Reports",
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
        }, 
         
      
        // {
        //     "IsActive": true,
        //     "url": "/logout",
        //     "name": "Logout",
        //     "code": "Logout",
        //     "icon": "icon-star"
        // }
      ]
        this.navItems=[...navigationMenu, ...this.navItems];
        } */

      console.log("current menu items", navigationMenu);
      if(this.user.Role=="CSA"){
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
              "name": "Review Manager",
              "code": "CurrentEvaluation",
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
          "icon": "icon-star"
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
    }


          )

          this.navItems = navigationMenu;

      }
        
        return  this.navItems; 
      }
    }
  }
}
