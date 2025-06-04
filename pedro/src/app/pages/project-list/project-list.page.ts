// src/app/pages/project-list/project-list.page.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe, SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import {
  LoadingController,
  AlertController,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonList,
  IonItemSliding,
  IonItem,
  IonLabel,
  IonItemOptions,
  IonItemOption,
  IonSpinner,
  IonFab,
  IonFabButton,
  IonSearchbar,
  IonSegment,
  IonSegmentButton
} from '@ionic/angular/standalone';

import { FirestoreService, Project } from '../../services/firestore.service';

// Importar addIcons y los iconos específicos
import { addIcons } from 'ionicons';
import {
  addCircleOutline,
  addOutline, // 'add' es un alias de 'add-outline' en muchos contextos, pero importamos explícitamente
  checkmarkCircleOutline,
  playCircleOutline,
  hourglassOutline,
  createOutline,
  trashOutline,
  fileTrayStackedOutline,
  gridOutline, // Para el botón de cambiar vista (opcional)
  listOutline  // Para el botón de cambiar vista (opcional)
} from 'ionicons/icons';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.page.html',
  styleUrls: ['./project-list.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule, DatePipe, SlicePipe,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent,
    IonRefresher, IonRefresherContent, IonList, IonItemSliding, IonItem, IonLabel,
    IonItemOptions, IonItemOption, IonSpinner, IonFab, IonFabButton, IonSearchbar,
    IonSegment, IonSegmentButton
  ]
})
export class ProjectListPage implements OnInit {
  public projects$: Observable<Project[]>;

  private firestoreService = inject(FirestoreService);
  private router = inject(Router);
  private loadingCtrl = inject(LoadingController);
  private alertCtrl = inject(AlertController);

  public viewMode: 'list' | 'grid' = 'list';
  public statusFilter: string = 'all';
  public searchTerm: string = '';

  constructor() {
    // Registrar iconos
    addIcons({
      addCircleOutline,
      addOutline, // Nombre del icono usado en el template es 'add'
      checkmarkCircleOutline,
      playCircleOutline,
      hourglassOutline,
      createOutline,
      trashOutline,
      fileTrayStackedOutline,
      gridOutline,
      listOutline
    });

    this.projects$ = this.firestoreService.getProjects();
  }

  ngOnInit() {}

  // ... (resto de los métodos como goToProjectForm, goToProjectDetail, deleteProject, handleRefresh, etc.)
  // Asegúrate de que los nombres de los iconos en el HTML coincidan con los importados
  // Por ejemplo, si usas <ion-icon name="add"></ion-icon>, y has importado addOutline,
  // Ionicons a menudo mapea 'add' a 'add-outline'.

  goToProjectForm(projectId?: string) {
    if (projectId) {
      this.router.navigate(['/project-form', projectId]);
    } else {
      this.router.navigate(['/project-form']);
    }
  }

  goToProjectDetail(projectId: string) {
    this.router.navigate(['/project-detail', projectId]);
  }

  toggleViewMode() {
    this.viewMode = this.viewMode === 'list' ? 'grid' : 'list';
  }

  filterByStatus(status: string) {
    this.statusFilter = status;
    this.applyFilters();
  }

  searchProjects() {
    this.applyFilters();
  }

  applyFilters() {
    this.projects$ = this.firestoreService.getProjects();
  }

  async deleteProject(projectId: string, event: Event) {
    event.stopPropagation();
    const alert = await this.alertCtrl.create({
      header: 'Confirmar Eliminación',
      message: '¿Estás seguro de que deseas eliminar este proyecto?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar', role: 'destructive',
          handler: async () => {
            const loading = await this.loadingCtrl.create({ message: 'Eliminando...' });
            await loading.present();
            try {
              // TODO: Eliminar adjuntos de Supabase
              await this.firestoreService.deleteProject(projectId);
              await loading.dismiss();
            } catch (error) {
              await loading.dismiss();
              // Mostrar error
            }
          },
        },
      ],
    });
    await alert.present();
  }

  async handleRefresh(event: any) {
    this.projects$ = this.firestoreService.getProjects();
    const sub = this.projects$.subscribe({
      next: () => {
        if (event?.target?.complete) event.target.complete();
        sub.unsubscribe();
      },
      error: () => {
        if (event?.target?.complete) event.target.complete();
        sub.unsubscribe();
      }
    });
  }

  trackById(index: number, item: Project): string | undefined {
    return item.id;
  }
}
