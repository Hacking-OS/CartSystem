import { Injectable } from '@angular/core';
import { ApiService } from '../../sharedModule/sharedServices/api.service';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class BillService {
  constructor(private api:ApiService) {}
  getAllConsumerBill<T>(Token:any): Observable<T> {

      return this.api.get<T>('/bill/getBills');
  }
  getAllUserBill<T>(Token:any): Observable<T> {

      return this.api.get<T>('/bill/getBillsUsers/'+localStorage.getItem('userId'));
  }

  deleteBill<T>(uuid:any,Token:any): Observable<T>          {

      return this.api.delete<T>('/bill/delete/'+uuid);
  }
  generateReport<T>(postUser:any,Token:any): Observable<T>    {
      return this.api.post<T>('/bill/GenerateReport/',{id:postUser});
  }


  getPdf<T>(postUser:any,Token:any,userRole:string|null): Observable<T> {
     let userId=localStorage.getItem('userId');
     return this.api.post<T>('/bill/getPdf/',{id:postUser,userId:userId,role:userRole},{ responseType:'blob'});

  }
}
