import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../sharedModule/sharedServices/api.service';

@Injectable({
  providedIn: 'root'
})
export class CountService {
  constructor(private api: ApiService) {}

  billCount<T>(): Observable<T> {
    return this.api.get<T>('/count/bill/'+localStorage.getItem('userId'));
  }

  cartCount<T>(): Observable<T> {
    return this.api.get<T>('/count/cart');
  }

  AdminTotalCountBill<T>(): Observable<T> {
    return this.api.get<T>('/count/Adminbill/'+localStorage.getItem('userId'));
  }

  checkOutCount<T>(): Observable<T> {
    return this.api.get<T>('/count/checkout/'+localStorage.getItem('userId'));
  }
}
