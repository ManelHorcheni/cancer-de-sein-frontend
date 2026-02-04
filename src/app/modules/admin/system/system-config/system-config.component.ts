import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { MockDataService } from '../../../../core/services/mock-data.service';
import { SystemConfig } from '../../../../core/models/system-config.model';

@Component({
  selector: 'app-system-config',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './system-config.component.html',
  styleUrls: ['./system-config.component.css']
})
export class SystemConfigComponent implements OnInit {

  configurations: SystemConfig[] = [];
  loading = true;
  saving = false;
  searchTerm = '';
  selectedCategory: string = 'ALL';
  today: Date = new Date();
  
  // Catégories de configuration
  categories = [
    { id: 'ALL', name: 'Toutes', icon: 'fas fa-list', color: 'primary' },
    { id: 'GENERAL', name: 'Général', icon: 'fas fa-cog', color: 'info' },
    { id: 'SECURITY', name: 'Sécurité', icon: 'fas fa-shield-alt', color: 'warning' },
    { id: 'EMAIL', name: 'Email', icon: 'fas fa-envelope', color: 'success' },
    { id: 'DATABASE', name: 'Base de données', icon: 'fas fa-database', color: 'secondary' },
    { id: 'AI', name: 'Intelligence Artificielle', icon: 'fas fa-robot', color: 'danger' }
  ];

  // Formulaire pour les nouvelles configurations
  newConfigForm: FormGroup;
  showNewConfigForm = false;

  constructor(
    private mockDataService: MockDataService,
    private fb: FormBuilder
  ) {
    this.newConfigForm = this.fb.group({
      key: ['', []],
      value: ['', []],
      description: ['', []],
      category: ['GENERAL', []]
    });
  }

  ngOnInit(): void {
    this.loadConfigurations();
  }

  loadConfigurations(): void {
    this.loading = true;
    this.mockDataService.getSystemConfigs().subscribe({
      next: (configs) => {
        this.configurations = configs;
        this.loading = false;
      },
      error: () => {
        Swal.fire('Erreur', 'Impossible de charger les configurations', 'error');
        this.loading = false;
      }
    });
  }

  // Filtrer les configurations par catégorie et recherche
  get filteredConfigs(): SystemConfig[] {
    return this.configurations.filter(config => {
      const matchesCategory = this.selectedCategory === 'ALL' || config.category === this.selectedCategory;
      const matchesSearch = !this.searchTerm || 
        config.key.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        config.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }

  // Compter les configurations par catégorie
  getConfigCount(category: string): number {
    if (category === 'ALL') return this.configurations.length;
    return this.configurations.filter(c => c.category === category).length;
  }

  // Sauvegarder une configuration
  saveConfig(config: SystemConfig): void {
    this.saving = true;
    
    this.mockDataService.updateConfig(config.id, config.value).subscribe({
      next: (updatedConfig) => {
        if (updatedConfig) {
          Swal.fire({
            icon: 'success',
            title: 'Sauvegardé !',
            text: `La configuration "${config.key}" a été mise à jour`,
            timer: 1500,
            showConfirmButton: false
          });
        }
        this.saving = false;
      },
      error: () => {
        Swal.fire('Erreur', 'Impossible de sauvegarder la configuration', 'error');
        this.saving = false;
      }
    });
  }

  // Réinitialiser une configuration
  resetConfig(config: SystemConfig): void {
    Swal.fire({
      title: 'Réinitialiser',
      text: `Voulez-vous réinitialiser "${config.key}" à sa valeur par défaut ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, réinitialiser',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        // Valeurs par défaut (simulées)
        const defaults: { [key: string]: string } = {
          'app.name': 'MedInsight',
          'security.jwt.expiration': '86400000',
          'email.smtp.host': 'smtp.gmail.com',
          'ai.model.path': '/models/cancer_detection.h5'
        };

        config.value = defaults[config.key] || '';
        this.saveConfig(config);
      }
    });
  }

  // Ajouter une nouvelle configuration
  addNewConfig(): void {
    if (this.newConfigForm.invalid) {
      Swal.fire('Erreur', 'Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }

    const formValue = this.newConfigForm.value;
    
    // Simuler l'ajout (dans un vrai backend, ce serait une requête POST)
    const newConfig: SystemConfig = {
      id: this.configurations.length + 1,
      key: formValue.key,
      value: formValue.value,
      description: formValue.description,
      category: formValue.category,
      editable: true
    };

    this.configurations.push(newConfig);
    
    Swal.fire({
      icon: 'success',
      title: 'Ajouté !',
      text: 'Nouvelle configuration ajoutée',
      timer: 1500,
      showConfirmButton: false
    });

    this.newConfigForm.reset({
      category: 'GENERAL'
    });
    this.showNewConfigForm = false;
  }

  // Supprimer une configuration
  deleteConfig(config: SystemConfig): void {
    if (!config.editable) {
      Swal.fire('Information', 'Cette configuration ne peut pas être supprimée', 'info');
      return;
    }

    Swal.fire({
      title: 'Supprimer',
      text: `Voulez-vous supprimer la configuration "${config.key}" ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#dc3545'
    }).then((result) => {
      if (result.isConfirmed) {
        this.configurations = this.configurations.filter(c => c.id !== config.id);
        Swal.fire('Supprimé !', 'Configuration supprimée avec succès', 'success');
      }
    });
  }

  // Exporter les configurations
  exportConfigs(): void {
    const dataStr = JSON.stringify(this.configurations, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `medinsight-config-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    Swal.fire({
      icon: 'success',
      title: 'Exporté !',
      text: 'Les configurations ont été exportées',
      timer: 1500,
      showConfirmButton: false
    });
  }

  // Importer des configurations
  importConfigs(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const importedConfigs = JSON.parse(e.target.result);
        // Validation basique
        if (Array.isArray(importedConfigs)) {
          this.configurations = [...this.configurations, ...importedConfigs];
          Swal.fire('Importé !', 'Configurations importées avec succès', 'success');
        } else {
          Swal.fire('Erreur', 'Format de fichier invalide', 'error');
        }
      } catch (error) {
        Swal.fire('Erreur', 'Impossible de lire le fichier', 'error');
      }
    };
    reader.readAsText(file);
    
    // Réinitialiser l'input file
    event.target.value = '';
  }

  // Obtenir l'icône de catégorie
  getCategoryIcon(category: string): string {
    const cat = this.categories.find(c => c.id === category);
    return cat ? cat.icon : 'fas fa-cog';
  }

  // Obtenir la couleur de catégorie
  getCategoryColor(category: string): string {
    const cat = this.categories.find(c => c.id === category);
    return cat ? `badge bg-${cat.color}` : 'badge bg-secondary';
  }

  // Obtenir le nom de catégorie
  getCategoryName(category: string): string {
    const cat = this.categories.find(c => c.id === category);
    return cat ? cat.name : category;
  }
}