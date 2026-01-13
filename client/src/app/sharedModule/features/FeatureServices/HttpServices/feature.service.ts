import { Injectable, NgModule } from '@angular/core';
impport  {FeatureEndPointService} from './feature-end-point.service';
@Injectable()
export class FeatureService {
  private featureEndPointService:FeatureEndPointService;
  constructor() {
    this.featureEndPointService = new FeatureEndPointService();
  }
}
