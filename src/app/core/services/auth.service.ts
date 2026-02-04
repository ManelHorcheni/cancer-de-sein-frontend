import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

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
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadStoredUser();
  }

  // ✅ CORRECTION ICI : Ajouter tap() pour mettre à jour immédiatement
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `/api/auth/login`,
      { email, password }
    ).pipe(
      tap(response => {
        // Mettre à jour IMMÉDIATEMENT après la réponse
        this.storeAuthData(response);
        console.log('AuthService: Données stockées, rôle:', response.role);
      }),
      catchError(error => {
        console.error('Erreur login:', error);
        return throwError(() => error);
      })
    );
  }

  register(userData: any): Observable<User> {
    return this.http.post<User>(
      `/api/auth/register`,
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
    return this.http.get<User>(`/api/auth/me`);
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`/api/auth/users`);
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

  // ✅ CORRECTION CRITIQUE ICI : Améliorer getUserRole()
  getUserRole(): string | null {
    // 1. Vérifier d'abord le BehaviorSubject (le plus récent)
    const currentUser = this.currentUserSubject.value;
    if (currentUser && currentUser.role) {
      console.log('AuthService: Rôle depuis currentUserSubject:', currentUser.role);
      return currentUser.role;
    }
    
    // 2. Vérifier dans localStorage current_user
    const userJson = localStorage.getItem('current_user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        if (user && user.role) {
          console.log('AuthService: Rôle depuis localStorage current_user:', user.role);
          return user.role;
        }
      } catch (e) {
        console.error('Erreur parsing current_user:', e);
      }
    }
    
    // 3. Vérifier dans localStorage user_role (ancienne méthode)
    const roleFromStorage = localStorage.getItem('user_role');
    if (roleFromStorage) {
      console.log('AuthService: Rôle depuis localStorage user_role:', roleFromStorage);
      return roleFromStorage;
    }
    
    console.log('AuthService: Aucun rôle trouvé');
    return null;
  }

  // ✅ CORRECTION : Ajouter des logs pour le débogage
  isAdmin(): boolean {
    const role = this.getUserRole();
    const isAdmin = role === 'ADMIN';
    console.log('AuthService: isAdmin?', isAdmin, 'role:', role);
    return isAdmin;
  }

  isDoctor(): boolean {
    const role = this.getUserRole();
    const isDoctor = role === 'DOCTOR';
    console.log('AuthService: isDoctor?', isDoctor, 'role:', role);
    return isDoctor;
  }

  isPatient(): boolean {
    const role = this.getUserRole();
    const isPatient = role === 'PATIENT';
    console.log('AuthService: isPatient?', isPatient, 'role:', role);
    return isPatient;
  }

  // ✅ CORRECTION : storeAuthData avec logs
  private storeAuthData(response: LoginResponse): void {
    console.log('AuthService: Stockage des données d\'auth...');
    
    localStorage.setItem('access_token', response.accessToken);
    localStorage.setItem('user_role', response.role);
    localStorage.setItem('user_email', response.email);
    
    // Stocker les infos utilisateur de base
    const userBasicInfo: User = {
      id: 0, // Temporaire, sera mis à jour par getCurrentUser()
      firstName: response.firstName,
      lastName: response.lastName,
      email: response.email,
      role: response.role,
      enabled: true,
      createdAt: new Date()
    };
    
    localStorage.setItem('current_user', JSON.stringify(userBasicInfo));
    
    // Mettre à jour IMMÉDIATEMENT le BehaviorSubject
    this.currentUserSubject.next(userBasicInfo);
    
    console.log('AuthService: Données stockées avec succès');
    console.log('AuthService: Rôle stocké:', response.role);
    console.log('AuthService: currentUserSubject:', this.currentUserSubject.value);
  }

  private loadStoredUser(): void {
    const userJson = localStorage.getItem('current_user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        this.currentUserSubject.next(user);
        console.log('AuthService: Utilisateur chargé depuis localStorage:', user);
      } catch (e) {
        console.error('AuthService: Erreur parsing user:', e);
      }
    } else {
      console.log('AuthService: Aucun utilisateur stocké trouvé');
    }
  }

  // ✅ NOUVELLE MÉTHODE : Charger l'utilisateur complet depuis l'API
  loadCurrentUser(): Observable<User> {
    return this.getCurrentUser().pipe(
      tap(user => {
        // Fusionner avec les données de base
        const currentUser = this.currentUserSubject.value;
        const updatedUser = {
          ...currentUser,
          ...user,
          role: user.role || (currentUser ? currentUser.role : 'PATIENT')
        };
        
        this.currentUserSubject.next(updatedUser);
        localStorage.setItem('current_user', JSON.stringify(updatedUser));
        console.log('AuthService: Utilisateur complet chargé:', updatedUser);
      }),
      catchError(error => {
        console.error('AuthService: Erreur chargement utilisateur:', error);
        // Ne pas déconnecter, garder les données de base
        return throwError(() => error);
      })
    );
  }
  
  // ✅ MÉTHODE UTILE : Vérifier et mettre à jour le statut d'authentification
  checkAuthStatus(): void {
    if (this.isLoggedIn()) {
      this.loadCurrentUser().subscribe({
        next: () => console.log('AuthService: Statut vérifié et mis à jour'),
        error: () => console.log('AuthService: Utilisation des données stockées')
      });
    }
  }
}