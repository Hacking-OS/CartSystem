import { HttpClient } from '@angular/common/http';
import { Injectable, NgModule } from '@angular/core';
import { environment } from '../../../../environments/environment';


@Injectable({
  providedIn: 'root'
})

export class RefreshtokenService {
  response:any;
  refreshtoken:any;
  constructor(private Http: HttpClient) {}

  isValid(token:any){
  return this.Http.get(environment.baseUrl+'/users/validToken/'+token);
  }


token(){
 return this.Http.get(environment.baseUrl+'/users/token');
}
}


