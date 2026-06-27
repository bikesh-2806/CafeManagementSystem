import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, map, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse, AuthUser, UserRole } from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'homeTownCafeUser';
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(this.readUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string) {
    return this.http.post<ApiResponse<AuthUser>>(`${environment.apiBaseUrl}/auth/login`, { email, password }).pipe(
      map(res => res.data),
      tap(user => this.setUser(user))
    );
  }

  register(payload: any) {
    return this.http.post<ApiResponse<AuthUser>>(`${environment.apiBaseUrl}/auth/register`, payload).pipe(
      map(res => res.data),
      tap(user => this.setUser(user))
    );
  }

  logout() {
    localStorage.removeItem(this.storageKey);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  get user() {
    return this.currentUserSubject.value;
  }

  get token() {
    return this.user?.token ?? '';
  }

  hasRole(roles: UserRole[]) {
    return !!this.user && roles.includes(this.user.role);
  }

  private setUser(user: AuthUser) {
    localStorage.setItem(this.storageKey, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private readUser(): AuthUser | null {
    const raw = localStorage.getItem(this.storageKey);
    return raw ? JSON.parse(raw) : null;
  }
}
