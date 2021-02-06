// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false, ApiPath : 'http://localhost:3000/api/',
  ACTION_PLANNING_GUIDANCE_URL:"https://opassess.s3.ca-central-1.amazonaws.com/Reference+Documents/Action+Planning+Guidance.doc",
  KPI_GUIDANCE_URL:"https://opassess.s3.ca-central-1.amazonaws.com/Reference+Documents/Goals+and+KPI's.docx",
};
