import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
//import {LicenseManager} from 'ag-grid-enterprise';

if (environment.production) {
  enableProdMode();
}
//LicenseManager.setLicenseKey("For_Trialing_ag-Grid_Only-Not_For_Real_Development_Or_Production_Projects-Valid_Until-30_January_2021_[v2]_MTYxMTk2NDgwMDAwMA==865d36f3a1b8d04d3b1a1405229f6e2b");
platformBrowserDynamic().bootstrapModule(AppModule, {
  useJit: true,
  preserveWhitespaces: true
})
  .catch(err => console.log(err));
