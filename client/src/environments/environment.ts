// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false, ApiPath : 'http://localhost:3000/api/',
  ACTION_PLANNING_GUIDANCE_URL:"https://opassess-docs.s3.ca-central-1.amazonaws.com/Reference+Documents/Action%2BPlanning%2BGuidance.doc",
  KPI_GUIDANCE_URL:"https://opassess-docs.s3.ca-central-1.amazonaws.com/Reference+Documents/Goals%2Band%2BKPI's.docx",
  MONERIS_JSLIB_SRC:"https://gatewayt.moneris.com/chkt/js/chkt_v1.00.js",
  MONERIES_ENVIRONMENT:"qa",
  START_YEAR:2020
};
