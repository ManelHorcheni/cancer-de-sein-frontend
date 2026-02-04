import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { PatientService } from '../../../core/services/patient.service';
import { Appointment } from '../../../core/models/medical-record.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.scss']
})
export class AppointmentsComponent implements OnInit {
  currentUser: any;
  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  loading = true;
  
  // Filtres
  filterStatus: string = 'upcoming';
  
  // Nouveau rendez-vous
  newAppointment = {
    doctorId: 2,
    doctorName: 'Dr. Jean Martin',
    date: new Date(), // ← CHANGER ICI : Date au lieu de string
    time: '09:00',
    reason: '',
    location: 'Cabinet médical, 123 Rue de la Santé, Casablanca'
  };
  
  showNewForm = false;

  constructor(
    private authService: AuthService,
    private patientService: PatientService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user && user.id) {
        this.loadAppointments(user.id);
      }
    });
  }

  loadAppointments(patientId: number): void {
    this.loading = true;
    this.patientService.getAppointments(patientId).subscribe({
      next: (appointments) => {
        this.appointments = appointments.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA.getTime() - dateB.getTime();
        });
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        Swal.fire('Erreur', 'Impossible de charger les rendez-vous', 'error');
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let filtered = [...this.appointments];

    if (this.filterStatus === 'upcoming') {
      filtered = filtered.filter(app => {
        const appDate = new Date(app.date);
        appDate.setHours(0, 0, 0, 0);
        return (app.status === 'SCHEDULED' || app.status === 'CONFIRMED') && 
               appDate >= today;
      });
    } else if (this.filterStatus === 'past') {
      filtered = filtered.filter(app => {
        const appDate = new Date(app.date);
        appDate.setHours(0, 0, 0, 0);
        return app.status === 'COMPLETED' || appDate < today;
      });
    } else if (this.filterStatus === 'cancelled') {
      filtered = filtered.filter(app => app.status === 'CANCELLED');
    }

    this.filteredAppointments = filtered;
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'SCHEDULED': return 'bg-warning';
      case 'CONFIRMED': return 'bg-success';
      case 'COMPLETED': return 'bg-info';
      case 'CANCELLED': return 'bg-danger';
      case 'NO_SHOW': return 'bg-secondary';
      default: return 'bg-light text-dark';
    }
  }

  getStatusText(status: string): string {
    switch(status) {
      case 'SCHEDULED': return 'Planifié';
      case 'CONFIRMED': return 'Confirmé';
      case 'COMPLETED': return 'Terminé';
      case 'CANCELLED': return 'Annulé';
      case 'NO_SHOW': return 'Non présenté';
      default: return status;
    }
  }

  toggleNewForm(): void {
    this.showNewForm = !this.showNewForm;
    if (this.showNewForm) {
      // Définir la date par défaut (demain)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      this.newAppointment.date = tomorrow;
    }
  }

  scheduleAppointment(): void {
    if (!this.newAppointment.date || !this.newAppointment.time || !this.newAppointment.reason.trim()) {
      Swal.fire('Erreur', 'Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }

    const appointmentData: Partial<Appointment> = {
      patientId: this.currentUser.id,
      doctorId: this.newAppointment.doctorId,
      doctorName: this.newAppointment.doctorName,
      date: new Date(this.newAppointment.date), // ← S'assurer que c'est un Date
      time: this.newAppointment.time,
      reason: this.newAppointment.reason,
      location: this.newAppointment.location,
      duration: 30, // Valeur par défaut
      status: 'SCHEDULED'
    };

    this.patientService.scheduleAppointment(appointmentData).subscribe({
      next: (newAppointment) => {
        this.appointments.push(newAppointment);
        this.applyFilters();
        this.showNewForm = false;
        this.resetNewAppointmentForm();
        Swal.fire('Succès', 'Rendez-vous planifié avec succès', 'success');
      },
      error: () => {
        Swal.fire('Erreur', 'Impossible de planifier le rendez-vous', 'error');
      }
    });
  }

  resetNewAppointmentForm(): void {
    this.newAppointment = {
      doctorId: 2,
      doctorName: 'Dr. Jean Martin',
      date: new Date(), // ← CHANGER ICI
      time: '09:00',
      reason: '',
      location: 'Cabinet médical, 123 Rue de la Santé, Casablanca'
    };
  }

  cancelAppointment(appointment: Appointment): void {
    Swal.fire({
      title: 'Annuler le rendez-vous',
      html: `Voulez-vous annuler le rendez-vous avec <strong>${appointment.doctorName}</strong> 
             du <strong>${this.formatDate(appointment.date)} à ${appointment.time}</strong> ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, annuler',
      cancelButtonText: 'Non, garder',
      confirmButtonColor: '#dc3545'
    }).then((result) => {
      if (result.isConfirmed) {
        this.patientService.cancelAppointment(appointment.id).subscribe({
          next: (success) => {
            if (success) {
              appointment.status = 'CANCELLED';
              this.applyFilters();
              Swal.fire('Annulé', 'Le rendez-vous a été annulé', 'success');
            }
          },
          error: () => {
            Swal.fire('Erreur', 'Impossible d\'annuler le rendez-vous', 'error');
          }
        });
      }
    });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  isAppointmentPassed(appointment: Appointment): boolean {
    const appDateTime = new Date(appointment.date);
    return appDateTime < new Date();
  }

  // Helper pour le binding de date dans le formulaire
  getDateForInput(): string {
    const date = new Date(this.newAppointment.date);
    return date.toISOString().split('T')[0];
  }

  onDateChange(event: any): void {
    const dateString = event.target.value;
    this.newAppointment.date = new Date(dateString);
  }
}