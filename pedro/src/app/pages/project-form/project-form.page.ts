import { Component, OnInit, OnDestroy, inject, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  NavController, LoadingController, AlertController, ActionSheetController, ToastController,
  IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonInput,
  IonTextarea, IonDatetime, IonDatetimeButton, IonModal, IonSelect, IonSelectOption,
  IonButton, IonIcon, IonButtons, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle,
  IonCardContent, IonChip, IonNote, IonText, IonBackButton } from '@ionic/angular/standalone';

import { FirestoreService, Project, Attachment } from '../../services/firestore.service';
import { SupabaseStorageService } from '../../services/supabase-storage.service';
import { GeolocationService, Coordinates } from '../../services/geolocation.service';
import { FileOpenerService } from '../../services/file-opener.service';

import { Subscription } from 'rxjs';
import mapboxgl from 'mapbox-gl';
import { environment } from '../../../environments/environment';

// Importar addIcons y los iconos específicos
import { addIcons } from 'ionicons';
import {
  saveOutline,
  locationOutline,
  attachOutline,
  imageOutline,
  documentTextOutline,
  documentOutline, // Icono genérico para documentos
  trashOutline,
  close // Para el botón de cancelar en action sheet
} from 'ionicons/icons';
import { Capacitor } from '@capacitor/core'; // Para verificar la plataforma

@Component({
  selector: 'app-project-form',
  templateUrl: './project-form.page.html',
  styleUrls: ['./project-form.page.scss'],
  standalone: true,
  imports: [IonBackButton,
    CommonModule, FormsModule, ReactiveFormsModule, RouterModule, DatePipe,
    IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonInput,
    IonTextarea, IonDatetime, IonDatetimeButton, IonModal, IonSelect, IonSelectOption,
    IonButton, IonIcon, IonButtons, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle,
    IonCardContent, IonChip, IonNote, IonText
  ]
})
export class ProjectFormPage implements OnInit, OnDestroy {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
  @ViewChild('htmlFileInput', { static: false }) htmlFileInputRef!: ElementRef<HTMLInputElement>;

  projectForm!: FormGroup;
  isEditMode = false;
  projectId: string | null = null;
  pageTitle = 'Nuevo Proyecto';
  currentAttachments: Attachment[] = [];
  projectLocation: Coordinates | null = null;

  private map!: mapboxgl.Map;
  private marker!: mapboxgl.Marker;
  private routeSub!: Subscription;

  private fb = inject(FormBuilder);
  private firestoreService = inject(FirestoreService);
  private supabaseStorageService = inject(SupabaseStorageService);
  private geolocationService = inject(GeolocationService);
  private fileOpenerService = inject(FileOpenerService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private loadingCtrl = inject(LoadingController);
  private alertCtrl = inject(AlertController);
  private actionSheetCtrl = inject(ActionSheetController);
  private toastCtrl = inject(ToastController);
  private navCtrl = inject(NavController);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    // Registrar iconos
    addIcons({
      saveOutline,
      locationOutline,
      attachOutline,
      imageOutline,
      documentTextOutline,
      documentOutline,
      trashOutline,
      close
    });
    mapboxgl.accessToken = environment.mapboxConfig.accessToken;
  }

