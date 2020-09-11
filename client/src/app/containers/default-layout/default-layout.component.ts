import {Component} from '@angular/core';
import { navItems } from '../../_nav';
import { AuthService } from '../../services/auth.service';

import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html'
})
export class DefaultLayoutComponent {
  public sidebarMinimized = false;
  public navItems = navItems;
  constructor(public authService: AuthService,
    private router: Router,
    
    public translate: TranslateService) {
      translate.addLangs(['en', 'fr']);
      translate.setDefaultLang('en'); 
     }
  toggleMinimize(e) {
    this.sidebarMinimized = e;
  }
  logout(){    
    debugger
    this.authService.LogOut()
     this.router.navigate(['login'])
  }
  callme(ff){
    debugger
  }
}
