import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css']
})
export class LogoutComponent implements OnInit {

  constructor(public authService: AuthService,
    private router: Router,) { }

  ngOnInit(): void {
    this.logOut();
  }
  logOut(){    
    this.authService.LogOut()
     this.router.navigate(['login'])
  }
}
