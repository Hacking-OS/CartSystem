import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgToastModule } from 'ng-angular-popup';
import { ToastrModule } from 'ngx-toastr';
import { adminRoutingModule } from './admin-routing.module';

import { AutherizeInterceptor } from '../sharedModule/interceptors/autherize.interceptor';
import { MainModule } from '../sharedModule/main.module';
import { AdminComponent } from './Components/dashboard/admin.component';
import { FeatureModule } from '../sharedModule/features/feature.module';
import { UserService } from '../userModule/services/user.service';
import { AdminService } from './HttpServices/admin.service';
import { SharedCoreService } from '../sharedModule/sharedServices/shared-core.service';
import { SharedService } from '../sharedModule/sharedServices/shared.service';

@NgModule({
  declarations: [AdminComponent],
  imports: [
    adminRoutingModule,
    UserService,
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
    AdminService,
    MainModule,
    FeatureModule,
  ],
 providers:[
  { provide: HTTP_INTERCEPTORS, useClass: AutherizeInterceptor, multi: true },
 ]
})
export class adminModule {}
