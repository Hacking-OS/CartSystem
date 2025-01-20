import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  response:any;
  constructor(private Http:HttpClient) {}
  addNewCategory(CategoryName:string,Token:any){

      return this.Http.post(environment.baseUrl+'/category/add',{token:Token,catName:CategoryName});
  }
  getAllCartItems(Token:any){

      return this.Http.get(environment.baseUrl+'/checkout/get/'+localStorage.getItem('userId'));
  }
  getAllCategoriesForUser(Token:any){

      return this.Http.get(environment.baseUrl+'/category/getUserCategory');
  }
  updateCategoryById(catId:any,Token:any,catNewName:string){

      return this.Http.patch(environment.baseUrl+'/category/update',{id:catId,name:catNewName});
  }

  getBillCheckoutCompleted(Token:any,uservalue:any,userId:any,PaymentMethod:string|undefined,productInfo:Array<object>,userRole:string|null){
  // getBillCheckoutCompleted(Token:any,uservalue:any,userId:any,PaymentMethod:string|undefined,productInfo:Array<object>|undefined){
  return this.Http.post(environment.baseUrl+'/bill/GenerateReport',{id:userId,cardDetails:uservalue,paymentType:PaymentMethod,productInfo:productInfo,role:userRole});
  // return this.Http.post(environment.baseUrl+'/checkout/complete',{id:userId,cardDetails:uservalue});

  }
}
