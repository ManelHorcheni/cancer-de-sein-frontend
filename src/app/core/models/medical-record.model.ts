export interface MedicalRecord {
  id: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  date: Date;
  diagnosis: string;
  symptoms: string;
  treatment: string;
  notes: string;
  attachments?: string[];
}

export interface LabResult {
  id: number;
  patientId: number;
  testName: string;
  testDate: Date;
  result: string;
  normalRange: string;
  unit: string;
  status: 'NORMAL' | 'ABNORMAL' | 'CRITICAL';
  labName: string;
}

export interface Prescription {
  id: number;
  patientId: number;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  startDate: Date;
  endDate: Date;
  prescribedBy: string;
  status: 'ACTIVE' | 'COMPLETED' | 'STOPPED';
}

export interface Recommendation {
  id: number;
  patientId: number;
  type: 'LIFESTYLE' | 'DIET' | 'EXERCISE' | 'FOLLOWUP' | 'MEDICATION';
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdDate: Date;
  dueDate: Date;
  completed: boolean;
  source: 'AI' | 'DOCTOR' | 'SYSTEM';
}

export interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  doctorName: string;
  date: Date;
  time: string;
  duration: number; // en minutes
  reason: string;
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  location: string;
  notes?: string;
}