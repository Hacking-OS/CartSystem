import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { AppComponent } from '../../../../app.component';
import {
  AlertService,
  AlertType,
} from '../../../../sharedModule/alertServices/alert.service';
import { CheckoutService } from '../../../services/checkout.service';
import { SharedService } from '../../../../sharedModule/sharedServices/shared.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
})
export class CheckoutComponent {
  userCard = {
    cardNumber: '',
    ccv: '',
    expMonth: '',
    expYear: '',
  };

  message: any | undefined;
  userCartData: any | undefined;
  state: string | undefined;
  constructor(
    private fBuilder: FormBuilder,
    private checkout: CheckoutService,
    private alert: AlertService,
    Http: HttpClient,
    private getCount: SharedService,
    private appLoader: AppComponent
  ) {
    this.getCheckoutData();
  }
  submitPayment(PaymentValues: any) {
    console.log(PaymentValues.form.value);
    this.appLoader.isLoading = true;
    this.checkout
      .getBillCheckoutCompleted(
        localStorage.getItem('token'),
        PaymentValues.form.value,
        localStorage.getItem('userId'),
        this.state,
        this.userCartData,
        localStorage.getItem('role')
      )
      .subscribe(
        (data: any) => {
          console.log(data);
          this.message = data.message;
          this.alert.showAlert(data.message, AlertType.Success);
          this.appLoader.isLoading = false;
          this.getCheckoutData();
          this.getCount.getUserCount();
        },
        (error: any) => {
          this.appLoader.isLoading = false;
          console.log(error);
        }
      );
  }

  check(currentvalue: any) {
    this.state = currentvalue;
    if (this.state === 'CashOnDelivery') {
      this.appLoader.isLoading = true;
      this.checkout
        .getBillCheckoutCompleted(
          localStorage.getItem('token'),
          0,
          localStorage.getItem('userId'),
          this.state,
          this.userCartData,
          localStorage.getItem('role')
        )
        .subscribe(
          (data: any) => {
            this.message = data.message;
            this.alert.showAlert(data.message, AlertType.Success);
            this.getCheckoutData();
            this.getCount.getUserCount();
            this.appLoader.isLoading = false;
            this.userCartData = [];
          },
          (error: any) => {
            this.appLoader.isLoading = false;
            console.log(error);
          }
        );
    }
  }
  getCheckoutData() {
    this.appLoader.isLoading = true;
    this.checkout.getAllCartItems(localStorage.getItem('token')).subscribe(
      (data: any) => {
        this.userCartData = data;
        this.appLoader.isLoading = false;
      },
      (error: any) => {
        this.appLoader.isLoading = false;
        console.log(error);
      }
    );
    this.appLoader.isLoading = false;
  }

  getMessageClass(status: number) {
    if (status === 1) {
      return 'alert alert-success';
    } else {
      return 'alert alert-warning';
    }
  }
}
// setTimeout(()=>{
//    this.message=""||null;
//
//  },3000);
