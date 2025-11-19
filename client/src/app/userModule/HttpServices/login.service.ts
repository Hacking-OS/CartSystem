import { inject, Injectable, NgModule } from '@angular/core';
import { LoginEndPointService } from './login-end-point.service';
@Injectable()
export class LoginService {
  private loginEndPointService: LoginEndPointService = inject(LoginEndPointService);
  constructor() { }
}
