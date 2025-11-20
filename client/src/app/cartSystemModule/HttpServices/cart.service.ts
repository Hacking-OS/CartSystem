import { inject, Injectable, NgModule } from '@angular/core';
import { CartEndPointService } from './cart-end-point.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { SharedService } from '../../sharedModule/sharedServices/shared.service';
@Injectable()
export class Cart_Service {
 private CartEndPointService:CartEndPointService;
  constructor() { 
    this.CartEndPointService = new CartEndPointService(inject(HttpClient),inject(Router),inject(SharedService));
  }
}
