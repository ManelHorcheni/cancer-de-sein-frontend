import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { PatientService } from '../../../core/services/patient.service';
import { MedicalRecord, LabResult, Prescription } from '../../../core/models/medical-record.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-medical-info',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './medical-info.component.html',
  styleUrls: ['./medical-info.component.scss']
})
export class MedicalInfoComponent implements OnInit {
  currentUser: any;
  medicalRecords: MedicalRecord[] = [];
  labResults: LabResult[] = [];
  prescriptions: Prescription[] = [];
  loading = true;
  activeTab = 'records';

  constructor(
    private authService: AuthService,
    private patientService: PatientService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user && user.id) {
        this.loadMedicalData(user.id);
      }
    });
  }

  loadMedicalData(patientId: number): void {
    this.loading = true;

    this.patientService.getMedicalRecords(patientId).subscribe(records => {
      this.medicalRecords = records.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    });

    this.patientService.getLabResults(patientId).subscribe(results => {
      this.labResults = results.sort((a, b) => 
        new Date(b.testDate).getTime() - new Date(a.testDate).getTime()
      );
    });

    this.patientService.getPrescriptions(patientId).subscribe(prescriptions => {
      this.prescriptions = prescriptions.sort((a, b) => 
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      );
    });

    setTimeout(() => {
      this.loading = false;
    }, 1000);
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'ACTIVE': return 'bg-success';
      case 'COMPLETED': return 'bg-secondary';
      case 'STOPPED': return 'bg-danger';
      default: return 'bg-info';
    }
  }

  getStatusText(status: string): string {
    switch(status) {
      case 'ACTIVE': return 'Active';
      case 'COMPLETED': return 'Terminée';
      case 'STOPPED': return 'Arrêtée';
      default: return status;
    }
  }

  getLabStatusClass(status: string): string {
    switch(status) {
      case 'NORMAL': return 'bg-success';
      case 'ABNORMAL': return 'bg-warning';
      case 'CRITICAL': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  getLabStatusText(status: string): string {
    switch(status) {
      case 'NORMAL': return 'Normal';
      case 'ABNORMAL': return 'Anormal';
      case 'CRITICAL': return 'Critique';
      default: return status;
    }
  }

  // AJOUTEZ CETTE MÉTHODE
  getPrescriptionProgress(prescription: Prescription): number {
    const start = new Date(prescription.startDate).getTime();
    const end = new Date(prescription.endDate).getTime();
    const now = new Date().getTime();
    
    if (now >= end) return 100;
    if (now <= start) return 0;
    
    const total = end - start;
    const elapsed = now - start;
    return Math.min(100, Math.round((elapsed / total) * 100));
  }

  downloadAttachment(filename: string): void {
    Swal.fire('Info', `Téléchargement de ${filename} simulé`, 'info');
  }

  exportMedicalHistory(): void {
    Swal.fire({
      title: 'Exporter l\'historique médical',
      text: 'Voulez-vous exporter votre historique médical complet au format PDF ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Exporter',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire('Succès', 'Exportation simulée avec succès', 'success');
      }
    });
  }
}