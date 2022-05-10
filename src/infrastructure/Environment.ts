import { environment } from 'src/environments/environment';

export class Environment {
  private static env: String;
  // @ts-ignore
  static get rootUrl(): String {}
  static get rootEnvironment(): String {
    return this.env;
  }

  static get rootApiUrl(): String {
    return this.rootUrl + 'api/';
  }

  static environments = {
    //  hrm: 'hrm',
    // erp: 'erp',
  };
}
