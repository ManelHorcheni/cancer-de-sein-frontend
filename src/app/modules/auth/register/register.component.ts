import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  //styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  loading = false;
  submitted = false;
  roles = [
    { value: 'PATIENT', label: 'Patient' },
    { value: 'DOCTOR', label: 'Médecin' },
    { value: 'ADMIN', label: 'Administrateur' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.registerForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      role: ['PATIENT', Validators.required],
      phone: [''],
      address: ['']
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {}

  // Validateur personnalisé pour vérifier que les mots de passe correspondent
  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  get f() { return this.registerForm.controls; }

  onSubmit(): void {
    this.submitted = true;

    if (this.registerForm.invalid) {
      return;
    }

    // Vérifier que les mots de passe correspondent
    if (this.registerForm.hasError('mismatch')) {
      Swal.fire('Erreur', 'Les mots de passe ne correspondent pas', 'error');
      return;
    }

    this.loading = true;

    // Préparer les données pour l'API
    const registerData = {
      firstName: this.f['firstName'].value,
      lastName: this.f['lastName'].value,
      email: this.f['email'].value,
      password: this.f['password'].value,
      role: this.f['role'].value,
      phone: this.f['phone'].value,
      address: this.f['address'].value
    };

    this.authService.register(registerData).subscribe({
      next: (response) => {
        Swal.fire({
          icon: 'success',
          title: 'Inscription réussie !',
          text: 'Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.',
          timer: 3000
        }).then(() => {
          // Rediriger vers la page de login
          this.router.navigate(['/auth/login']);
        });
      },
      error: (error) => {
        let errorMessage = 'Une erreur est survenue lors de l\'inscription';
        
        if (error.status === 400 && error.error) {
          errorMessage = error.error.message || errorMessage;
        } else if (error.status === 409) {
          errorMessage = 'Cet email est déjà utilisé';
        }
        
        Swal.fire('Erreur', errorMessage, 'error');
        this.loading = false;
      }
    });
  }
}