import { Routes } from '@angular/router';
import { LoginComponent } from './modules/auth/login/login.component';
import { AdminDashboardComponent } from './modules/admin/dashboard/admin-dashboard.component';
import { DoctorDashboardComponent } from './modules/doctor/dashboard/doctor-dashboard.component';
import { AuthGuard } from './core/guards/auth.guard';
import { RegisterComponent } from './modules/auth/register/register.component';
import { UserFormComponent } from './modules/admin/users/user-form/user-form.component';
import { SystemConfigComponent } from './modules/admin/system/system-config/system-config.component';

// Import des nouveaux composants patients
import { PatientDashboardComponent } from './modules/patient/dashboard/patient-dashboard.component';
import { MedicalInfoComponent } from './modules/patient/medical-info/medical-info.component';
import { RecommendationsComponent } from './modules/patient/recommendations/recommendations.component';
import { AppointmentsComponent } from './modules/patient/appointments/appointments.component';

export const routes: Routes = [
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent }, 
  
  // Routes Admin
  {
    path: 'admin/dashboard',
    component: AdminDashboardComponent,
    data: { role: 'ADMIN' }
  }, 
  {
    path: 'admin/users/new',
    component: UserFormComponent,
    data: { role: 'ADMIN' }
  }, 
  {
    path: 'admin/users/edit/:id',
    component: UserFormComponent,
    data: { role: 'ADMIN' }
  },
  {
    path: 'admin/users',
    component: AdminDashboardComponent,
    data: { role: 'ADMIN' }
  }, 
  {
    path: 'admin/system',
    component: SystemConfigComponent,
    data: { role: 'ADMIN' }
  },
  {
    path: 'admin/services',
    component: AdminDashboardComponent,
    data: { role: 'ADMIN' }
  },
  
  // Route Doctor
  {
    path: 'doctor/dashboard',
    component: DoctorDashboardComponent,
    data: { role: 'DOCTOR' }
  }, 
  
  // Routes Patient
  {
    path: 'patient/dashboard',
    component: PatientDashboardComponent,
    data: { role: 'PATIENT' }
  },
  {
    path: 'patient/medical-info',
    component: MedicalInfoComponent,
    data: { role: 'PATIENT' }
  },
  {
    path: 'patient/recommendations',
    component: RecommendationsComponent,
    data: { role: 'PATIENT' }
  },
  {
    path: 'patient/appointments',
    component: AppointmentsComponent,
    data: { role: 'PATIENT' }
  }, 
  
  // Redirection pour les routes inconnues
  { path: '**', redirectTo: '/auth/login' }
];