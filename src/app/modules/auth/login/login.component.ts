import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['admin@medinsight.com', [Validators.required, Validators.email]],
      password: ['Admin123!', Validators.required]
    });
  }

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    
    // Vérifier si déjà connecté
    console.log('LoginComponent: Déjà connecté?', this.authService.isLoggedIn());
    console.log('LoginComponent: Token:', this.authService.getToken());
    console.log('LoginComponent: Rôle actuel:', this.authService.getUserRole());
    
    if (this.authService.isLoggedIn()) {
      this.redirectBasedOnRole();
    }
  }

  get f() { return this.loginForm.controls; }

  onSubmit(): void {
    this.submitted = true;
    
    if (this.loginForm.invalid) {
      console.log('LoginComponent: Formulaire invalide', this.loginForm.errors);
      return;
    }

    this.loading = true;
    
    console.log('LoginComponent: Envoi login:', {
      email: this.f['email'].value,
      password: this.f['password'].value
    });

    this.authService.login(this.f['email'].value, this.f['password'].value)
      .subscribe({
        next: (response) => {
          console.log('LoginComponent: Login réussi, réponse:', response);
          console.log('LoginComponent: Rôle dans réponse:', response.role);
          
          // Attendre un peu pour que le service stocke les données
          setTimeout(() => {
            this.redirectBasedOnRole();
          }, 100);
        },
        error: (error) => {
          console.error('LoginComponent: Erreur détaillée:', error);
          
          let errorMessage = 'Email ou mot de passe incorrect';
          
          if (error.status === 0) {
            errorMessage = 'Impossible de se connecter au serveur. Vérifiez que le backend est démarré.';
          } else if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          
          Swal.fire({
            icon: 'error',
            title: 'Erreur de connexion',
            text: errorMessage,
            timer: 3000
          });
          
          this.loading = false;
        }
      });
  }

  private redirectBasedOnRole(): void {
    console.log('LoginComponent: Redirection basée sur rôle...');
    
    // Vérifier dans plusieurs sources
    const roleFromService = this.authService.getUserRole();
    console.log('LoginComponent: Rôle depuis authService:', roleFromService);
    
    // Vérifier aussi directement dans localStorage
    const roleFromStorage = localStorage.getItem('user_role');
    console.log('LoginComponent: Rôle depuis localStorage user_role:', roleFromStorage);
    
    const currentUserFromStorage = localStorage.getItem('current_user');
    console.log('LoginComponent: current_user depuis localStorage:', currentUserFromStorage);
    
    // Décider du rôle à utiliser
    const role = roleFromService || roleFromStorage || 'UNKNOWN';
    console.log('LoginComponent: Rôle final utilisé pour redirection:', role);
    
    switch(role) {
      case 'ADMIN':
        console.log('LoginComponent: Redirection vers /admin/dashboard');
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'DOCTOR':
        console.log('LoginComponent: Redirection vers /doctor/dashboard');
        this.router.navigate(['/doctor/dashboard']);
        break;
      case 'PATIENT':
        console.log('LoginComponent: Redirection vers /patient/dashboard');
        this.router.navigate(['/patient/dashboard']);
        break;
      default:
        console.error('LoginComponent: Rôle inconnu ou null:', role);
        console.log('LoginComponent: Redirection vers /');
        this.router.navigate(['/']);
    }
  }
}