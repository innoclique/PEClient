import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
@Component({
  templateUrl: 'dashboard.component.html'
})
export class MainDashboardComponent implements OnInit {
   selectedRoles:any=['TEST'];
  constructor(private authService: AuthService,private router: Router,) {
    this.selectedRoles = this.authService.getCurrentUser().SelectedRoles;
  }
  

  ngOnInit(): void {
    
  }
}
