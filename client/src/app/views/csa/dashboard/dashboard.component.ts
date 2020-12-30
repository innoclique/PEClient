import { Component, OnInit } from '@angular/core';
import { FlashMessagesService } from 'angular2-flash-messages';
import { AuthService } from '../../../services/auth.service';
import { CsaService } from '../../../services/csa.service';
import { ChartDataSets,ChartType, ChartOptions } from 'chart.js';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { Label } from 'ng2-charts';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  currentUser:any;
  currentStatus:any = {
    completed:'N/A',
    inprogress:'N/A',
    evaluations_left:'N/A'
  }

  constructor(
    private router: Router,
    private _flashMessagesService: FlashMessagesService,
    public authService: AuthService,
    private csaService: CsaService,
    ) { 
    this.currentUser = this.authService.getCurrentUser();
    
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }
  showAlert(msg){
    this._flashMessagesService.show(msg, { cssClass: 'alert-danger', timeout: 1500 });
  }

  loadDashboardData(){
    let reqBody:any = {};
    reqBody.userId = this.currentUser._id;
    this.csaService.psaDashboard(reqBody).subscribe(c => {
      this.currentStatus = c.current_status;
    });
  }
  chartClicked(event){
console.log(event)
  }

  navigateEvaluation(){
    this.router.navigate(['csa/reports/evaluationsSummary',{}],{ skipLocationChange: true });
  }
  loadPriceListPage(){
    this.router.navigate(['psa/price-list'],{ skipLocationChange: true });
  }
}
