import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeatureRoutingModule } from './feature-routing.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// import { AutherizeInterceptor } from '../interceptors/autherize.interceptor';
import { FileUploaderComponent } from './file-uploader/file-uploader.component';
import { ProgressBarComponent } from './progress-bar/progress-bar.component';




@NgModule({
  declarations: [FileUploaderComponent,ProgressBarComponent],
  imports: [
    FeatureRoutingModule,
    HttpClientModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers:[
  // { provide: HTTP_INTERCEPTORS, useClass: AutherizeInterceptor, multi: true },
 ],
 exports:[FileUploaderComponent,ProgressBarComponent]
})
export class FeatureModule {}
