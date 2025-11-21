import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../sharedModule/sharedServices/api.service';

@Injectable()
export class UserService {
  constructor(private Http: HttpClient, private api: ApiService) {}

  emailValidate<T>(email: string): Observable<T> {
    return this.api.post<T>('/users/check', {emailAddress: email });
  }

  insertData<T>(formData: any): Observable<T> {
    return this.api.post<T>('/users/signup', {userInput: formData.formValues,IpAddress: formData.userIp});
  }

  loginUser<T>(formData: any): Observable<T> {
    return this.api.post<T>('/users/login', {userInput: formData.formValues,IpAddress: formData.userIp});
  }

  getAdminPanel<T>(Token:any): Observable<T> {
    return this.api.get<T>('/users/get');
  }

  getBillDetails<T>(Token:any): Observable<T> {
    return this.api.get<T>('/dashboard/details');
  }

  changeUserStatus<T>(userId:any,Token:any,status:any): Observable<T> {
    return this.api.patch<T>('/users/update',{token:Token,userInput:userId,Status:status});
  }

  RecoverPassword<T>(formData: any): Observable<T> {
    return this.api.post<T>('/users/forgetpassword', {userInput: formData.formValues,IpAddress: formData.userIp});
  }

  getRandomNumber(min: number, max: number) {
    const RandNum = Math.floor(Math.random() * (max - min + 1)) + min
    return RandNum
  }

  getIpAddress<T>(): Observable<T> {
    return this.Http.get<T>('https://ipinfo.io/json')
  }
}
