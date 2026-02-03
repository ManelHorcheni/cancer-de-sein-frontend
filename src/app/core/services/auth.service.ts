import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
//import { environment } from '../../../environments/environment.prod';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phone?: string;
  address?: string;
  enabled: boolean;
  createdAt: Date;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string | null;
  tokenType: string;
  expiresIn: number;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
    private apiUrl = environment.apiUrl; // Vaudra "/api" en dev
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadStoredUser();
  }

  login(email: string, password: string): Observable<LoginResponse> {
  // AVEC PROXY : utilisez juste /api/auth/login
  return this.http.post<LoginResponse>(
    `/api/auth/login`,  // ← SEULEMENT /api/auth/login (pas de apiUrl)
    { email, password }
  );
}

  /* login(email: string, password: string): Observable<LoginResponse> {
    console.log('URL de login:', `${this.apiUrl}/auth/login`);
    
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, { 
      email, 
      password 
    }).pipe(
      map(response => {
        console.log('Réponse login:', response);
        this.storeAuthData(response);
        return response;
      }),
      catchError(error => {
        console.error('Erreur complète:', error);
        return throwError(() => error);
      })
    );
  } */

  register(userData: any): Observable<User> {
  return this.http.post<User>(
    `/api/auth/register`,  // ← SEULEMENT /api/auth/register
    userData,
    {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }
  );
}

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_email');
    localStorage.removeItem('current_user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  getCurrentUser(): Observable<User> {
  return this.http.get<User>(`/api/auth/me`);  // ← Sans apiUrl
}

  getUsers(): Observable<User[]> {
  return this.http.get<User[]>(`/api/auth/users`);  // ← Sans apiUrl
  }

  updateUser(id: number, userData: any): Observable<User> {
    return this.http.put<User>(`/auth/users/${id}`, userData);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`/auth/users/${id}`);
  }

  toggleUserStatus(id: number): Observable<void> {
    return this.http.patch<void>(`/auth/users/${id}/toggle-status`, {});
  }

  getStreamlitAccessLink(): Observable<{ link: string }> {
    return this.http.get<{ link: string }>(`/auth/streamlit-access`);
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('access_token');
    return !!token;
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getUserRole(): string | null {
    const user = this.currentUserSubject.value;
    return user ? user.role : localStorage.getItem('user_role');
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'ADMIN';
  }

  isDoctor(): boolean {
    return this.getUserRole() === 'DOCTOR';
  }

  isPatient(): boolean {
    return this.getUserRole() === 'PATIENT';
  }

  private storeAuthData(response: LoginResponse): void {
    localStorage.setItem('access_token', response.accessToken);
    localStorage.setItem('user_role', response.role);
    localStorage.setItem('user_email', response.email);
    
    // Stocker les infos utilisateur de base
    const userBasicInfo = {
      firstName: response.firstName,
      lastName: response.lastName,
      email: response.email,
      role: response.role
    };
    localStorage.setItem('current_user', JSON.stringify(userBasicInfo));

    // Mettre à jour le BehaviorSubject
    this.currentUserSubject.next(userBasicInfo as User);
  }

  private loadStoredUser(): void {
    const userJson = localStorage.getItem('current_user');
    if (userJson) {
      try {
        this.currentUserSubject.next(JSON.parse(userJson));
      } catch (e) {
        console.error('Erreur parsing user:', e);
      }
    }
  }

  private loadCurrentUser(): void {
    this.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUserSubject.next(user);
        localStorage.setItem('current_user', JSON.stringify(user));
      },
      error: (error) => {
        console.error('Erreur chargement user:', error);
        // Ne pas déconnecter automatiquement en cas d'erreur
      }
    });
  }
}