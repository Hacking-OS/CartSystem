import { NgModule } from '@angular/core';
import { userRoutingModule } from './user-routing.module';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FeatureModule } from '../sharedModule/features/feature.module';
import { AutherizeInterceptor } from '../sharedModule/interceptors/autherize.interceptor';
import { MainModule } from '../sharedModule/main.module';
import { ForgetpasswordComponent } from './Components/Forgot-password/forgetpassword.component';
import { LoginComponent } from './Components/Login/login.component';
import { MessengerComponent } from './Components/Messenger/messenger.component';
import { SignupComponent } from './Components/Signup/signup.component';

// import { NgToastModule } from 'ng-angular-popup';
// import { ToastrModule } from 'ngx-toastr';
import { HomeComponent } from '../sharedModule/Components/Home/home.component';
import { LoginService } from './HttpServices/login.service';
import { MessengerService } from './services/messenger.service';
import { UserService } from './services/user.service';
import { SharedCoreService } from '../sharedModule/sharedServices/shared-core.service';
import { SharedService } from '../sharedModule/sharedServices/shared.service';





@NgModule({
  declarations: [LoginComponent, SignupComponent, ForgetpasswordComponent, MessengerComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    userRoutingModule,
    HttpClientModule,
    UserService,
    MessengerService,
    LoginService,
    MainModule,
    FeatureModule,
  ],
 providers:[
  { provide: HTTP_INTERCEPTORS, useClass: AutherizeInterceptor, multi: true },
 ]
})
export class UserModule {}
