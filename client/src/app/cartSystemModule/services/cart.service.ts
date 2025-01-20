import { Injectable, NgModule } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root'
})

@NgModule({
  declarations: [],
  imports: [],
  exports: []
})

export class CartService {
  constructor(private Http:HttpClient) {}

  checkOut(Token:any,userId:any){

      return this.Http.post(environment.baseUrl+'/cart/checkout',{id:userId});
  }

  getUserCart(Token:any){

      return this.Http.get(environment.baseUrl+'/cart/get');
  }
  getUserCart2(Token:any){

      return this.Http.get(environment.baseUrl+'/cart/getRemoved');
  }


  removeFromCart(Token:any,cartId:any){

      return this.Http.post(environment.baseUrl+'/cart/remove',{id:cartId});
  }
}
