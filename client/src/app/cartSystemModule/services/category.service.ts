import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../sharedModule/sharedServices/api.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  constructor(private api:ApiService) {}

  addNewCategory<T>(CategoryName:string,Token:any): Observable<T> {
    return this.api.post<T>('/category/add',{token:Token,catName:CategoryName});
  }

  getAllCategories<T>(): Observable<T> {
    return this.api.get<T>('/category/get');
  }

  getAllCategoriesForUser<T>(): Observable<T> {
    return this.api.get<T>('/category/getUserCategory');
  }

  updateCategoryById<T>(catId:any,Token:any,catNewName:string): Observable<T> {
    return this.api.patch<T>('/category/update',{id:catId,name:catNewName});
  }
}
