import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class SnGuardService implements CanActivate {
  loginUser: any;

  constructor(public auth: AuthService, 
    private snack: NotificationService,
    public router: Router) {}
  canActivate(): boolean {

    this.loginUser=this.auth.getCurrentUser();
    debugger
   if(!this.loginUser.Manager){

    this.snack.error('Please update manager for this user.');
    return false;
   }
    // if (!this.auth.Islogin()) {
    //   this.router.navigate(['login']);
    //   return false;
    // }
     return true;
  }
}
