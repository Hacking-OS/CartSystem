import { inject, Injectable, NgModule } from '@angular/core';
import { LoginEndPointService } from './login-end-point.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { SharedService } from '../../sharedModule/sharedServices/shared.service';
@Injectable()
export class LoginService {
  private loginEndPointService: LoginEndPointService;
  constructor() {
    this.loginEndPointService = new LoginEndPointService(inject(HttpClient),inject(Router),inject(SharedService));
   }
}
