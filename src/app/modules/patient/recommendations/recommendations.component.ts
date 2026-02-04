import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { PatientService } from '../../../core/services/patient.service';
import { Recommendation } from '../../../core/models/medical-record.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-recommendations',
  standalone: true,
  imports: [CommonModule,FormsModule, RouterModule],
  templateUrl: './recommendations.component.html',
  styleUrls: ['./recommendations.component.scss']
})
export class RecommendationsComponent implements OnInit {
  currentUser: any;
  recommendations: Recommendation[] = [];
  filteredRecommendations: Recommendation[] = [];
  loading = true;
  
  // Filtres
  filterType: string = 'all';
  filterPriority: string = 'all';
  filterSource: string = 'all';
  
  // Statistiques
  stats = {
    total: 0,
    pending: 0,
    completed: 0,
    urgent: 0,
    fromAI: 0,
    fromDoctor: 0
  };

  constructor(
    private authService: AuthService,
    private patientService: PatientService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user && user.id) {
        this.loadRecommendations(user.id);
      }
    });
  }

  loadRecommendations(patientId: number): void {
    this.loading = true;
    this.patientService.getRecommendations(patientId).subscribe({
      next: (recommendations) => {
        this.recommendations = recommendations.sort((a, b) => 
          new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
        );
        this.calculateStats();
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        Swal.fire('Erreur', 'Impossible de charger les recommandations', 'error');
        this.loading = false;
      }
    });
  }

  calculateStats(): void {
    this.stats = {
      total: this.recommendations.length,
      pending: this.recommendations.filter(r => !r.completed).length,
      completed: this.recommendations.filter(r => r.completed).length,
      urgent: this.recommendations.filter(r => r.priority === 'URGENT' && !r.completed).length,
      fromAI: this.recommendations.filter(r => r.source === 'AI').length,
      fromDoctor: this.recommendations.filter(r => r.source === 'DOCTOR').length
    };
  }

  applyFilters(): void {
    let filtered = [...this.recommendations];

    // Filtre par statut
    if (this.filterType === 'pending') {
      filtered = filtered.filter(r => !r.completed);
    } else if (this.filterType === 'completed') {
      filtered = filtered.filter(r => r.completed);
    }

    // Filtre par priorité
    if (this.filterPriority !== 'all') {
      filtered = filtered.filter(r => r.priority === this.filterPriority.toUpperCase());
    }

    // Filtre par source
    if (this.filterSource !== 'all') {
      filtered = filtered.filter(r => 
        r.source === this.filterSource.toUpperCase()
      );
    }

    this.filteredRecommendations = filtered;
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  resetFilters(): void {
    this.filterType = 'all';
    this.filterPriority = 'all';
    this.filterSource = 'all';
    this.applyFilters();
  }

  toggleRecommendationStatus(recommendation: Recommendation): void {
    this.patientService.toggleRecommendationStatus(recommendation.id).subscribe({
      next: (updatedRec) => {
        if (updatedRec) {
          recommendation.completed = updatedRec.completed;
          this.calculateStats();
          this.applyFilters();
          Swal.fire('Succès', `Recommandation ${updatedRec.completed ? 'marquée comme terminée' : 'réactivée'}`, 'success');
        }
      },
      error: () => {
        Swal.fire('Erreur', 'Impossible de mettre à jour la recommandation', 'error');
      }
    });
  }

  markAllAsCompleted(): void {
    Swal.fire({
      title: 'Tout marquer comme terminé',
      text: 'Voulez-vous marquer toutes les recommandations en attente comme terminées ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, tout terminer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        const pendingRecs = this.recommendations.filter(r => !r.completed);
        let completedCount = 0;
        
        pendingRecs.forEach(rec => {
          this.patientService.toggleRecommendationStatus(rec.id).subscribe({
            next: () => {
              rec.completed = true;
              completedCount++;
              if (completedCount === pendingRecs.length) {
                this.calculateStats();
                this.applyFilters();
                Swal.fire('Succès', `${completedCount} recommandations marquées comme terminées`, 'success');
              }
            }
          });
        });
      }
    });
  }

  getPriorityClass(priority: string): string {
    switch(priority) {
      case 'URGENT': return 'bg-danger';
      case 'HIGH': return 'bg-warning';
      case 'MEDIUM': return 'bg-info';
      case 'LOW': return 'bg-secondary';
      default: return 'bg-light text-dark';
    }
  }

  getPriorityText(priority: string): string {
    switch(priority) {
      case 'URGENT': return 'Urgent';
      case 'HIGH': return 'Élevée';
      case 'MEDIUM': return 'Moyenne';
      case 'LOW': return 'Faible';
      default: return priority;
    }
  }

  getTypeText(type: string): string {
    switch(type) {
      case 'DIET': return 'Régime alimentaire';
      case 'EXERCISE': return 'Activité physique';
      case 'LIFESTYLE': return 'Mode de vie';
      case 'FOLLOWUP': return 'Suivi médical';
      case 'MEDICATION': return 'Médication';
      default: return type;
    }
  }

  getTypeIcon(type: string): string {
    switch(type) {
      case 'DIET': return 'fas fa-apple-alt';
      case 'EXERCISE': return 'fas fa-running';
      case 'LIFESTYLE': return 'fas fa-heart';
      case 'FOLLOWUP': return 'fas fa-calendar-check';
      case 'MEDICATION': return 'fas fa-pills';
      default: return 'fas fa-list-check';
    }
  }

  getDaysRemaining(dueDate: Date): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  getDueDateClass(dueDate: Date): string {
    const daysRemaining = this.getDaysRemaining(dueDate);
    if (daysRemaining < 0) return 'text-danger';
    if (daysRemaining <= 3) return 'text-warning';
    if (daysRemaining <= 7) return 'text-info';
    return 'text-muted';
  }
}