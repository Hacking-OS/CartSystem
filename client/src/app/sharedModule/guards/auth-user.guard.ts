import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import {Router} from '@angular/router';
import { ProductService } from '../../cartSystemModule/services/product.service';

@Injectable({
  providedIn: 'root'
})

export class AuthUserGuard  {
  constructor(private router:Router,private checkConnection:ProductService) {}
    canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      this.checkConnection.check(localStorage.getItem('token'),"").subscribe((data:any)=>{},(error:any)=>{
        // localStorage.removeItem('token');
        // localStorage.removeItem('role');
        // localStorage.removeItem('userId');
        // localStorage.setItem('token',error.token);
      });
      if(localStorage.getItem('role')==='admin'){
        return true;
      }else{
        // this.router.navigate(['']);
        return false;
      }
  }
}
