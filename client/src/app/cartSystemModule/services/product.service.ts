import { Injectable, NgModule } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';


@NgModule({})
@Injectable({
  providedIn: 'root'
})
export class ProductService {
  constructor(private Http:HttpClient) {}
  getAllProducts(Token:any){
      return this.Http.get(environment.baseUrl+'/product/get');
  }
  check(Token:any,response:any|null){
      return this.Http.get(environment.baseUrl+'/product/check');
  }

  getAllCategories(Token:any){
   return this.Http.get(environment.baseUrl+'/category/get');
  }


  getAllProductsForUser(Token:any){

      return this.Http.get(environment.baseUrl+'/product/getUserProducts');
  }

  getAllCategoriesForUser(Token:any){

   return this.Http.get(environment.baseUrl+'/category/getUserProductsCat');
  }

addNewProduct(productData:any,Token:any){

      return this.Http.post(environment.baseUrl+'/product/add',{userInput:productData});
  }
addToCart(Token:any,productPrice:any,productId:any){

      return this.Http.post(environment.baseUrl+'/product/addToCart',{productPrice:productPrice,productId:productId,userId:localStorage.getItem('userId')});
  }
  updateProductById(productData:any,Token:any){

      return this.Http.patch(environment.baseUrl+'/product/update',{userInput:productData});
  }

  changeStatus(productData:any,Token:any,newStatus:any){

      return this.Http.patch(environment.baseUrl+'/product/updateStatus',{userInput:productData,status:newStatus});
  }

deleteProductById(productId:any,Token:any){

      return this.Http.delete(environment.baseUrl+'/product/delete/'+productId);
  }

}

