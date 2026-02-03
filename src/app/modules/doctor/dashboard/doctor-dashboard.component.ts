import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { StreamlitService } from '../../../core/services/streamlit.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,  // ← Ajoutez ceci
  imports: [CommonModule],  // ← Importez CommonModule
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['./doctor-dashboard.component.scss']
})
export class DoctorDashboardComponent implements OnInit {
  currentUser: any;
  loading = false;

  constructor(
    private authService: AuthService,
    private streamlitService: StreamlitService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  openStreamlit(): void {
    this.loading = true;
    this.streamlitService.getAccessLink().subscribe({
      next: (response) => {
        // Ouvrir Streamlit dans un nouvel onglet
        window.open(response.link, '_blank');
        this.loading = false;
      },
      error: (error) => {
        Swal.fire('Erreur', 'Impossible d\'accéder à Streamlit', 'error');
        this.loading = false;
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}