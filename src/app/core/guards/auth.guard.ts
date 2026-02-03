import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authService.isLoggedIn()) {
      // Vérifier le rôle requis
      const requiredRole = route.data['role'];
      const userRole = this.authService.getUserRole();
      
      if (requiredRole && userRole !== requiredRole) {
        // Rediriger vers la page d'accueil correspondant au rôle
        switch(userRole) {
          case 'ADMIN':
            this.router.navigate(['/admin']);
            break;
          case 'DOCTOR':
            this.router.navigate(['/doctor']);
            break;
          case 'PATIENT':
            this.router.navigate(['/patient']);
            break;
          default:
            this.router.navigate(['/auth/login']);
        }
        return false;
      }
      return true;
    }

    // Non connecté, rediriger vers login
    this.router.navigate(['/auth/login'], { 
      queryParams: { returnUrl: state.url } 
    });
    return false;
  }
}