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
  public user:any;
  constructor(public authService: AuthService,
    private router: Router,    
    public translate: TranslateService) {
      this.navItems=JSON.parse( localStorage.getItem('NavigationMenu'));
      this.user=JSON.parse( localStorage.getItem('User'));
      translate.addLangs(['en', 'fr']);
      translate.setDefaultLang('en'); 
     }
  toggleMinimize(e) {
    this.sidebarMinimized = e;
  }
  public logout(){       
    debugger 
    this.authService.LogOut()
     this.router.navigate(['login'])
  }
  
  switchLang(lang: string) {    
    this.translate.use(lang);
  }
}
