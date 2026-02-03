import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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
      email: ['admin@medinsight.com', [Validators.required, Validators.email]], // Valeur par défaut
      password: ['Admin123!', Validators.required] // Valeur par défaut
    });
  }

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    
    // DEBUG: Vérifier si déjà connecté
    console.log('Déjà connecté?', this.authService.isLoggedIn());
    console.log('Token:', this.authService.getToken());
    
    if (this.authService.isLoggedIn()) {
      this.redirectBasedOnRole();
    }
  }

  get f() { return this.loginForm.controls; }

  onSubmit(): void {
    this.submitted = true;

    if (this.loginForm.invalid) {
      console.log('Formulaire invalide', this.loginForm.errors);
      return;
    }

    this.loading = true;
    
    console.log('Envoi login:', {
      email: this.f['email'].value,
      password: this.f['password'].value
    });

    this.authService.login(this.f['email'].value, this.f['password'].value)
      .subscribe({
        next: (response) => {
          console.log('Login réussi, redirection...', response);
          this.redirectBasedOnRole();
        },
        error: (error) => {
          console.error('Erreur détaillée:', error);
          
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
    const role = this.authService.getUserRole();
    console.log('Rôle utilisateur:', role);
    
    switch(role) {
      case 'ADMIN':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'DOCTOR':
        this.router.navigate(['/doctor/dashboard']);
        break;
      case 'PATIENT':
        this.router.navigate(['/patient/dashboard']);
        break;
      default:
        console.log('Rôle inconnu, redirection vers /');
        this.router.navigate(['/']);
    }
  }
}