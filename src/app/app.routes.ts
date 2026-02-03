import { Routes } from '@angular/router';
import { LoginComponent } from './modules/auth/login/login.component';
import { AdminDashboardComponent } from './modules/admin/dashboard/admin-dashboard.component';
import { DoctorDashboardComponent } from './modules/doctor/dashboard/doctor-dashboard.component';
import { AuthGuard } from './core/guards/auth.guard';
import { RegisterComponent } from './modules/auth/register/register.component';

export const routes: Routes = [
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent }, // ← AJOUTEZ CETTE LIGNE
  { 
    path: 'admin/dashboard', 
    component: AdminDashboardComponent,
    canActivate: [AuthGuard],
    data: { role: 'ADMIN' }
  },
  { 
    path: 'doctor/dashboard', 
    component: DoctorDashboardComponent,
    canActivate: [AuthGuard],
    data: { role: 'DOCTOR' }
  },
  { path: '**', redirectTo: '/auth/login' }
];