import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpHeaders,
  HttpClient,
  HttpErrorResponse,
  HttpResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize, switchMap, take } from 'rxjs/operators';
import { RefreshtokenService } from './refreshtoken.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AutherizeInterceptor implements HttpInterceptor {
  private isRefreshing = false;

  constructor(
    private http: HttpClient,
    private getToken: RefreshtokenService,
    private router: Router,
  ) {}

  // intercept(
  //   request: HttpRequest<unknown>,
  //   next: HttpHandler
  // ): Observable<HttpEvent<unknown>> {
  //   // Check if a token exists in local storage
  //   const token = localStorage.getItem('token');

  //   if (!token) {
  //     // No token found, remove any other related items and proceed with the request
  //     this.logout();
  //     return next.handle(request);
  //   }

  //   // Clone the request with authorization headers
  //   const headers = new HttpHeaders({
  //     'Content-Type': 'application/json',
  //     Authorization: 'Bearer ' + token,
  //   });

  //   const req = request.clone({ headers });

  //   return next.handle(req).pipe(
  //     catchError((error) => {
  //       if (error instanceof HttpErrorResponse && (error.status === 401 || error.status === 403)) {
  //         if (!this.isRefreshing) {
  //           this.isRefreshing = true;
  //           // Token refresh logic
  //           return this.getToken.refreshToken().pipe(
  //             switchMap((response: any) => {
  //               if (response && response.access_token) {
  //                 // Refresh successful, update the token and retry the request
  //                 localStorage.setItem('token', response.access_token);
  //                 const clonedRequest = request.clone({
  //                   headers: new HttpHeaders({
  //                     'Authorization': 'Bearer ' + response.access_token,
  //                     'Content-Type': 'application/json',
  //                   }),
  //                 });
  //                 window.location.reload();
  //                 return next.handle(clonedRequest);
  //               } else {
  //                 // Handle token refresh failure here (e.g., redirect to login)
  //                 this.logout();
  //                 this.router.navigateByUrl("user/login");
  //                 console.log('Token refresh failed');
  //                 return throwError('Token refresh failed');
  //               }
  //             }),
  //             catchError((refreshError: any) => {
  //               // Handle token refresh HTTP request error
  //               console.error('Token refresh HTTP request error', refreshError);
  //               this.logout();
  //               this.router.navigateByUrl("user/login");
  //               console.log('Token refresh HTTP request failed');
  //               return throwError('Token refresh HTTP request failed');
  //             }),
  //             finalize(() => {
  //               this.isRefreshing = false;
  //             })
  //           );
  //         } else {
  //           // If already refreshing, return an error
  //           return throwError('Token refresh in progress');
  //         }
  //       } else {
  //         // Handle other HTTP errors
  //         return throwError(error);
  //       }
  //     })
    // );
  // }
  intercept<T>(request: HttpRequest<Object>,next: HttpHandler): Observable<HttpEvent<T>> {
    // Check if a token exists in local storage
    const token = localStorage.getItem('token');

    if (!token) {
      // No token found, remove any other related items and proceed with the request
      this.logout();
      return next.handle(request) as Observable<HttpEvent<T>>;
    }

    // Clone the request with authorization headers
    const headers:HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    });

    const req = request.clone({ headers });

    return next.handle(req).pipe(
      take(2),
      catchError((error) => {
        if (error instanceof HttpErrorResponse && (error.status === 401 || error.status === 403)) {
          if (!this.isRefreshing) {
            this.isRefreshing = true;
            // Token refresh logic
            return this.getToken.refreshToken().pipe(
              switchMap((response:any): Observable<HttpEvent<any>> => {
                if (response && response.access_token) {
                  // Refresh successful, update the token and retry the request
                  localStorage.setItem('token', response.access_token);
                  const clonedRequest = request.clone({
                    headers: new HttpHeaders({
                      'Authorization': 'Bearer ' + response.access_token,
                      'Content-Type': 'application/json',
                    }),
                  });
                  return next.handle(clonedRequest) as Observable<HttpEvent<T>>;
                } else {
                  // Handle token refresh failure here (e.g., redirect to login)
                  this.logout();
                  this.router.navigate(['user', 'login']);
                  console.log('Token refresh failed');
                  return throwError(() => 'Token refresh failed') as Observable<HttpEvent<HttpErrorResponse>>;
                }
              }),
              catchError<HttpEvent<HttpErrorResponse>,Observable<HttpEvent<HttpErrorResponse>>>((refreshError:HttpErrorResponse) => {
                // Handle token refresh HTTP request error
                console.error('Token refresh HTTP request error    ', refreshError.message);
                this.logout();
                this.router.navigate(['user', 'login'])
                console.log('Token refresh HTTP request failed');
                return throwError(() => 'Token refresh HTTP request failed') as Observable<HttpEvent<HttpErrorResponse>>;
              }),
              finalize<HttpEvent<HttpErrorResponse|HttpResponse<T>>>(() => {
                this.isRefreshing = false;
              })
            );
          } else {
            // If already refreshing, return an error
            return throwError(() => 'Token refresh in progress') as  Observable<HttpEvent<HttpErrorResponse>>;
          }
        } else {
          // Handle other HTTP errors
          return throwError(() => error) as Observable<HttpEvent<HttpErrorResponse>>;
        }
      })
    ) as Observable<HttpEvent<T>>;
  }
  // If you intend to use the logout function, you can call it like this:
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userName');
  }
}
