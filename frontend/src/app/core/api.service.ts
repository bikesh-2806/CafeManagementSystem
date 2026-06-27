import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  get<T>(path: string) {
    return this.http.get<ApiResponse<T>>(`${environment.apiBaseUrl}/${path}`).pipe(map(res => res.data));
  }

  post<T>(path: string, body: any) {
    return this.http.post<ApiResponse<T>>(`${environment.apiBaseUrl}/${path}`, body).pipe(map(res => res.data));
  }

  put<T>(path: string, body: any) {
    return this.http.put<ApiResponse<T>>(`${environment.apiBaseUrl}/${path}`, body).pipe(map(res => res.data));
  }

  patch<T>(path: string, body: any = {}) {
    return this.http.patch<ApiResponse<T>>(`${environment.apiBaseUrl}/${path}`, body).pipe(map(res => res.data));
  }

  delete<T>(path: string) {
    return this.http.delete<ApiResponse<T>>(`${environment.apiBaseUrl}/${path}`).pipe(map(res => res.data));
  }

  upload<T>(path: string, formData: FormData) {
    return this.http.post<ApiResponse<T>>(`${environment.apiBaseUrl}/${path}`, formData).pipe(map(res => res.data));
  }
}
