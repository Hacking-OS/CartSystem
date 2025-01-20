import { NgModule, Renderer2 } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgToastModule } from 'ng-angular-popup';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ToastrModule } from 'ngx-toastr';
import { AlertService } from './sharedModule/alertServices/alert.service';
import { AuthUserGuard } from './sharedModule/guards/auth-user.guard';
import { UserFoundGuard } from './sharedModule/guards/user-found.guard';
import { UserNotFoundGuard } from './sharedModule/guards/user-not-found.guard';
import { CspNonceService } from './sharedModule/sharedServices/security/cspnounce.service';
import { adminModule } from './adminModule/admin.module';
import { cartModule } from './cartSystemModule/cart.module';
import { UserModule } from './userModule/user.module';
import { CountService } from './adminModule/services/count.service';
import { SharedCoreService } from './sharedModule/sharedServices/shared-core.service';
import { SharedService } from './sharedModule/sharedServices/shared.service';




@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonModule,
    BrowserAnimationsModule,
    NgxDatatableModule,
    NgSelectModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgToastModule,
    BsDatepickerModule.forRoot(),
    NgToastModule,
    ToastrModule.forRoot({
      timeOut: 3000, // Display time in milliseconds
      positionClass: 'toast-top-right', // Position of toastr
      preventDuplicates: true, // Prevent duplicate toasts
    }),
    AlertService,
    CountService,
    CspNonceService,
    UserModule,
    cartModule,
    adminModule,
  ],
  providers: [
    AuthUserGuard,
    UserNotFoundGuard,
    UserFoundGuard,
    SharedCoreService,
    SharedService,
    // { provide: HTTP_INTERCEPTORS, useClass: AutherizeInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
