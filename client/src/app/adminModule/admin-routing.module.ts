import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from '../sharedModule/Components/Home/home.component';
import { AuthUserGuard } from '../sharedModule/guards/auth-user.guard';
import { AdminComponent } from './Components/dashboard/admin.component';



const routes: Routes = [
{path:'',component:HomeComponent},
{path:'dashboard',component:AdminComponent,canActivate:[AuthUserGuard]},
];

@NgModule({
  // declarations: [LoginComponent, SignupComponent, ForgetpasswordComponent],
imports: [RouterModule.forChild(routes)],
// imports: [CommonModule,RouterModule.forChild(routes)],
exports: [RouterModule]
})
export class adminRoutingModule {}
