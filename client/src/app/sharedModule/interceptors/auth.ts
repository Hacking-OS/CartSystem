import { Injectable, NgModule } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpHeaders,
  HttpClient,
  HttpErrorResponse,
  HttpResponse
} from '@angular/common/http';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { RefreshtokenService } from '../sharedServices/refreshTokenServices/refreshtoken.service';

// import { RefreshtokenService } from './refreshtoken.service';
// import { ProductService } from './../cartSystemServices/product.service';


@Injectable({
  providedIn: 'root'
})

export class AutherizeInterceptor implements HttpInterceptor {
  newToken:any;
  constructor(private http:HttpClient,private getToken:RefreshtokenService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {


    if(localStorage.getItem('token') == null||localStorage.getItem('token') == undefined){
      localStorage.removeItem('token');
      return next.handle(request);
    }else{

      let token = localStorage.getItem('token')||"null";
      var req = request.clone({
            headers: new HttpHeaders({
              'Content-Type': 'application/json',
              Authorization: "Bearer "+token
            })
           });

           return next.handle(req).pipe(
            catchError((error) => {
              if (error instanceof HttpErrorResponse && error.status === 401 || error.status === 403) {
                this.getToken.token().subscribe((data:any)=>{localStorage.setItem('token',data.response);});
                //
                return next.handle(request);
              }

              return throwError(() => error);
            }));
          }
        }
      }
