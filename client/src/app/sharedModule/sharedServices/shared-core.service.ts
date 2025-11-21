
import { Router } from '@angular/router';
import { AlertService, AlertType } from '../alertServices/alert.service';
import { CspNonceService } from './security/cspnounce.service';
import { CountService } from '../../adminModule/services/count.service';
import { forkJoin, Observable, tap } from 'rxjs';

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

  public getUserCount() :Observable<Record<string, any>> {
    // requires: import { forkJoin } from 'rxjs'; import { tap } from 'rxjs/operators';
    const token = localStorage.getItem('token') || '';
    const bill$ = (localStorage.getItem('role') === 'admin')
      ? this.count.AdminTotalCountBill<any>()
      : this.count.billCount<any>();
    const cart$ = this.count.cartCount<any>();
    const checkout$ = this.count.checkOutCount<any>();

    return forkJoin([bill$, cart$, checkout$]).pipe(
      tap(([bill, cart, checkout]) => {
        this.responseCountBill = bill;
        this.responseCountCart = cart;
        this.responseCountCheckout = checkout;
        if (localStorage.getItem('role') === 'admin') {
          this.isUserAdmin = 1;
        }
      })
    );
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
