import { Injectable } from '@angular/core';
import ODataStore from 'devextreme/data/odata/store';
import { Environment } from '../infrastructure/Environment';
import DataSource from 'devextreme/data/data_source';

import { HttpErrorResponse } from '@angular/common/http';
@Injectable({
  providedIn: 'root',
})
export class BaseService {
  protected extractError(error: HttpErrorResponse) {
    var errorMessage = 'xata';
    if (error.error && error.error.message) errorMessage = error.error.message;
    else
      errorMessage = `Server error: ${error.status}\nMessage: ${error.message}`;

    return errorMessage;
  }
}
