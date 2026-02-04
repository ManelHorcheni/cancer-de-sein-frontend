import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { PatientService } from '../../../core/services/patient.service';
import { Recommendation, Appointment, LabResult } from '../../../core/models/medical-record.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './patient-dashboard.component.html',
  styleUrls: ['./patient-dashboard.component.scss']
})
export class PatientDashboardComponent implements OnInit {
  currentUser: any;
  stats: any = {};
  recommendations: Recommendation[] = [];
  upcomingAppointments: Appointment[] = [];
  recentLabResults: LabResult[] = [];
  loading = true;
  today: Date = new Date();

  constructor(
    private authService: AuthService,
    private patientService: PatientService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user && user.id) {
        this.loadPatientData(user.id);
      }
    });
  }

  loadPatientData(patientId: number): void {
    this.loading = true;

    // Charger les statistiques
    this.patientService.getPatientStats(patientId).subscribe(stats => {
      this.stats = stats;
    });

    // Charger les recommandations
    this.patientService.getRecommendations(patientId).subscribe(recommendations => {
      this.recommendations = recommendations.slice(0, 3); // 3 plus récentes
    });

    // Charger les rendez-vous à venir
    this.patientService.getAppointments(patientId).subscribe(appointments => {
      this.upcomingAppointments = appointments
        .filter(app => 
          (app.status === 'SCHEDULED' || app.status === 'CONFIRMED') &&
          new Date(app.date) >= new Date()
        )
        .slice(0, 2); // 2 prochains rendez-vous
    });

    // Charger les résultats de labo récents
    this.patientService.getLabResults(patientId).subscribe(results => {
      this.recentLabResults = results
        .sort((a, b) => new Date(b.testDate).getTime() - new Date(a.testDate).getTime())
        .slice(0, 2); // 2 plus récents
    });

    setTimeout(() => {
      this.loading = false;
    }, 800);
  }

  toggleRecommendationStatus(recommendation: Recommendation): void {
    this.patientService.toggleRecommendationStatus(recommendation.id).subscribe({
      next: (updatedRec) => {
        if (updatedRec) {
          recommendation.completed = updatedRec.completed;
          Swal.fire('Succès', `Recommandation ${updatedRec.completed ? 'marquée comme terminée' : 'réactivée'}`, 'success');
        }
      },
      error: () => {
        Swal.fire('Erreur', 'Impossible de mettre à jour la recommandation', 'error');
      }
    });
  }

  viewDetails(type: string): void {
    switch(type) {
      case 'medical':
        this.router.navigate(['/patient/medical-info']);
        break;
      case 'recommendations':
        this.router.navigate(['/patient/recommendations']);
        break;
      case 'appointments':
        this.router.navigate(['/patient/appointments']);
        break;
    }
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

  getStatusClass(status: string): string {
    switch(status) {
      case 'NORMAL': return 'bg-success';
      case 'ABNORMAL': return 'bg-warning';
      case 'CRITICAL': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  refresh(): void {
    if (this.currentUser && this.currentUser.id) {
      this.loading = true;
      this.loadPatientData(this.currentUser.id);
    }
  }
}