import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgToastModule } from 'ng-angular-popup';
import { ToastrModule } from 'ngx-toastr';
import { adminRoutingModule } from './admin-routing.module';
import { MainModule } from '../sharedModule/main.module';
import { AdminComponent } from './Components/dashboard/admin.component';
import { UserService } from '../userModule/services/user.service';
import { AdminService } from './HttpServices/admin.service';

@NgModule({
  declarations: [AdminComponent],
  imports: [
    adminRoutingModule,
    HttpClientModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgToastModule,
    ToastrModule.forRoot({
      timeOut: 3000, // Display time in milliseconds
      positionClass: 'toast-top-right', // Position of toastr
      preventDuplicates: true, // Prevent duplicate toasts
    }),
  MainModule
  ],
 providers:[
  UserService,
  AdminService,
  // { provide: HTTP_INTERCEPTORS, useClass: AutherizeInterceptor, multi: true },
 ]
})
export class adminModule {}
