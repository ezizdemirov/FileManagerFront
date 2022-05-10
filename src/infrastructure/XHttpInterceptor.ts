import { Injectable } from '@angular/core';
import Swal from 'sweetalert2/dist/sweetalert2.js';

import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';

import { Observable, throwError } from 'rxjs';

import { retry, catchError, audit } from 'rxjs/operators';
import { finalize } from 'rxjs/operators';
import { ApplicationState } from './ApplicationState';
import { Environment } from './Environment';

@Injectable()
export class XHttpInterceptor implements HttpInterceptor {
  constructor(private state: ApplicationState) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    this.state.isInNetworkProgress = true;
    this.state.showLoadingOverlay = true;

    if (!request.url.includes('api/v1/signer')) {
      request = request.clone({
        url: this.prepareUrl(request.url),
      });
    }

    return next
      .handle(request)
      .pipe(
        finalize(() => {
          this.state.isInNetworkProgress = false;
          this.state.showLoadingOverlay = false;
        })
      )
      .pipe(
        retry(0),
        catchError((error: HttpErrorResponse) => {
          let errorMessage = error.error.message;
          console.log('eroror', error);
          if (errorMessage == undefined && error.status == 0) {
            Swal.fire({
              icon: 'error',
              title: 'Servis cavab vermir',
              confirmButtonText: 'Bağla',
              confirmButtonColor: '#2054BE',
            });
            return throwError(error.statusText);
          } else if (
            error instanceof HttpErrorResponse &&
            error.error instanceof Blob &&
            error.error.type === 'application/json'
          ) {
            this.extractErrorFromBlob(error).subscribe((x) => {
              Swal.fire({
                icon: 'error',
                title: errorMessage,
                confirmButtonText: 'Bağla',
                confirmButtonColor: '#2054BE',
              });
            });
            return throwError('Internal server error');
          } else {
            Swal.fire({
              icon: 'error',
              title: errorMessage,
              confirmButtonText: 'Bağla',
              confirmButtonColor: '#2054BE',
            });
            return throwError(errorMessage);
          }
        })
      );
  }

  private extractErrorFromBlob(err: HttpErrorResponse) {
    return new Observable((observer) => {
      let reader = new FileReader();
      reader.onload = (e: Event) => {
        try {
          const errmsg = JSON.parse((<any>e.target).result);
          observer.next(errmsg.message);
        } catch (e) {
          observer.next('BLOB xəta oxuna bilmədi');
        }
      };
      reader.onerror = (e) => {
        observer.next('BLOB xəta oxuna bilmədi');
      };
      reader.readAsText(err.error);
    });
  }

  private isAbsoluteUrl(url: string): boolean {
    const absolutePattern = /^https?:\/\//i;
    return absolutePattern.test(url);
  }

  private prepareUrl(url: string): string {
    url = this.isAbsoluteUrl(url) ? url : Environment.rootApiUrl + '/' + url;
    //  let url4=url.replace(/([^:]\/)\/+/g, '$1');
    //console.log('url4',url4);
    return url.replace(/([^:]\/)\/+/g, '$1');
  }
}