  ngOnInit() {
    this.initForm();
    this.routeSub = this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.projectId = id;
        this.pageTitle = 'Editar Proyecto';
        this.loadProjectData(id);
      }
    });
  }

  ngOnDestroy() {
    if (this.routeSub) this.routeSub.unsubscribe();
    if (this.map) this.map.remove();
  }

  initForm() {
    this.projectForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      deliveryDate: [new Date().toISOString(), Validators.required],
      status: ['pending', Validators.required],
    });
  }

  async loadProjectData(id: string) {
    const loading = await this.loadingCtrl.create({ message: 'Cargando proyecto...' });
    await loading.present();
    const projectSub = this.firestoreService.getProjectById(id).subscribe({
        next: project => {
            loading.dismiss();
            if (project) {
                this.projectForm.patchValue({ // Usar patchValue para evitar errores si faltan campos
                    name: project.name,
                    description: project.description,
                    deliveryDate: project.deliveryDate,
                    status: project.status,
                });
                this.currentAttachments = project.attachments ? [...project.attachments] : [];
                if (project.location) {
                    this.projectLocation = project.location;
                    // Asegurarse de que el mapa se inicialice después de que la vista esté lista
                    setTimeout(() => {
                        if (this.mapContainer?.nativeElement) {
                           this.initializeMap(this.projectLocation!.lng, this.projectLocation!.lat);
                        }
                    }, 0);
                }
            } else {
                this.showToast('Proyecto no encontrado.', 'danger');
                this.navCtrl.back();
            }
            if (projectSub) projectSub.unsubscribe();
        },
        error: err => {
            loading.dismiss();
            console.error('Error loading project data:', err);
            this.showToast('Error al cargar el proyecto.', 'danger');
            if (projectSub) projectSub.unsubscribe();
        }
    });
  }

  initializeMap(lng: number = -74.0721, lat: number = 4.7110, zoom: number = 10) {
    if (this.map) {
      this.map.setCenter([lng, lat]);
      if (this.marker) {
        this.marker.setLngLat([lng, lat]);
      } else {
        this.marker = new mapboxgl.Marker().setLngLat([lng, lat]).addTo(this.map);
      }
      return;
    }
    if (!this.mapContainer?.nativeElement) {
      // Reintentar si el contenedor no está listo, común si está dentro de un *ngIf
      setTimeout(() => this.initializeMap(lng, lat, zoom), 150);
      return;
    }
    this.map = new mapboxgl.Map({
      container: this.mapContainer.nativeElement,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [lng, lat],
      zoom: zoom
    });
    this.map.addControl(new mapboxgl.NavigationControl());
    this.marker = new mapboxgl.Marker({ draggable: true }).setLngLat([lng, lat]).addTo(this.map);
    this.marker.on('dragend', () => {
      const lngLat = this.marker.getLngLat();
      this.projectLocation = { lat: lngLat.lat, lng: lngLat.lng };
      this.projectForm.markAsDirty();
      this.cdr.detectChanges();
    });
    this.map.on('click', (e) => {
      const lngLat = e.lngLat;
      this.marker.setLngLat(lngLat);
      this.projectLocation = { lat: lngLat.lat, lng: lngLat.lng };
      this.projectForm.markAsDirty();
      this.cdr.detectChanges();
    });
  }


  async getCurrentLocation() {
    const loading = await this.loadingCtrl.create({ message: 'Obteniendo ubicación...' });
    await loading.present();

    if (!Capacitor.isNativePlatform() && navigator.geolocation) {
        // Web Geolocation
        navigator.geolocation.getCurrentPosition(
          (position) => {
            loading.dismiss();
            const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
            this.projectLocation = coords;
            if (!this.map) this.initializeMap(coords.lng, coords.lat, 15);
            else {
                this.map.setCenter([coords.lng, coords.lat]);
                this.map.setZoom(15);
                this.marker.setLngLat([coords.lng, coords.lat]);
            }
            this.projectForm.markAsDirty();
            this.cdr.detectChanges();
            this.showToast('Ubicación obtenida (web).', 'success');
          },
          (error) => {
            loading.dismiss();
            console.error('Error con geolocalización web:', error);
            this.showToast(`Error geolocalización web: ${error.message}`, 'danger');
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      return;
    } else if (!Capacitor.isNativePlatform()) {
        loading.dismiss();
        this.showToast('Geolocalización no soportada en este navegador.', 'danger');
        return;
    }

    // Native Geolocation
    try {
      const coordinates = await this.geolocationService.getCurrentPosition();
      this.projectLocation = { lat: coordinates.lat, lng: coordinates.lng };
      if (!this.map) this.initializeMap(coordinates.lng, coordinates.lat, 15);
      else {
        this.map.setCenter([coordinates.lng, coordinates.lat]);
        this.map.setZoom(15);
        this.marker.setLngLat([coordinates.lng, coordinates.lat]);
      }
      this.projectForm.markAsDirty();
      this.cdr.detectChanges();
      loading.dismiss();
      this.showToast('Ubicación obtenida.', 'success');
    } catch (error: any) {
      loading.dismiss();
      console.error('Error getting current location (native):', error);
      this.showToast(error.message || 'No se pudo obtener la ubicación.', 'danger');
    }
  }

  triggerHtmlFileSelect() {
    if (this.htmlFileInputRef?.nativeElement) {
        this.htmlFileInputRef.nativeElement.click();
    } else {
        console.error('htmlFileInputRef no está disponible');
        this.showToast('Error al intentar seleccionar archivos.', 'danger');
    }
  }

  async handleHtmlFileInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files.length > 0) {
      const filesToProcess: File[] = Array.from(inputElement.files);
      await this.uploadFiles(filesToProcess);
      inputElement.value = ''; // Limpiar para permitir seleccionar el mismo archivo de nuevo
    }
  }

  async uploadFiles(files: File[]) {
    if (!files || files.length === 0) {
      return;
    }
    const loading = await this.loadingCtrl.create({ message: `Subiendo ${files.length} archivo(s)...` });
    await loading.present();
    try {
      for (const file of files) {
        const attachment = await this.supabaseStorageService.uploadFile(file, this.projectId || undefined);
        this.currentAttachments.push(attachment);
      }
      this.projectForm.markAsDirty();
      loading.dismiss();
      this.showToast(`${files.length} archivo(s) subido(s) exitosamente.`, 'success');
    } catch (error) {
      loading.dismiss();
      console.error('Error uploading files:', error);
      this.showToast('Error al subir uno o más archivos.', 'danger');
    }
  }

  async confirmRemoveAttachment(index: number, event: Event) {
    event.stopPropagation();
    const attachmentToRemove = this.currentAttachments[index];
    const actionSheet = await this.actionSheetCtrl.create({
      header: `¿Eliminar "${attachmentToRemove.name}"?`,
      buttons: [{
        text: 'Eliminar Adjunto', role: 'destructive', icon: 'trash',
        handler: async () => {
          const loading = await this.loadingCtrl.create({ message: 'Eliminando adjunto...' });
          await loading.present();
          try {
            if (attachmentToRemove.storagePath) {
              await this.supabaseStorageService.deleteFile(attachmentToRemove.storagePath);
            }
            this.currentAttachments.splice(index, 1);
            this.projectForm.markAsDirty();
            loading.dismiss();
            this.showToast('Adjunto eliminado.', 'success');
          } catch (error) {
            loading.dismiss();
            console.error('Error deleting attachment:', error);
            this.showToast('Error al eliminar el adjunto.', 'danger');
          }
        }
      }, { text: 'Cancelar', role: 'cancel', icon: 'close' }]
    });
    await actionSheet.present();
  }

  async openAttachment(attachment: Attachment, event: Event) {
    event.stopPropagation();
    if (!attachment.url) {
      this.showToast('URL del archivo no disponible.', 'warning'); return;
    }
    try {
      await this.fileOpenerService.openFile(attachment.url, attachment.name);
    } catch (error) {
      console.error('Error al intentar abrir el archivo:', error);
      // El servicio fileOpenerService ya debería mostrar un alert si es necesario
    }
  }

  async saveProject() {
    if (this.projectForm.invalid) {
      this.showToast('Por favor, completa todos los campos requeridos.', 'warning');
      this.projectForm.markAllAsTouched(); return;
    }
    const loading = await this.loadingCtrl.create({
      message: this.isEditMode ? 'Actualizando proyecto...' : 'Guardando proyecto...'
    });
    await loading.present();
    const formData = this.projectForm.value;
    const projectData: Project = {
      // id: this.projectId || undefined, // El ID se maneja por Firestore o se pasa en update
      name: formData.name, description: formData.description,
      deliveryDate: formData.deliveryDate, status: formData.status,
      attachments: this.currentAttachments, location: this.projectLocation || undefined,
    };
    try {
      if (this.isEditMode && this.projectId) {
        await this.firestoreService.updateProject(this.projectId, projectData);
        this.showToast('Proyecto actualizado.', 'success');
      } else {
        const newProjectRef = await this.firestoreService.addProject(projectData);
        // Opcional: this.projectId = newProjectRef.id; si necesitas el ID inmediatamente
        this.showToast('Proyecto creado.', 'success');
      }
      loading.dismiss();
      this.projectForm.reset({ status: 'pending', deliveryDate: new Date().toISOString() }); // Resetear con valores por defecto
      this.currentAttachments = [];
      this.projectLocation = null;
      if (this.map && this.marker) {
          this.marker.remove();
          // this.marker = null; // Podrías necesitar re-crear el marcador si el mapa persiste
      }
      // Considera no remover el mapa si quieres que persista para el siguiente nuevo proyecto
      // if (this.map) { this.map.remove(); this.map = null; }
      this.navCtrl.navigateBack('/project-list');
    } catch (error) {
      loading.dismiss();
      console.error('Error saving project:', error);
      this.showToast('Error al guardar el proyecto.', 'danger');
    }
  }

  async showToast(message: string, color: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger' | 'light' | 'medium' | 'dark' = 'primary', duration: number = 2500) {
    const toast = await this.toastCtrl.create({ message, duration, color, position: 'top' });
    toast.present();
  }

  get formattedDeliveryDate() {
    const dateValue = this.projectForm.get('deliveryDate')?.value;
    return dateValue ? new DatePipe('en-US').transform(dateValue, 'mediumDate') : 'Seleccionar fecha';
  }

  confirmDate(event: any) {
    const dateValue = event.detail.value;
    this.projectForm.get('deliveryDate')?.setValue(dateValue);
    // Intenta cerrar el modal de fecha si está abierto
    const modal = event.target.closest('ion-modal');
    if (modal) {
      modal.dismiss();
    }
  }

  cancelDateChanges(event?: any) {
    const modal = event?.target?.closest('ion-modal') || document.querySelector('ion-modal.datetime-modal');
    if (modal) {
      (modal as HTMLIonModalElement).dismiss();
    }
  }
}
