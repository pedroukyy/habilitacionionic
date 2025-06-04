// src/app/pages/project-detail/project-detail.page.ts
import { Component, OnInit, OnDestroy, inject, ElementRef, ViewChild, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  NavController,
  LoadingController,
  AlertController,
  ActionSheetController,
  ToastController, // Importar ToastController
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonButtons,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonChip,
  IonNote,
  IonBackButton,
  IonGrid,
  IonRow,
  IonCol,
  IonSpinner, // Importar IonSpinner
  IonRefresher, // Importar IonRefresher
  IonRefresherContent // Importar IonRefresherContent
} from '@ionic/angular/standalone';

import { FirestoreService, Project, Attachment } from '../../services/firestore.service';
import { FileOpenerService } from '../../services/file-opener.service';
import { SupabaseStorageService } from '../../services/supabase-storage.service';

import { Subscription } from 'rxjs';
import mapboxgl from 'mapbox-gl';
import { environment } from '../../../environments/environment';

import { addIcons } from 'ionicons';
import {
  createOutline, trashOutline, arrowBackOutline, documentTextOutline,
  imageOutline, documentOutline, downloadOutline, eyeOutline, mapOutline, listOutline,
  closeCircleOutline
} from 'ionicons/icons';
// import { Capacitor } from '@capacitor/core'; // No se usa directamente aquí, pero puede ser útil

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.page.html',
  styleUrls: ['./project-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule, DatePipe,
    IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel,
    IonButton, IonIcon, IonButtons, IonCard, IonCardHeader, IonCardTitle,
    IonCardSubtitle, IonCardContent, IonChip, IonNote, IonBackButton,
    IonGrid, IonRow, IonCol, IonSpinner, IonRefresher, IonRefresherContent // Añadir IonSpinner, IonRefresher, IonRefresherContent
  ]
})
export class ProjectDetailPage implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('mapDetailContainer', { static: false }) mapDetailContainer!: ElementRef;

  project: Project | null = null;
  projectId: string | null = null;
  isLoading = true;
  private routeSub!: Subscription;
  private projectSub!: Subscription;
  private map!: mapboxgl.Map;
  private marker!: mapboxgl.Marker;

  private firestoreService = inject(FirestoreService);
  private fileOpenerService = inject(FileOpenerService);
  private supabaseStorageService = inject(SupabaseStorageService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private loadingCtrl = inject(LoadingController);
  private alertCtrl = inject(AlertController);
  private actionSheetCtrl = inject(ActionSheetController);
  private toastCtrl = inject(ToastController); // <<< --- Inyección añadida
  private navCtrl = inject(NavController);
  private cdr = inject(ChangeDetectorRef);


  constructor() {
    addIcons({
      createOutline, trashOutline, arrowBackOutline, documentTextOutline,
      imageOutline, documentOutline, downloadOutline, eyeOutline, mapOutline, listOutline,
      closeCircleOutline
    });
    mapboxgl.accessToken = environment.mapboxConfig.accessToken;
  }

  ngOnInit() {
    this.routeSub = this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.projectId = id;
        this.loadProjectDetails();
      } else {
        this.isLoading = false;
        this.showErrorAndGoBack('ID de proyecto no proporcionado.');
      }
    });
  }

  ngAfterViewInit() {
    // El mapa se inicializará después de que los datos del proyecto se carguen
  }

  ngOnDestroy() {
    if (this.routeSub) this.routeSub.unsubscribe();
    if (this.projectSub) this.projectSub.unsubscribe();
    if (this.map) this.map.remove();
  }

  async loadProjectDetails() {
    this.isLoading = true;
    const loading = await this.loadingCtrl.create({ message: 'Cargando detalles del proyecto...' });
    await loading.present();

    if (this.projectSub) {
      this.projectSub.unsubscribe();
    }

    this.projectSub = this.firestoreService.getProjectById(this.projectId!).subscribe({
      next: (data) => {
        loading.dismiss();
        this.isLoading = false;
        if (data) {
          this.project = data;
          this.cdr.detectChanges();
          if (this.project.location) {
            setTimeout(() => { // Esperar que el DOM se actualice
                if (this.mapDetailContainer?.nativeElement) {
                    this.initializeDetailMap(this.project!.location!.lng, this.project!.location!.lat);
                } else {
                    console.warn('Contenedor del mapa de detalle no encontrado en AfterViewInit para el proyecto:', this.project?.name);
                }
            }, 0);
          }
        } else {
          this.showErrorAndGoBack('Proyecto no encontrado.');
        }
      },
      error: (err) => {
        loading.dismiss();
        this.isLoading = false;
        console.error('Error cargando detalles del proyecto:', err);
        this.showErrorAndGoBack('Error al cargar el proyecto.');
      }
    });
  }

  initializeDetailMap(lng: number, lat: number, zoom: number = 13) {
    if (this.map) {
      this.map.setCenter([lng, lat]);
      if (this.marker) this.marker.setLngLat([lng, lat]);
      else this.marker = new mapboxgl.Marker().setLngLat([lng, lat]).addTo(this.map);
      return;
    }

    if (!this.mapDetailContainer?.nativeElement) {
      console.warn('Map detail container not ready, retrying init...');
      setTimeout(() => this.initializeDetailMap(lng, lat, zoom), 100);
      return;
    }

    this.map = new mapboxgl.Map({
      container: this.mapDetailContainer.nativeElement,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [lng, lat],
      zoom: zoom,
      interactive: false
    });
    // this.map.addControl(new mapboxgl.NavigationControl(), 'top-right'); // Opcional para mapa no interactivo
    this.marker = new mapboxgl.Marker().setLngLat([lng, lat]).addTo(this.map);
  }

  async openAttachment(attachment: Attachment) {
    if (!attachment.url) {
      const alert = await this.alertCtrl.create({
        header: 'Error', message: 'URL del archivo no disponible.', buttons: ['OK']
      });
      await alert.present();
      return;
    }
    const loading = await this.loadingCtrl.create({ message: 'Abriendo archivo...' });
    await loading.present();
    try {
      await this.fileOpenerService.openFile(attachment.url, attachment.name);
    } catch (error) {
      console.error('Error al intentar abrir el archivo:', error);
    } finally {
      await loading.dismiss();
    }
  }

  editProject() {
    if (this.projectId) {
      this.router.navigate(['/project-form', this.projectId]);
    }
  }

  async confirmDeleteProject() {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar Eliminación',
      message: '¿Estás seguro de que deseas eliminar este proyecto y todos sus adjuntos? Esta acción no se puede deshacer.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'destructive', handler: () => this.deleteProjectAndAttachments() }
      ]
    });
    await alert.present();
  }

  async deleteProjectAndAttachments() {
    if (!this.project || !this.projectId) return;
    const loading = await this.loadingCtrl.create({ message: 'Eliminando proyecto...' });
    await loading.present();
    try {
      if (this.project.attachments && this.project.attachments.length > 0) {
        for (const attachment of this.project.attachments) {
          if (attachment.storagePath) {
            try {
              await this.supabaseStorageService.deleteFile(attachment.storagePath);
            } catch (storageError) {
              console.error(`Error deleting attachment ${attachment.name} from Supabase:`, storageError);
            }
          }
        }
      }
      await this.firestoreService.deleteProject(this.projectId);
      await this.showToast('Proyecto eliminado exitosamente.', 'success');
      this.navCtrl.navigateRoot('/project-list');
    } catch (error) {
      console.error('Error deleting project and attachments:', error);
      await this.showToast('No se pudo eliminar el proyecto.', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  async showErrorAndGoBack(message: string) {
    const alert = await this.alertCtrl.create({
      header: 'Error', message: message,
      buttons: [{ text: 'OK', handler: () => this.navCtrl.navigateRoot('/project-list') }]
    });
    await alert.present();
  }

  async showToast(message: string, color: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger' | 'light' | 'medium' | 'dark' = 'primary', duration: number = 2500) {
    const toast = await this.toastCtrl.create({ message, duration, color, position: 'top' });
    toast.present();
  }

  async handleRefresh(event: any) {
    if (this.projectId) {
      await this.loadProjectDetails(); // loadProjectDetails ya maneja el loader
    }
    if (event?.target?.complete) {
      event.target.complete();
    }
  }
}

