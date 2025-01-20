import { Component, Input, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { AppComponent } from '../../../app.component';
import { SharedCoreService } from '../../sharedServices/shared-core.service';
import { CspNonceService } from '../../sharedServices/security/cspnounce.service';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  @Input() isUser: boolean = false;
  title = 'CartSystem';
  user = 0;
  isUserAdmin = 0;
  userRole= localStorage.getItem('role');
  message:any|undefined;
 responseCountBill:any=[];
 responseCountCart:any=[];
  responseCountCheckout:any=[];
  protected cspPolicy: string = "default-src 'self'; font-src 'self' https://fonts.gstatic.com";

  protected cspNonce: string | undefined;
  constructor(private router: Router,private cspNonceService:CspNonceService,private countUser:SharedCoreService) {
    if (
      localStorage.getItem('token') === undefined ||
      localStorage.getItem('token') === null ||
      localStorage.getItem('token') === ''
    ) {

    } else {
      this.user = 1;
      this.isUser=true;
     this.countUser.getUserCount();
     this.responseCountBill=this.countUser.responseCountBill;
     this.responseCountCart=this.countUser.responseCountCart;
     this.responseCountCheckout=this.countUser.responseCountCheckout;

    }
  }

ngOnInit(): void {
  //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
  //Add 'implements OnInit' to the class.
  this.user = 1;
this.isUser=true;
 this.countUser.getUserCount();
 this.responseCountBill=this.countUser.responseCountBill;
 this.responseCountCart=this.countUser.responseCountCart;
 this.responseCountCheckout=this.countUser.responseCountCheckout;
}

  redirectUser(redirectTo: string) {
    this.router.navigateByUrl('/' + redirectTo);
  }

 logoutUser(){
  this.countUser.logoutUser();
 }

}
