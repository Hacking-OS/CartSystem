import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AlertService, AlertType } from '../../../../sharedModule/alertServices/alert.service';
import { CartService } from '../../../services/cart.service';
import { SharedService } from '../../../../sharedModule/sharedServices/shared.service';
import { CartItemWithProductDTO, CheckoutCartResponseDTO, ApiResponseDTO } from '../../../../sharedModule/sharedServices/api.dto';





@Component({
selector: 'app-cart',
templateUrl: './cart.component.html',
styleUrls: ['./cart.component.css'],
})


export class CartComponent {
  message: string = '';
  userCartData: CartItemWithProductDTO[] = [];
  userCartData2: CartItemWithProductDTO[] = [];
  constructor(private UserCart: CartService, Http: HttpClient,private router:Router,
    private getCount:SharedService,
    private alertService:AlertService,
    ) {
    this.getUserCart();
  }

  removeFromCart(cartId: number): void {
    this.UserCart.removeFromCart<ApiResponseDTO>(cartId).subscribe({
      next: (data: ApiResponseDTO) => {
        this.alertService.showAlert(data.message || 'Item removed from cart', AlertType.Warning);
        this.getUserCart();
        this.getCount.getUserCount();
      },
      error: (error) => {
        console.log(error);
        const errorMessage = error?.error?.message || 'Unable to remove item from cart.';
        this.alertService.showAlert(errorMessage, AlertType.Error);
      },
    });
    setTimeout(() => {
      this.message = "";
    }, 3000);
  }

  checkoutUser(): void {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      this.alertService.showAlert('User ID not found. Please log in again.', AlertType.Error);
      return;
    }

    this.UserCart.checkOut<ApiResponseDTO>(userId).subscribe({
      next: (data: ApiResponseDTO) => {
        this.message = data.message || 'Checkout successful!';
        this.alertService.showAlert(this.message, AlertType.Success);
        this.getCount.getUserCount();
        this.getUserCart();
      },
      error: (error) => {
        console.log(error);
        const errorMessage = error?.error?.message || 'Unable to checkout. Please try again.';
        this.alertService.showAlert(errorMessage, AlertType.Error);
      },
    });

    setTimeout(() => {
      this.message = "";
    }, 3000);
  }

  getUserCart(): void {
    this.UserCart.getUserCart<CartItemWithProductDTO[]>().subscribe({
      next: (data: CartItemWithProductDTO[]) => {
        this.userCartData = data;
      },
      error: (error) => {
        console.log(error);
        const errorMessage = error?.error?.message || 'Unable to load cart items.';
        this.alertService.showAlert(errorMessage, AlertType.Error);
      },
    });

    this.UserCart.getUserCart2<CartItemWithProductDTO[]>().subscribe({
      next: (data: CartItemWithProductDTO[]) => {
        this.userCartData2 = data;
      },
      error: (error) => {
        console.log(error);
      },
    });

    setTimeout(() => {
      this.message = "";
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


