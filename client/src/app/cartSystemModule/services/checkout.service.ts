import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../sharedModule/sharedServices/api.service';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  constructor(private api:ApiService) {}

  addNewCategory<T>(categoryName:string, token:any): Observable<T> {
    return this.api.post<T>('/category/add',{token:token,catName:categoryName});
  }

  getAllCartItems<T>(): Observable<T> {
    return this.api.get<T>('/checkout/get/'+localStorage.getItem('userId'));
  }

  getAllCategoriesForUser<T>(): Observable<T> {
    return this.api.get<T>('/category/getUserCategory');
  }

  updateCategoryById<T>(catId:any, token:any, catNewName:string): Observable<T> {
    return this.api.patch<T>('/category/update',{id:catId,name:catNewName});
  }

  getBillCheckoutCompleted<T>(
    token: string | null,
    uservalue: unknown,
    userId: string | null,
    PaymentMethod: string | undefined,
    productInfo: Array<object>,
    userRole: string | null
  ): Observable<T> {
    return this.api.post<T>('/bill/GenerateReport',{id:userId,cardDetails:uservalue,paymentType:PaymentMethod,productInfo:productInfo,role:userRole});
  }
}
