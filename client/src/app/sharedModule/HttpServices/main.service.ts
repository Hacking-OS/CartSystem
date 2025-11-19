import { inject, Injectable, NgModule } from '@angular/core';
import { MainEndPointService } from './main-end-point.service';
@Injectable()
export class MainService {
   private MainEndPointService: MainEndPointService  = inject(MainEndPointService);
  constructor() { }
}
