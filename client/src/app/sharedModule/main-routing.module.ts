import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { MainService } from './HttpServices/main.service';
import { UtilitiesService } from './sharedServices/utilities.service';
import { TestingService } from './sharedServices/testing.service';

const routes: Routes = [];

@NgModule({
  // declarations: [LoginComponent, SignupComponent, ForgetpasswordComponent],
  declarations: [],
imports: [RouterModule.forChild(routes)],
// imports: [CommonModule,RouterModule.forChild(routes)],
exports: [RouterModule],
providers: [],
})
export class MainRoutingModule {}
