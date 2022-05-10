import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ApplicationState {
  public isInNetworkProgress = false;
  public activeTabCaption = 'PWP';
  public showLoadingOverlay = false;
}
