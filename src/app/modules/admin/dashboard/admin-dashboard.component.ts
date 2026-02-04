import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService, User } from '../../../core/services/auth.service';
import Swal from 'sweetalert2';
import { Service } from '../../../core/models/service-access.model';
import { MockDataService } from '../../../core/services/mock-data.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {

  // Ajoutez cette propriété
  today: Date = new Date();

  // Statistiques
  statistics = {
    totalUsers: 0,
    activeUsers: 0,
    doctorsCount: 0,
    patientsCount: 0,
    activeServices: 0,
    systemHealth: 'GOOD'
  };

  // Données récentes
  recentUsers: User[] = [];
  recentServices: Service[] = [];

  // Chargement - UNE SEULE VARIABLE
  loading = true;

  // Liste complète des utilisateurs (pour compatibilité)
  users: User[] = [];
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private mockDataService: MockDataService
  ) {}

  ngOnInit(): void {
    this.loadAllData();
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  loadAllData(): void {
    this.loading = true;

    // 1. Charger les statistiques
    this.mockDataService.getStatistics().subscribe(stats => {
      this.statistics = stats;
    });

    // 2. Charger les utilisateurs récents
    this.mockDataService.getUsers().subscribe(users => {
      this.users = users; // Liste complète
      this.recentUsers = users.slice(0, 5); // 5 plus récents
    });

    // 3. Charger les services
    this.mockDataService.getServices().subscribe(services => {
      this.recentServices = services.slice(0, 3);
    });

    // Simuler un temps de chargement
    setTimeout(() => {
      this.loading = false;
    }, 1000);
  }

  refreshDashboard(): void {
    this.loading = true;
    setTimeout(() => {
      this.loadAllData();
    }, 500);
  }

  getHealthClass(): string {
    switch(this.statistics.systemHealth) {
      case 'GOOD': return 'bg-success';
      case 'WARNING': return 'bg-warning';
      case 'CRITICAL': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  getHealthText(): string {
    switch(this.statistics.systemHealth) {
      case 'GOOD': return 'Bon état';
      case 'WARNING': return 'Attention';
      case 'CRITICAL': return 'Critique';
      default: return 'Inconnu';
    }
  }

  // Méthodes pour la liste des utilisateurs (compatibilité)
  getActiveUsers(): number {
    return this.users.filter(user => user.enabled).length;
  }

  getDoctorsCount(): number {
    return this.users.filter(user => user.role === 'DOCTOR').length;
  }

  getPatientsCount(): number {
    return this.users.filter(user => user.role === 'PATIENT').length;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
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
        this.mockDataService.toggleUserStatus(user.id).subscribe({
          next: (updatedUser) => {
            if (updatedUser) {
              user.enabled = updatedUser.enabled;
              Swal.fire('Succès', 'Statut mis à jour', 'success');
              this.loadAllData(); // Recharger les données
            }
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
        this.mockDataService.deleteUser(user.id).subscribe({
          next: (success) => {
            if (success) {
              this.users = this.users.filter(u => u.id !== user.id);
              this.recentUsers = this.recentUsers.filter(u => u.id !== user.id);
              Swal.fire('Supprimé', 'Utilisateur supprimé avec succès', 'success');
              this.loadAllData(); // Recharger les données
            }
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