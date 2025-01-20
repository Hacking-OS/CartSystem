import { Injectable, NgModule, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';

import { AppComponent } from '../../app.component';

import { AlertService, AlertType } from '../alertServices/alert.service';
import { CspNonceService } from './security/cspnounce.service';
import { CountService } from '../../adminModule/services/count.service';

@Injectable({
  providedIn: 'root',
})

export class SharedCoreService {
  user = 0;
  isUserAdmin = 0;
  userRole= localStorage.getItem('role');
  message:any|undefined;
  public responseCountBill:any=[];
  public responseCountCart:any=[];
  public responseCountCheckout:any=[];

  protected cspNonce: string | undefined;
  // ,private renderer:Renderer2
  constructor(private router: Router,private count:CountService,private cspNonceService:CspNonceService,private alert:AlertService) {}

  public getUserCount(){
    this.count.billCount(localStorage.getItem('token')).subscribe(count => {
      this.responseCountBill=count;
    });
    this.count.cartCount(localStorage.getItem('token')).subscribe(count => {
      this.responseCountCart=count;
    });
    this.count.checkOutCount(localStorage.getItem('token')).subscribe(count => {
      this.responseCountCheckout=count;
    });
    if (localStorage.getItem('role') === 'admin') {
      this.isUserAdmin = 1;
      // this.appLoader.isLoading=true;
      this.count.AdminTotalCountBill(localStorage.getItem('token')).subscribe(count => {
        this.responseCountBill=count;
        // this.appLoader.isLoading=false;
      });
    }
  }

  logoutUser(){
    // this.appLoader.isLoading=true;
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
    localStorage.removeItem('refreshToken');
    // this.message = "The user has been logged out!";
    // this.alert.showAlert("The user has been logged out!",AlertType.Success);
    setTimeout(()=>{
      this.alert.showAlert("The user has been logged out",AlertType.Success);
      this.router.navigateByUrl("user/login");
      // this.appLoader.isLoading=false;
    },3000);
  }

  scrollToNav() {
    // if (this.navbar && this.navbar.nativeElement) {
      // this.navbar.nativeElement.scrollIntoView({ behavior: 'smooth' });}
      // this.renderer.setProperty(window, 'scrollY', 0);

  }
}
