import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, NgModule } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})

@NgModule({})
export class CountService {
  constructor(private Http: HttpClient) {}
  billCount(Token:any){

      return this.Http.get(environment.baseUrl+'/count/bill/'+localStorage.getItem('userId'));
  }
  cartCount(Token:any){

      return this.Http.get(environment.baseUrl+'/count/cart');
  }
  AdminTotalCountBill(Token:any){

      return this.Http.get(environment.baseUrl+'/count/Adminbill/'+localStorage.getItem('userId'));
  }
  checkOutCount(Token:any){

      return this.Http.get(environment.baseUrl+'/count/checkout/'+localStorage.getItem('userId'));
  }
}
