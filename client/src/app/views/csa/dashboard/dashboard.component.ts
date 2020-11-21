import { Component, OnInit } from '@angular/core';
import { FlashMessagesService } from 'angular2-flash-messages';
import { AuthService } from '../../../services/auth.service';
import { CsaService } from '../../../services/csa.service';
import { ChartDataSets,ChartType, ChartOptions } from 'chart.js';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { Label } from 'ng2-charts';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  currentUser:any;
  currentStatus:any = {
    completed:'N/A',
    inprogress:'N/A'
  }

  /**
 * Bar chat
 */

public barChartOptions: ChartOptions = {
  responsive: true,
  // We use these empty structures as placeholders for dynamic theming.
  scales: { xAxes: [{}], yAxes: [{}] },
  plugins: {
    datalabels: {
      anchor: 'end',
      align: 'end',
    }
  }
};
public barChartLabels: Label[] = ['Active'];
public barChartType: ChartType = 'bar';
public barChartLegend = true;
public barChartPlugins = [pluginDataLabels];

public barChartData: ChartDataSets[] = [
  { data: [0], label: 'Total' }
  
];


  constructor(
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
      let evaluation_summary = c.evaluation_summary;
      this.barChartLabels = evaluation_summary.years;
      this.barChartData = evaluation_summary.dataSets;
    });
  }
}
