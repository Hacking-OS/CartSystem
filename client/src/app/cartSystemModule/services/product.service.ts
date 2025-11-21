import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../sharedModule/sharedServices/api.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  constructor(private api:ApiService) {}

  getAllProducts<T>(): Observable<T> {
    return this.api.get<T>('/product/get');
  }

  check<T>(response:any|null): Observable<T> {
    return this.api.get<T>('/test/check');
  }

  getAllCategories<T>(): Observable<T> {
    return this.api.get<T>('/category/get');
  }

  getAllProductsForUser<T>(): Observable<T> {
    return this.api.get<T>('/product/getUserProducts');
  }

  getAllCategoriesForUser<T>(): Observable<T> {
    return this.api.get<T>('/category/getUserCategory');
  }

  addNewProduct<T>(productData:any,Token:any): Observable<T> {
    return this.api.post<T>('/product/add',{userInput:productData});
  }

  addToCart<T>(productPrice:any,productId:any): Observable<T> {
    return this.api.post<T>('/product/addToCart',{productPrice:productPrice,productId:productId,userId:localStorage.getItem('userId')});
  }

  updateProductById<T>(productData:any,Token:any): Observable<T> {
    return this.api.patch<T>('/product/update',{userInput:productData});
  }

  changeStatus<T>(productData:any,newStatus:any): Observable<T> {
    return this.api.patch<T>('/product/updateStatus',{userInput:productData,status:newStatus});
  }

  deleteProductById<T>(productId:any): Observable<T> {
    return this.api.delete<T>('/product/delete/'+productId);
  }
}

