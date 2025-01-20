import { Component, OnChanges, SimpleChanges } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { switchMap, timer } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';
import { AppComponent } from '../../../../app.component';
import { AlertService, AlertType } from '../../../../sharedModule/alertServices/alert.service';
import { SharedCoreService } from '../../../../sharedModule/sharedServices/shared-core.service';
import { CartService } from '../../../services/cart.service';





@Component({
selector: 'app-cart',
templateUrl: './cart.component.html',
styleUrls: ['./cart.component.css'],
})


export class CartComponent{

  message: any | undefined
  userCartData: any | undefined
  userCartData2: any | undefined
  mySubscription:any;
  constructor(private UserCart: CartService, Http: HttpClient,private router:Router,
    private getCount:SharedCoreService,
    private alertService:AlertService,
    ) {
    this.getUserCart();
  }

  removeFromCart(cartId: any) {
    this.UserCart.removeFromCart(
      localStorage.getItem('token'),
      cartId,
    ).subscribe(
      (data: any) => {
        // this.message = data.message;
        this.alertService.showAlert(data.message,AlertType.Warning);
        this.getUserCart();
        this.getCount.getUserCount();
      },
      (error: any) => {
        console.log(error)
      },
    )
    setTimeout(() => {
      this.message = '' || null
      // window.location.reload()
    }, 3000)
  }

  checkoutUser() {
    this.UserCart.checkOut(
      localStorage.getItem('token'),
      localStorage.getItem('userId'),
    ).subscribe(
      (data: any) => {
        this.message = data.message;
        this.getCount.getUserCount();
        this.getUserCart();

      },
      (error: any) => {
        console.log(error)
      },
    );

    setTimeout(() => {
      this.message = '' || null
      // window.location.reload()
    }, 3000);
  }

  getUserCart(){

    this.UserCart.getUserCart(localStorage.getItem('token')).subscribe(
      (data: any) => {
        this.userCartData = data
      },
      (error: any) => {
        console.log(error)
      },
    )
    this.UserCart.getUserCart2(localStorage.getItem('token')).subscribe(
      (data: any) => {
        this.userCartData2 = data
      },
      (error: any) => {
        console.log(error)
      },
    );

  setTimeout(() => {
    this.message = '' || null
  }, 3000);
  }

  getMessageClass() {
    // { 'alert alert-danger': this.message==='Cart Item Deleted successfully!','alert alert-success':this.message==='Added To checkout Option , to purchase, confirm the payment soon as possible!'}
    if (this.message === 'Cart Item Deleted successfully!') {
         this.alertService.showAlert(this.message,AlertType.Warning);
      return 'alert alert-danger';
    } else if (this.message === 'Added To checkout Option , to purchase, confirm the payment soon as possible!') {
      this.alertService.showAlert(this.message,AlertType.Success);
      return 'alert alert-success';
    } else {
      return '';
    }
  }

}


