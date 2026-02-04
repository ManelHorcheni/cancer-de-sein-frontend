import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { MockDataService } from '../../../../core/services/mock-data.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css']
})
export class UserFormComponent implements OnInit {
  
  userForm: FormGroup;
  isEditMode = false;
  userId: number | null = null;
  loading = false;
  
  // Options pour les rôles
  roles = [
    { value: 'ADMIN', label: 'Administrateur' },
    { value: 'DOCTOR', label: 'Médecin' },
    { value: 'PATIENT', label: 'Patient' }
  ];

  constructor(
    private fb: FormBuilder,
    private mockDataService: MockDataService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.userForm = this.createForm();
  }

  ngOnInit(): void {
    // Vérifier si on est en mode édition
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.userId = +params['id'];
        this.loadUserData(this.userId);
      }
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', this.isEditMode ? [] : [Validators.required]],
      role: ['PATIENT', Validators.required],
      phone: [''],
      address: ['']
    }, { validators: this.passwordMatchValidator });
  }

  // Validateur pour vérifier que les mots de passe correspondent
  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    
    if (password !== confirmPassword) {
      formGroup.get('confirmPassword')?.setErrors({ mismatch: true });
      return { mismatch: true };
    } else {
      formGroup.get('confirmPassword')?.setErrors(null);
      return null;
    }
  }

  loadUserData(id: number): void {
    this.loading = true;
    this.mockDataService.getUserById(id).subscribe({
      next: (user) => {
        if (user) {
          this.userForm.patchValue({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            phone: user.phone || '',
            address: user.address || ''
          });
          
          // En mode édition, les champs mot de passe ne sont pas obligatoires
          this.userForm.get('password')?.clearValidators();
          this.userForm.get('confirmPassword')?.clearValidators();
          this.userForm.get('password')?.updateValueAndValidity();
          this.userForm.get('confirmPassword')?.updateValueAndValidity();
        }
        this.loading = false;
      },
      error: () => {
        Swal.fire('Erreur', 'Impossible de charger les données de l\'utilisateur', 'error');
        this.loading = false;
        this.router.navigate(['/admin/dashboard']);
      }
    });
  }

  get f() {
    return this.userForm.controls;
  }

  onSubmit(): void {
    // Marquer tous les champs comme touchés pour afficher les erreurs
    this.userForm.markAllAsTouched();

    if (this.userForm.invalid) {
      Swal.fire('Erreur', 'Veuillez corriger les erreurs dans le formulaire', 'error');
      return;
    }

    // Vérifier la correspondance des mots de passe
    if (this.userForm.hasError('mismatch')) {
      Swal.fire('Erreur', 'Les mots de passe ne correspondent pas', 'error');
      return;
    }

    this.loading = true;

    const formData = {
      firstName: this.f['firstName'].value,
      lastName: this.f['lastName'].value,
      email: this.f['email'].value,
      password: this.f['password'].value || '', // Peut être vide en mode édition
      role: this.f['role'].value,
      phone: this.f['phone'].value || undefined,
      address: this.f['address'].value || undefined
    };

    if (this.isEditMode && this.userId) {
      // Mode édition
      this.mockDataService.updateUser(this.userId, formData).subscribe({
        next: (updatedUser) => {
          if (updatedUser) {
            Swal.fire({
              icon: 'success',
              title: 'Succès !',
              text: 'Utilisateur mis à jour avec succès',
              timer: 2000
            }).then(() => {
              this.router.navigate(['/admin/dashboard']);
            });
          }
          this.loading = false;
        },
        error: () => {
          Swal.fire('Erreur', 'Impossible de mettre à jour l\'utilisateur', 'error');
          this.loading = false;
        }
      });
    } else {
      // Mode création
      this.mockDataService.createUser(formData).subscribe({
        next: (newUser) => {
          Swal.fire({
            icon: 'success',
            title: 'Succès !',
            text: 'Utilisateur créé avec succès',
            timer: 2000
          }).then(() => {
            this.router.navigate(['/admin/dashboard']);
          });
          this.loading = false;
        },
        error: () => {
          Swal.fire('Erreur', 'Impossible de créer l\'utilisateur', 'error');
          this.loading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/dashboard']);
  }

  getTitle(): string {
    return this.isEditMode ? 'Modifier un utilisateur' : 'Créer un nouvel utilisateur';
  }

  getButtonText(): string {
    return this.isEditMode ? 'Mettre à jour' : 'Créer l\'utilisateur';
  }
}