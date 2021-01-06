import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
@Component({
  templateUrl: 'dashboard.component.html'
})
export class MainDashboardComponent implements OnInit {
  isCSA:Boolean = false;
  loginUser:any;
   selectedRoles:any=['TEST'];
  constructor(private authService: AuthService,private router: Router,) {
    this.selectedRoles = this.authService.getCurrentUser().SelectedRoles;
    console.log("---------------------->", this.selectedRoles);
    this.loginUser = this.authService.getCurrentUser();
    if(this.loginUser.Role==='CSA'){
      this.selectedRoles=['CSA',...this.selectedRoles];
    }
  }
  

  ngOnInit(): void {
    
  }
}
