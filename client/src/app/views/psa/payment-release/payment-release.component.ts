import { Component, OnInit } from '@angular/core';
import { Router ,ActivatedRoute} from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { PerfAppService } from '../../../services/perf-app.service';

@Component({
  selector: 'app-payment-release',
  templateUrl: './payment-release.component.html',
  styleUrls: ['./payment-release.component.css']
})
export class PaymentReleaseComponent implements OnInit {
  currentUser:any;
  currentOrganization:any;
  organizationList:any=[];
  organization:any;
  userType:any;
  selectedOrganizationObj:any;


  constructor(public router: Router,public authService: AuthService,private perfApp: PerfAppService,) {
    this.currentUser = this.authService.getCurrentUser();
    this.currentOrganization = this.authService.getOrganization();
   }

  ngOnInit(): void {
    this.getClients();
    this.currentUser=this.authService.getCurrentUser();
  }
  getClients() {
    this.perfApp.route = "app";
    this.perfApp.method = "GetAllOrganizations",
    this.perfApp.requestBody = { 'companyId': this.currentOrganization._id }
    this.perfApp.CallAPI().subscribe(c => {
      this.organizationList = c;
    })
  }
  orgnizationDetails(selectedOrgnization){
    console.log(selectedOrgnization);
    this.selectedOrganizationObj = this.organizationList.find(org=>org._id==selectedOrgnization);
    //console.log(selectedOrgObj);
    //this.userType=selectedOrgObj.ClientType
    //ClientType//UsageCount
  }
}
