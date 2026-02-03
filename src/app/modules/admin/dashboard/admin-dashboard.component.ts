import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService, User } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,  // ← Ajoutez ceci pour Angular 17+
  imports: [CommonModule, FormsModule, ReactiveFormsModule],  // ← Importez les modules nécessaires
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  users: User[] = [];
  loading = true;
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  loadUsers(): void {
    this.authService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (error) => {
        Swal.fire('Erreur', 'Impossible de charger les utilisateurs', 'error');
        this.loading = false;
      }
    });
  }

  // Ajoutez ces méthodes manquantes :
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  getActiveUsers(): number {
    return this.users.filter(user => user.enabled).length;
  }

  getDoctorsCount(): number {
    return this.users.filter(user => user.role === 'DOCTOR').length;
  }

  getPatientsCount(): number {
    return this.users.filter(user => user.role === 'PATIENT').length;
  }

  toggleUserStatus(user: User): void {
    Swal.fire({
      title: 'Confirmer',
      text: `Voulez-vous ${user.enabled ? 'désactiver' : 'activer'} ${user.firstName} ${user.lastName} ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui',
      cancelButtonText: 'Non'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.toggleUserStatus(user.id).subscribe({
          next: () => {
            user.enabled = !user.enabled;
            Swal.fire('Succès', 'Statut mis à jour', 'success');
          },
          error: () => {
            Swal.fire('Erreur', 'Action impossible', 'error');
          }
        });
      }
    });
  }

  deleteUser(user: User): void {
    Swal.fire({
      title: 'Supprimer l\'utilisateur',
      text: `Êtes-vous sûr de vouloir supprimer ${user.firstName} ${user.lastName} ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Supprimer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#dc3545'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.deleteUser(user.id).subscribe({
          next: () => {
            this.users = this.users.filter(u => u.id !== user.id);
            Swal.fire('Supprimé', 'Utilisateur supprimé avec succès', 'success');
          },
          error: () => {
            Swal.fire('Erreur', 'Impossible de supprimer', 'error');
          }
        });
      }
    });
  }

  getRoleDisplayName(role: string): string {
    switch(role) {
      case 'ADMIN': return 'Administrateur';
      case 'DOCTOR': return 'Médecin';
      case 'PATIENT': return 'Patient';
      default: return role;
    }
  }
}