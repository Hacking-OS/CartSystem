import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../sharedModule/sharedServices/api.service';
@Injectable({
  providedIn: 'root'
})
export class CartService {
  constructor(private api: ApiService) {}

  checkOut<T>(userId: any): Observable<T> {
    return this.api.post<T>('/cart/checkout', { id: userId });
  }

  getUserCart<T>(): Observable<T> {
    return this.api.get<T>('/cart/get');
  }

  getUserCart2<T>(): Observable<T> {
    return this.api.get<T>('/cart/getRemoved');
  }

  removeFromCart<T>(cartId: any): Observable<T> {
    return this.api.post<T>('/cart/remove', { id: cartId });
  }
}
