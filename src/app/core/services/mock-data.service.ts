import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { User, UserFormData } from '../models/user.model';
import { SystemConfig, ConfigCategory } from '../models/system-config.model';
import { Service, ServiceAccessLog } from '../models/service-access.model';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  
  // Données mockées pour les utilisateurs
  private mockUsers: User[] = [
    {
      id: 1,
      firstName: 'Admin',
      lastName: 'Système',
      email: 'admin@medinsight.com',
      role: 'ADMIN',
      phone: '+212600000000',
      address: 'Casablanca, Maroc',
      enabled: true,
      createdAt: new Date('2024-01-15'),
      lastLogin: new Date()
    },
    {
      id: 2,
      firstName: 'Dr. Jean',
      lastName: 'Martin',
      email: 'doctor@medinsight.com',
      role: 'DOCTOR',
      phone: '+212611111111',
      address: 'Rabat, Maroc',
      enabled: true,
      createdAt: new Date('2024-01-20'),
      lastLogin: new Date('2024-02-01')
    },
    {
      id: 3,
      firstName: 'Marie',
      lastName: 'Dupont',
      email: 'patient@medinsight.com',
      role: 'PATIENT',
      phone: '+212622222222',
      address: 'Marrakech, Maroc',
      enabled: true,
      createdAt: new Date('2024-01-25'),
      lastLogin: new Date('2024-01-30')
    },
    {
      id: 4,
      firstName: 'Dr. Ahmed',
      lastName: 'Benali',
      email: 'ahmed.benali@medinsight.com',
      role: 'DOCTOR',
      phone: '+212633333333',
      address: 'Fès, Maroc',
      enabled: true,
      createdAt: new Date('2024-02-01'),
      lastLogin: new Date('2024-02-02')
    },
    {
      id: 5,
      firstName: 'Fatima',
      lastName: 'Zahra',
      email: 'fatima.zahra@medinsight.com',
      role: 'PATIENT',
      phone: '+212644444444',
      address: 'Tanger, Maroc',
      enabled: false,
      createdAt: new Date('2024-01-28'),
      lastLogin: new Date('2024-01-29')
    }
  ];
  

  // Données mockées pour la configuration système
  private mockConfigs: SystemConfig[] = [
    {
      id: 1,
      key: 'app.name',
      value: 'MedInsight',
      description: 'Nom de l\'application',
      category: 'GENERAL',
      editable: true
    },
    {
      id: 2,
      key: 'security.jwt.expiration',
      value: '86400000',
      description: 'Durée de validité du token JWT (en ms)',
      category: 'SECURITY',
      editable: true
    },
    {
      id: 3,
      key: 'email.smtp.host',
      value: 'smtp.gmail.com',
      description: 'Serveur SMTP pour les emails',
      category: 'EMAIL',
      editable: true
    },
    {
      id: 4,
      key: 'ai.model.path',
      value: '/models/cancer_detection.h5',
      description: 'Chemin du modèle IA',
      category: 'AI',
      editable: false
    }
  ];

  // Données mockées pour les services
  private mockServices: Service[] = [
    {
      id: 1,
      name: 'Analyse d\'images médicales',
      description: 'Analyse IA d\'images histologiques',
      icon: 'fas fa-microscope',
      status: 'ACTIVE',
      accessLevel: 'DOCTOR_ONLY',
      usersCount: 15,
      lastAccessed: new Date()
    },
    {
      id: 2,
      name: 'Gestion des patients',
      description: 'Dossiers patients et historique',
      icon: 'fas fa-hospital-user',
      status: 'ACTIVE',
      accessLevel: 'ALL',
      usersCount: 42,
      lastAccessed: new Date('2024-02-02')
    },
    {
      id: 3,
      name: 'Dashboard Admin',
      description: 'Administration du système',
      icon: 'fas fa-cogs',
      status: 'ACTIVE',
      accessLevel: 'ADMIN_ONLY',
      usersCount: 3,
      lastAccessed: new Date()
    },
    {
      id: 4,
      name: 'Streamlit Analytics',
      description: 'Interface d\'analyse avancée',
      icon: 'fas fa-chart-line',
      status: 'MAINTENANCE',
      accessLevel: 'DOCTOR_ONLY',
      usersCount: 8,
      lastAccessed: new Date('2024-02-01')
    }
  ];

  // Méthodes pour les utilisateurs
  getUsers(): Observable<User[]> {
    return of(this.mockUsers);
  }

  getUserById(id: number): Observable<User | undefined> {
    const user = this.mockUsers.find(u => u.id === id);
    return of(user);
  }

  createUser(userData: UserFormData): Observable<User> {
    const newUser: User = {
      id: this.mockUsers.length + 1,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      role: userData.role,
      phone: userData.phone,
      address: userData.address,
      enabled: true,
      createdAt: new Date(),
      lastLogin: undefined
    };
    this.mockUsers.push(newUser);
    return of(newUser);
  }

  updateUser(id: number, userData: Partial<UserFormData>): Observable<User> {
    const index = this.mockUsers.findIndex(u => u.id === id);
    if (index !== -1) {
      this.mockUsers[index] = {
        ...this.mockUsers[index],
        ...userData
      };
      return of(this.mockUsers[index]);
    }
    return of(null as any);
  }

  deleteUser(id: number): Observable<boolean> {
    const index = this.mockUsers.findIndex(u => u.id === id);
    if (index !== -1) {
      this.mockUsers.splice(index, 1);
      return of(true);
    }
    return of(false);
  }

  toggleUserStatus(id: number): Observable<User> {
    const index = this.mockUsers.findIndex(u => u.id === id);
    if (index !== -1) {
      this.mockUsers[index].enabled = !this.mockUsers[index].enabled;
      return of(this.mockUsers[index]);
    }
    return of(null as any);
  }

  // Méthodes pour la configuration système
  getSystemConfigs(): Observable<SystemConfig[]> {
    return of(this.mockConfigs);
  }

  // Méthode pour mettre à jour une configuration
updateConfig(id: number, value: string): Observable<SystemConfig> {
  const index = this.mockConfigs.findIndex(c => c.id === id);
  if (index !== -1) {
    // Simuler un délai réseau
    return new Observable(observer => {
      setTimeout(() => {
        this.mockConfigs[index].value = value;
        observer.next(this.mockConfigs[index]);
        observer.complete();
      }, 500);
    });
  }
  return of(null as any);
}

  // Méthodes pour les services
  getServices(): Observable<Service[]> {
    return of(this.mockServices);
  }

  toggleServiceStatus(id: number): Observable<Service> {
    const index = this.mockServices.findIndex(s => s.id === id);
    if (index !== -1) {
      const currentStatus = this.mockServices[index].status;
      this.mockServices[index].status = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      return of(this.mockServices[index]);
    }
    return of(null as any);
  }

  // Statistiques
  getStatistics() {
    return of({
      totalUsers: this.mockUsers.length,
      activeUsers: this.mockUsers.filter(u => u.enabled).length,
      doctorsCount: this.mockUsers.filter(u => u.role === 'DOCTOR').length,
      patientsCount: this.mockUsers.filter(u => u.role === 'PATIENT').length,
      activeServices: this.mockServices.filter(s => s.status === 'ACTIVE').length,
      systemHealth: 'GOOD'
    });
  }

  
}