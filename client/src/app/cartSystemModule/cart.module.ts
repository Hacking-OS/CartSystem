import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AutherizeInterceptor } from '../sharedModule/interceptors/autherize.interceptor';
import { MainModule } from '../sharedModule/main.module';
import { BillComponent } from './Components/bill/bill/bill.component';
import { CartComponent } from './Components/cart/cart/cart.component';
import { CategoryComponent } from './Components/category/category-list/category.component';
import { CheckoutComponent } from './Components/checkout/checkout/checkout.component';
import { ProductsComponent } from './Components/products/product-listing/products.component';
import { cartRoutingModule } from './cart-routing.module';
import { Cart_Service } from './HttpServices/cart.service';

@NgModule({
  declarations: [
    BillComponent,
    CartComponent,
    CheckoutComponent,
    ProductsComponent,
    CategoryComponent,
  ],
  imports: [
    cartRoutingModule,
    HttpClientModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MainModule
  ],
  providers: [
    Cart_Service,
  ],
})
export class cartModule {}
