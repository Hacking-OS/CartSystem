import { inject, Injectable, NgModule, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { SharedCoreService } from './shared-core.service';
import { CountService } from '../../adminModule/services/count.service';
import { AlertService } from '../alertServices/alert.service';
import { CspNonceService } from './security/cspnounce.service';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  public responseCountBill: any = [];
  public responseCountCart: any = [];
  public responseCountCheckout: any = [];

  private SharedCoreService: SharedCoreService;
  constructor(private router: Router, private count: CountService, private cspNonceService: CspNonceService, private alert: AlertService) {
      this.SharedCoreService = new SharedCoreService(this.router, this.count, this.cspNonceService, this.alert);
  }

  getUserCount() {
    return this.SharedCoreService.getUserCount().subscribe(() => {
      this.responseCountBill = this.SharedCoreService.responseCountBill;
      this.responseCountCart = this.SharedCoreService.responseCountCart;
      this.responseCountCheckout = this.SharedCoreService.responseCountCheckout;
    });
  }

  logoutUser() {
    return this.SharedCoreService.logoutUser();
  }
  
  scrollToNav() {
    return this.SharedCoreService.scrollToNav();
  }
}
