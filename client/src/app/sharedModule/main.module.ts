import { NgModule } from '@angular/core';
import { MainRoutingModule } from './main-routing.module';
import { CommonModule } from '@angular/common';

// import { NgToastModule } from 'ng-angular-popup';
// import { ToastrModule } from 'ngx-toastr';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HomeComponent } from './Components/Home/home.component';
import { ErrorComponent } from './Components/error/error.component';
import { FooterComponent } from './Components/footer/footer.component';
import { HeaderComponent } from './Components/header/header.component';
import { PageComponent } from './Components/page/page.component';
import { SidebarComponent } from './Components/sidebar/sidebar.component';
import { MainService } from './HttpServices/main.service';
import { TestingService } from './sharedServices/testing.service';
import { UtilitiesService } from './sharedServices/utilities.service';
import { FeatureModule } from './features/feature.module';
import { AlertService } from './alertServices/alert.service';
import { CspNonceService } from './sharedServices/security/cspnounce.service';

@NgModule({
  declarations: [
    HomeComponent,
    HeaderComponent,
    FooterComponent,
    ErrorComponent,
    PageComponent,
    SidebarComponent,
  ],
  imports: [
    MainRoutingModule,
    HttpClientModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FeatureModule,
  ],
  providers: [
    MainService,
    UtilitiesService,
    TestingService,
    AlertService,
    CspNonceService,
    // { provide: HTTP_INTERCEPTORS, useClass: AutherizeInterceptor, multi: true },
  ],
  exports: [
    HomeComponent,
    HeaderComponent,
    FooterComponent,
    ErrorComponent,
    PageComponent,
    SidebarComponent,

    //Using FeatureModule components globally by using MainModule
    FeatureModule,
  ],
})
export class MainModule {}
