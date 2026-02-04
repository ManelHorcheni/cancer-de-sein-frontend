import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MedicalRecord, LabResult, Prescription, Recommendation, Appointment } from '../models/medical-record.model';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  // Données mockées pour les dossiers médicaux
  private medicalRecords: MedicalRecord[] = [
    {
      id: 1,
      patientId: 3,
      patientName: 'Marie Dupont',
      doctorId: 2,
      doctorName: 'Dr. Jean Martin',
      date: new Date('2024-01-10'),
      diagnosis: 'Hypertension artérielle grade 1',
      symptoms: 'Maux de tête, vertiges occasionnels',
      treatment: 'Mesure tensionnelle régulière, régime pauvre en sel',
      notes: 'Patient à surveiller mensuellement',
      attachments: ['tension_janvier.pdf', 'ecg_janvier.png']
    },
    {
      id: 2,
      patientId: 3,
      patientName: 'Marie Dupont',
      doctorId: 2,
      doctorName: 'Dr. Jean Martin',
      date: new Date('2024-02-15'),
      diagnosis: 'Contrôle annuel - Bon état général',
      symptoms: 'Aucun symptôme rapporté',
      treatment: 'Continuer le suivi régulier',
      notes: 'Prise de sang recommandée pour prochaine visite'
    }
  ];

  // Données mockées pour résultats de labo
  private labResults: LabResult[] = [
    {
      id: 1,
      patientId: 3,
      testName: 'Glycémie à jeun',
      testDate: new Date('2024-02-01'),
      result: '5.2',
      normalRange: '4.0 - 6.1',
      unit: 'mmol/L',
      status: 'NORMAL',
      labName: 'Laboratoire Central'
    },
    {
      id: 2,
      patientId: 3,
      testName: 'Cholestérol total',
      testDate: new Date('2024-02-01'),
      result: '5.8',
      normalRange: '< 5.2',
      unit: 'mmol/L',
      status: 'ABNORMAL',
      labName: 'Laboratoire Central'
    },
    {
      id: 3,
      patientId: 3,
      testName: 'Créatinine',
      testDate: new Date('2024-02-01'),
      result: '85',
      normalRange: '50 - 110',
      unit: 'μmol/L',
      status: 'NORMAL',
      labName: 'Laboratoire Central'
    }
  ];

  // Données mockées pour prescriptions
  private prescriptions: Prescription[] = [
    {
      id: 1,
      patientId: 3,
      medication: 'Amlodipine 5mg',
      dosage: '1 comprimé',
      frequency: 'Une fois par jour',
      duration: '30 jours',
      startDate: new Date('2024-01-10'),
      endDate: new Date('2024-02-10'),
      prescribedBy: 'Dr. Jean Martin',
      status: 'COMPLETED'
    },
    {
      id: 2,
      patientId: 3,
      medication: 'Atorvastatine 20mg',
      dosage: '1 comprimé',
      frequency: 'Le soir',
      duration: '90 jours',
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-04-30'),
      prescribedBy: 'Dr. Jean Martin',
      status: 'ACTIVE'
    }
  ];

  // Données mockées pour recommandations
  private recommendations: Recommendation[] = [
  {
    id: 1,
    patientId: 3,
    type: 'DIET',
    title: 'Réduction apport en sel',
    description: 'Limiter la consommation de sel à moins de 5g par jour. Éviter les plats préparés et les charcuteries.',
    priority: 'HIGH',
    createdDate: new Date('2024-02-15'),
    dueDate: new Date('2024-03-15'), // ← AJOUTER une date d'échéance
    completed: false,
    source: 'DOCTOR'
  },
  {
    id: 2,
    patientId: 3,
    type: 'EXERCISE',
    title: 'Activité physique régulière',
    description: '30 minutes de marche rapide 5 fois par semaine pour améliorer la santé cardiovasculaire.',
    priority: 'MEDIUM',
    createdDate: new Date('2024-02-15'),
    dueDate: new Date('2024-03-30'), // ← AJOUTER une date d'échéance
    completed: false,
    source: 'AI'
  },
  {
    id: 3,
    patientId: 3,
    type: 'FOLLOWUP',
    title: 'Contrôle tensionnel mensuel',
    description: 'Mesurer la tension artérielle tous les matins et noter les résultats dans l\'application.',
    priority: 'HIGH',
    createdDate: new Date('2024-02-15'),
    dueDate: new Date('2024-03-15'), // ← AJOUTER une date d'échéance
    completed: true,
    source: 'DOCTOR'
  },
  {
    id: 4,
    patientId: 3,
    type: 'LIFESTYLE',
    title: 'Réduction stress',
    description: 'Pratiquer 10 minutes de méditation quotidienne pour réduire le stress et améliorer la tension.',
    priority: 'LOW',
    createdDate: new Date('2024-02-16'),
    dueDate: new Date('2024-04-16'), // ← AJOUTER une date d'échéance
    completed: false,
    source: 'AI'
  }
];

  // Données mockées pour rendez-vous
  private appointments: Appointment[] = [
    {
      id: 1,
      patientId: 3,
      doctorId: 2,
      doctorName: 'Dr. Jean Martin',
      date: new Date('2024-03-15'),
      time: '10:30',
      duration: 30,
      reason: 'Contrôle trimestriel hypertension',
      status: 'SCHEDULED',
      location: 'Cabinet médical, 123 Rue de la Santé, Casablanca',
      notes: 'Apporter les résultats de prise de sang'
    },
    {
      id: 2,
      patientId: 3,
      doctorId: 4,
      doctorName: 'Dr. Ahmed Benali',
      date: new Date('2024-02-20'),
      time: '14:00',
      duration: 45,
      reason: 'Consultation cardiologie',
      status: 'COMPLETED',
      location: 'Hôpital Ibn Rochd, Casablanca',
      notes: 'Échographie cardiaque prévue'
    }
  ];

  // Méthodes pour les dossiers médicaux
  getMedicalRecords(patientId: number): Observable<MedicalRecord[]> {
    return of(this.medicalRecords.filter(record => record.patientId === patientId));
  }

  getMedicalRecordById(id: number): Observable<MedicalRecord | undefined> {
    return of(this.medicalRecords.find(record => record.id === id));
  }

  // Méthodes pour résultats de labo
  getLabResults(patientId: number): Observable<LabResult[]> {
    return of(this.labResults.filter(result => result.patientId === patientId));
  }

  // Méthodes pour prescriptions
  getPrescriptions(patientId: number): Observable<Prescription[]> {
    return of(this.prescriptions.filter(prescription => prescription.patientId === patientId));
  }

  // Méthodes pour recommandations
  getRecommendations(patientId: number): Observable<Recommendation[]> {
    return of(this.recommendations.filter(rec => rec.patientId === patientId));
  }

  toggleRecommendationStatus(id: number): Observable<Recommendation> {
    const index = this.recommendations.findIndex(rec => rec.id === id);
    if (index !== -1) {
      this.recommendations[index].completed = !this.recommendations[index].completed;
      return of(this.recommendations[index]);
    }
    return of(null as any);
  }

  // Méthodes pour rendez-vous
  getAppointments(patientId: number): Observable<Appointment[]> {
    return of(this.appointments.filter(app => app.patientId === patientId));
  }

  scheduleAppointment(appointmentData: Partial<Appointment>): Observable<Appointment> {
    const newAppointment: Appointment = {
      id: this.appointments.length + 1,
      patientId: appointmentData.patientId || 3,
      doctorId: appointmentData.doctorId || 2,
      doctorName: appointmentData.doctorName || 'Dr. Jean Martin',
      date: appointmentData.date || new Date(),
      time: appointmentData.time || '09:00',
      duration: appointmentData.duration || 30,
      reason: appointmentData.reason || 'Consultation générale',
      status: 'SCHEDULED',
      location: appointmentData.location || 'Cabinet médical',
      notes: appointmentData.notes
    };
    this.appointments.push(newAppointment);
    return of(newAppointment);
  }

  cancelAppointment(id: number): Observable<boolean> {
    const index = this.appointments.findIndex(app => app.id === id);
    if (index !== -1) {
      this.appointments[index].status = 'CANCELLED';
      return of(true);
    }
    return of(false);
  }

  // Statistiques patient
  getPatientStats(patientId: number): Observable<any> {
    const patientRecommendations = this.recommendations.filter(r => r.patientId === patientId);
    const patientAppointments = this.appointments.filter(a => a.patientId === patientId);
    
    return of({
      totalRecords: this.medicalRecords.filter(r => r.patientId === patientId).length,
      pendingRecommendations: patientRecommendations.filter(r => !r.completed).length,
      upcomingAppointments: patientAppointments.filter(a => 
        a.status === 'SCHEDULED' || a.status === 'CONFIRMED'
      ).length,
      abnormalResults: this.labResults.filter(r => 
        r.patientId === patientId && r.status !== 'NORMAL'
      ).length,
      activePrescriptions: this.prescriptions.filter(p => 
        p.patientId === patientId && p.status === 'ACTIVE'
      ).length
    });
  }
}