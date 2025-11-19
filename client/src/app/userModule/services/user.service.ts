import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Injectable, NgModule } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable()
export class UserService {
  constructor(private Http: HttpClient) {}
  emailValidate(email: string): any {
    return this.Http.post(environment.baseUrl+'/users/check', {emailAddress: email, })
  }


  insertData(formData: any): any {
    return this.Http.post(environment.baseUrl+'/users/signup', {userInput: formData.formValues,IpAddress: formData.userIp});
  }
  loginUser(formData: any): any {
    return this.Http.post(environment.baseUrl+'/users/login', {userInput: formData.formValues,IpAddress: formData.userIp});
  }
  getAdminPanel(Token:any): any {
   let header = new HttpHeaders({
    'Content-Type':  'application/json',
    Authorization: "Bearer "+Token
   });
    return this.Http.get(environment.baseUrl+'/users/get');
  }

  getBillDetails(Token:any): any {

   let header=new HttpHeaders({
    'Content-Type':  'application/json',
    Authorization: "Bearer "+Token
   });
    return this.Http.get(environment.baseUrl+'/dashboard/details');
  }

  changeUserStatus(userId:any,Token:any,status:any): any {
   let header=new HttpHeaders({
    'Content-Type':  'application/json',
    Authorization: "Bearer "+Token
   });
    return this.Http.patch(environment.baseUrl+'/users/update',{token:Token,userInput:userId,Status:status});
  }

  RecoverPassword(formData: any): any {
    return this.Http.post(environment.baseUrl+'/users/forgetpassword', {userInput: formData.formValues,IpAddress: formData.userIp});
  }

  getRandomNumber(min: number, max: number) {

    const RandNum = Math.floor(Math.random() * (max - min + 1)) + min
    return RandNum
  }

  getIpAddress(): any {
    return this.Http.get('https://ipinfo.io/json')
  }
}
