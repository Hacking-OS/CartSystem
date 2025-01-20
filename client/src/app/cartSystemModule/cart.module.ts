import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgToastModule } from 'ng-angular-popup';
import { ToastrModule } from 'ngx-toastr';
import { FeatureModule } from '../sharedModule/features/feature.module';
import { AutherizeInterceptor } from '../sharedModule/interceptors/autherize.interceptor';
import { MainModule } from '../sharedModule/main.module';
import { BillComponent } from './Components/bill/bill/bill.component';
import { CartComponent } from './Components/cart/cart/cart.component';
import { CategoryComponent } from './Components/category/category-list/category.component';
import { CheckoutComponent } from './Components/checkout/checkout/checkout.component';
import { ProductsComponent } from './Components/products/product-listing/products.component';
import { cartRoutingModule } from './cart-routing.module';
import { Cart_Service } from './HttpServices/cart.service';
import { BillService } from './services/bill.service';
import { CartService } from './services/cart.service';
import { CategoryService } from './services/category.service';
import { ProductService } from './services/product.service';
import { SharedCoreService } from '../sharedModule/sharedServices/shared-core.service';
import { SharedService } from '../sharedModule/sharedServices/shared.service';




@NgModule({
  declarations: [BillComponent,CartComponent,CheckoutComponent,ProductsComponent,CategoryComponent],
  imports: [
    ProductService,
    CartService,
    CategoryService,
    BillService,
    cartRoutingModule,
    Cart_Service,
    HttpClientModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MainModule,
    FeatureModule,
  ],
 providers:[
  { provide: HTTP_INTERCEPTORS, useClass: AutherizeInterceptor, multi: true },
 ]
})
export class cartModule {}
