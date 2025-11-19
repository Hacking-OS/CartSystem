import { Injectable, Input, NgModule } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class BillService {
  constructor(private Http:HttpClient) {}
  getAllConsumerBill(Token:any){

      return this.Http.get(environment.baseUrl+'/bill/getBills');
  }
  getAllUserBill(Token:any){

      return this.Http.get(environment.baseUrl+'/bill/getBillsUsers/'+localStorage.getItem('userId'));
  }

  deleteBill(uuid:any,Token:any){

    //  id:uuid
      return this.Http.delete(environment.baseUrl+'/bill/delete/'+uuid);
  }
  generateReport(postUser:any,Token:any){
    let header=new HttpHeaders({
      'Content-Type':  'application/json',
      Authorization: "Bearer "+Token
     });
    //  id:uuid
      return this.Http.post(environment.baseUrl+'/bill/GenerateReport/',{id:postUser});
  }


  getPdf(postUser:any,Token:any,userRole:string|null){
    let header=new HttpHeaders({
      'Content-Type':  'application/json',
      Authorization: "Bearer "+Token
     },
     );
     let userId=localStorage.getItem('userId');
     return this.Http.post(environment.baseUrl+'/bill/getPdf/',{id:postUser,userId:userId,role:userRole},{headers:header,  responseType: 'blob'});

  }
}
