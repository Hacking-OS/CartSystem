import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { NgToastModule } from 'ng-angular-popup';
// import { ToastrModule } from 'ngx-toastr';
import { FeatureRoutingModule } from './feature-routing.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AutherizeInterceptor } from '../interceptors/autherize.interceptor';
import { FileUploaderComponent } from './file-uploader/file-uploader.component';
import { ProgressBarComponent } from './progress-bar/progress-bar.component';
import { SharedCoreService } from '../sharedServices/shared-core.service';
import { MainService } from '../HttpServices/main.service';




@NgModule({
  declarations: [FileUploaderComponent,ProgressBarComponent],
  imports: [
    FeatureRoutingModule,
    HttpClientModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MainService,
  ],
 providers:[
  { provide: HTTP_INTERCEPTORS, useClass: AutherizeInterceptor, multi: true },
 ],
 exports:[FileUploaderComponent,ProgressBarComponent]
})
export class FeatureModule {}
