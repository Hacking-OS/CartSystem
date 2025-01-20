// refreshtoken.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class RefreshtokenService {
  constructor(private http: HttpClient) {}

  // Implement the logic to refresh the token
  refreshToken(): Observable<any> {
    // Make an HTTP request to your server to obtain a new access token using the refresh token
    return this.http.post<any>(environment.baseUrl+'/users/refresh-token', {token:localStorage.getItem('token'),refreshToken:localStorage.getItem('refreshToken')});
  }
}
