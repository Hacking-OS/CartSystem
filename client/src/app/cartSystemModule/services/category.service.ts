import { Injectable, NgModule } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Token } from '@angular/compiler';
import { environment } from '../../../environments/environment';
@NgModule({})

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  constructor(private Http:HttpClient) {}
  addNewCategory(CategoryName:string,Token:any){

      return this.Http.post(environment.baseUrl+'/category/add',{token:Token,catName:CategoryName});
  }
  getAllCategories(Token:any){

      return this.Http.get(environment.baseUrl+'/category/get');
  }
  getAllCategoriesForUser(Token:any){

      return this.Http.get(environment.baseUrl+'/category/getUserCategory');
  }
  updateCategoryById(catId:any,Token:any,catNewName:string){

      return this.Http.patch(environment.baseUrl+'/category/update',{id:catId,name:catNewName});
  }
}
