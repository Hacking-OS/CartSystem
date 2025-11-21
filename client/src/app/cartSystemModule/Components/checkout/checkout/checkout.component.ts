import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, NgForm } from '@angular/forms';
import {
  AlertService,
  AlertType,
} from '../../../../sharedModule/alertServices/alert.service';
import { CheckoutService } from '../../../services/checkout.service';
import { SharedService } from '../../../../sharedModule/sharedServices/shared.service';
import { CheckoutResponseDTO, CheckoutCartResponseDTO, CartItemWithProductDTO } from '../../../../sharedModule/sharedServices/api.dto';

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

  message: string = '';
  userCartData: CheckoutCartResponseDTO | null = null;
  state: string = '';
  isProcessing = false;
  constructor(
    private fBuilder: FormBuilder,
    private checkout: CheckoutService,
    private alert: AlertService,
    Http: HttpClient,
    private getCount: SharedService
  ) {
    this.getCheckoutData();
  }
  get cartItems(): CartItemWithProductDTO[] {
    if (this.userCartData && Array.isArray(this.userCartData.result)) {
      return this.userCartData.result;
    }
    return [];
  }

  get totalDue(): number {
    return this.userCartData?.resultPriceTotal ?? 0;
  }

  get hasCheckoutItems(): boolean {
    return this.cartItems.length > 0 && this.totalDue > 0;
  }

  submitPayment(PaymentValues: NgForm): void {
    if (!this.hasCheckoutItems) {
      this.alert.showAlert('No items ready for payment. Please move items to checkout first.', AlertType.Warning);
      return;
    }

    if (this.state !== 'CardPayMent') {
      this.alert.showAlert('Please select the Card payment option before submitting card details.', AlertType.Warning);
      return;
    }

    this.isProcessing = true;
    this.checkout
      .getBillCheckoutCompleted(
        localStorage.getItem('token'),
        PaymentValues.form.value,
        localStorage.getItem('userId'),
        this.state,
        this.cartItems,
        localStorage.getItem('role')
      )
      .subscribe({
        next: (data: unknown) => {
          const response = data as CheckoutResponseDTO;
          this.message = response.message;
          this.alert.showAlert(response.message, AlertType.Success);
          this.isProcessing = false;
          this.getCheckoutData();
          this.getCount.getUserCount();
        },
        error: (error) => {
          this.isProcessing = false;
          const errorMessage = this.resolveErrorMessage(error, 'Payment processing failed. Please try again.');
          this.alert.showAlert(errorMessage, AlertType.Error);
        },
      });
  }

  check(currentvalue: string): void {
    this.state = currentvalue;

    if (!this.hasCheckoutItems) {
      this.alert.showAlert('No items ready for checkout yet.', AlertType.Warning);
      return;
    }

    if (this.state === 'CashOnDelivery') {
      this.isProcessing = true;
      this.checkout
        .getBillCheckoutCompleted(
          localStorage.getItem('token'),
          0,
          localStorage.getItem('userId'),
          this.state,
          this.cartItems,
          localStorage.getItem('role')
        )
        .subscribe({
          next: (data: unknown) => {
            const response = data as CheckoutResponseDTO;
            this.message = response.message;
            this.alert.showAlert(response.message, AlertType.Success);
            this.getCheckoutData();
            this.getCount.getUserCount();
            this.isProcessing = false;
            this.userCartData = null;
            this.state = '';
          },
          error: (error) => {
            this.isProcessing = false;
            const errorMessage = this.resolveErrorMessage(error, 'Checkout failed. Please try again.');
            this.alert.showAlert(errorMessage, AlertType.Error);
          },
        });
    }
  }

  getCheckoutData(): void {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      this.alert.showAlert('Please log in again to continue checkout.', AlertType.Warning);
      this.userCartData = null;
      return;
    }

    this.checkout.getAllCartItems<CheckoutCartResponseDTO>().subscribe({
      next: (data: unknown) => {
        const response = data as CheckoutCartResponseDTO;
        const normalizedResult = Array.isArray(response?.result) ? response.result : [];
        const normalizedTotal = typeof response?.resultPriceTotal === 'number' ? response.resultPriceTotal : 0;

        if (!normalizedResult.length || normalizedTotal === 0) {
          this.userCartData = null;
          this.alert.showAlert(
            'No items waiting for checkout. Use the cart page to move products into checkout.',
            AlertType.Info
          );
        } else {
          this.userCartData = {
            result: normalizedResult,
            resultPriceTotal: normalizedTotal,
          };
        }
      },
      error: (error) => {
        const errorMessage = this.resolveErrorMessage(error, 'Unable to load cart items.');
        this.alert.showAlert(errorMessage, AlertType.Error);
        this.userCartData = null;
      },
    });
  }

  private resolveErrorMessage(error: unknown, fallback: string): string {
    if (!error) {
      return fallback;
    }
    if (typeof error === 'string') {
      return error;
    }
    if (error instanceof Error) {
      return error.message || fallback;
    }
    const maybeHttp = error as { error?: any; message?: string; friendlyMessage?: string };
    return (
      maybeHttp?.friendlyMessage ||
      maybeHttp?.error?.message ||
      maybeHttp?.message ||
      fallback
    );
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
