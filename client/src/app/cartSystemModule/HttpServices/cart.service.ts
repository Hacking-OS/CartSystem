import { inject, Injectable, NgModule } from '@angular/core';
import { CartEndPointService } from './cart-end-point.service';
@Injectable()
export class Cart_Service {
 private CartEndPointService:CartEndPointService = inject(CartEndPointService);
  constructor() { }
}
