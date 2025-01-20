import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from '../sharedModule/Components/Home/home.component';
import { UserFoundGuard } from '../sharedModule/guards/user-found.guard';
import { UserNotFoundGuard } from '../sharedModule/guards/user-not-found.guard';
import { ForgetpasswordComponent } from './Components/Forgot-password/forgetpassword.component';
import { LoginComponent } from './Components/Login/login.component';
import { MessengerComponent } from './Components/Messenger/messenger.component';
import { SignupComponent } from './Components/Signup/signup.component';


const routes: Routes = [
{path:'',component:HomeComponent},
{path:'login',component:LoginComponent,canActivate:[UserNotFoundGuard] },
{path:'signup',component:SignupComponent,canActivate:[UserNotFoundGuard]},
{path:'forgetpassword',component:ForgetpasswordComponent,canActivate:[UserNotFoundGuard]},
{path:'message',component:MessengerComponent,canActivate:[UserFoundGuard]},
];

@NgModule({
  // declarations: [LoginComponent, SignupComponent, ForgetpasswordComponent],
  // imports: [CommonModule,RouterModule.forChild(routes)],
  imports: [RouterModule.forChild(routes)],
exports: [RouterModule]
})
export class userRoutingModule {}
