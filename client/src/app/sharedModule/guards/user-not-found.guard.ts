import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { ProductService } from '../../cartSystemModule/services/product.service';

@Injectable({
  providedIn: 'root'
})
export class UserNotFoundGuard  {
  constructor(private router:Router,private checkConnection:ProductService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      this.checkConnection.check(localStorage.getItem('token'),"").subscribe((data:any)=>{},(error:any)=>{
        // localStorage.removeItem('token');
        // localStorage.removeItem('role');
        // localStorage.removeItem('userId');
        // localStorage.setItem('token',error.error.token);
      });
      if(localStorage.getItem('role')===null||localStorage.getItem('role')===undefined){
               if(localStorage.getItem('token')===null||localStorage.getItem('token')===undefined){
                return true;
               }
      }
    return false;
  }

}
