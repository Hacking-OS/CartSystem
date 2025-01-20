import { HttpClient } from '@angular/common/http';
import { Injectable, NgModule } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
@NgModule({})
export class MessengerService
 {

  constructor(private http:HttpClient) { }
  getAllMessages(){
    return this.http.get(environment.baseUrl+'/message/get/');
}
sendMessage(getUserMessageData:Object){
    return this.http.post(environment.baseUrl+'/message/send/',getUserMessageData);
}
deleteMessage(getUserMessageData:string){
    return this.http.delete(environment.baseUrl+'/message/delete/'+getUserMessageData);
}
}
