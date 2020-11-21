import { Component, OnInit,ViewChild } from '@angular/core';
import {PsaService} from '../../../services/psa.service';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Color, BaseChartDirective, Label } from 'ng2-charts';
import * as pluginAnnotations from 'chartjs-plugin-annotation';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  dashboardData:any;
  constructor(public psaService:PsaService) { 
    this.psaService.psaDashboard().subscribe(apiResponse => {
      this.dashboardData = apiResponse;
    });
  }

  ngOnInit(): void {
  }

  
}
