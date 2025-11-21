import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable, Signal, signal } from '@angular/core';
import { catchError, finalize, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiRequestOptions {
  body?: unknown;
  params?: HttpParams | Record<string, string | number | boolean | readonly string[]>;
  headers?: Record<string, string>;
  responseType?: 'json' | 'blob' | 'text' | 'arraybuffer';
  reportProgress?: boolean;
  withCredentials?: boolean;
}

export interface ApiState {
  loading: Signal<boolean>;
  error: Signal<string | null>;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService implements ApiState {
  private readonly http = inject(HttpClient);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  public readonly loading = this.loadingSignal.asReadonly();
  public readonly error = this.errorSignal.asReadonly();

  request<T>(
    method: HttpMethod,
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Observable<T> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    const url = `${environment.baseUrl}${endpoint}`;
    
    // Build proper HttpRequest options
    const requestOptions = {
      body: options.body,
      params: options.params,
      headers: options.headers,
      responseType: options.responseType as any,
      reportProgress: options.reportProgress,
      withCredentials: options.withCredentials,
    };

    return this.http.request<T>(method, url, requestOptions).pipe(
      catchError((error: HttpErrorResponse) => {
        const errorMessage = this.getErrorMessage(error);
        this.errorSignal.set(errorMessage);
        return throwError(() => errorMessage);
      }),
      finalize(() => this.loadingSignal.set(false))
    );
  }

  // Convenience methods for common HTTP verbs
  get<T>(endpoint: string, options: Omit<ApiRequestOptions, 'body'> = {}): Observable<T> {
    return this.request<T>('GET', endpoint, options);
  }

  post<T>(endpoint: string, body?: unknown, options: ApiRequestOptions = {}): Observable<T> {
    return this.request<T>('POST', endpoint, { ...options, body });
  }

  put<T>(endpoint: string, body?: unknown, options: ApiRequestOptions = {}): Observable<T> {
    return this.request<T>('PUT', endpoint, { ...options, body });
  }

  patch<T>(endpoint: string, body?: unknown, options: ApiRequestOptions = {}): Observable<T> {
    return this.request<T>('PATCH', endpoint, { ...options, body });
  }

  delete<T>(endpoint: string, options: ApiRequestOptions = {}): Observable<T> {
    return this.request<T>('DELETE', endpoint, options);
  }

  // Clear error state
  clearError(): void {
    this.errorSignal.set(null);
  }

  // Clear loading state (useful for manual override)
  clearLoading(): void {
    this.loadingSignal.set(false);
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      return `Client error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.status === 0) {
        return 'Network error: Unable to connect to server';
      }
      
      // Try to extract meaningful error message from response
      const serverMessage = error.error?.message || 
                           error.error?.error?.message || 
                           error.message || 
                           `Server error ${error.status}: ${error.statusText}`;
      
      return serverMessage;
    }
  }
}