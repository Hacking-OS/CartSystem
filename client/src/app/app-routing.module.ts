import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './sharedModule/Components/Home/home.component';
import { PageNotFoundComponent } from './sharedModule/Components/page-not-found/page-not-found.component';
import { UserFoundGuard } from './sharedModule/guards/user-found.guard';

// import { HomeComponent } from './home/home.component';
const routes: Routes = [
  {
    path: '',
    canActivate: [UserFoundGuard],
    children: [
      { path: '', redirectTo: '/home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      // Other authenticated routes...
    ]
  },
  {
    path: 'user',
    loadChildren: () =>
      import('./userModule/user.module').then((m) => m.UserModule),
  },
  {
    path: 'cartSystem',
    loadChildren: () =>
      import('./cartSystemModule/cart.module').then((m) => m.cartModule),
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./adminModule/admin.module').then((m) => m.adminModule),
  },
  {
    path: '**',
    component: PageNotFoundComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
