import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { BnNgIdleService } from 'bn-ng-idle'; 
import { AuthService } from './services/auth.service';

@Component({
  // tslint:disable-next-line
  selector: 'body',
  template: '<router-outlet></router-outlet>'
})
export class AppComponent implements OnInit {
  constructor(public authService: AuthService,private router: Router,private bnIdle: BnNgIdleService) {
    this.bnIdle.startWatching(1800).subscribe((res) => {
      if(res) {
          this.authService.LogOut()
          this.router.navigate(['login'])
      }
    })
   }

  ngOnInit() {
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0);
    });
  }
}
