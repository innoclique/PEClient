
import { Component, OnInit } from '@angular/core';
import { LoaderService } from '../../services/loader.service';

@Component({
  selector: 'lib-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css']
})

// This class is used to load spinner to create busy masking
export class LoaderComponent implements OnInit {
  public IsBusy: boolean;

  
  public constructor(private loaderService: LoaderService) {
    this.loaderService.isLoading.subscribe((res) => {
      this.IsBusy = res;
    });
  }

 
  public ngOnInit(): void {
  }

}
