import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from '../sharedModule/Components/Home/home.component';
import { UserFoundGuard } from '../sharedModule/guards/user-found.guard';
import { BillComponent } from './Components/bill/bill/bill.component';
import { CartComponent } from './Components/cart/cart/cart.component';
import { CategoryComponent } from './Components/category/category-list/category.component';
import { CheckoutComponent } from './Components/checkout/checkout/checkout.component';
import { ProductsComponent } from './Components/products/product-listing/products.component';



const routes: Routes = [
{path:'',component:HomeComponent},
{path:'bill',component:BillComponent,canActivate:[UserFoundGuard]},
{path:'cart',component:CartComponent,canActivate:[UserFoundGuard]},
{path:'product',component:ProductsComponent,canActivate:[UserFoundGuard]},
{path:'checkout',component:CheckoutComponent,canActivate:[UserFoundGuard]},
{path:'category',component:CategoryComponent,canActivate:[UserFoundGuard]},
];

@NgModule({
  // declarations: [LoginComponent, SignupComponent, ForgetpasswordComponent],
imports: [RouterModule.forChild(routes)],
// imports: [CommonModule,RouterModule.forChild(routes)],
exports: [RouterModule]
})
export class cartRoutingModule {}
