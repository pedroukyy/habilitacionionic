// src/app/services/firestore.service.ts
import { Injectable, inject } from '@angular/core';
import {
  Firestore, // Importar Firestore
  collection,
  collectionData, // Para obtener datos como observable
  doc,
  docData,        // Para obtener un documento como observable
  addDoc,
  deleteDoc,
  updateDoc,
  Timestamp,      // Para timestamps del servidor
  serverTimestamp, // Para generar timestamps del servidor
  orderBy,
  query,
  DocumentReference, // Tipo para referencias de documento
  CollectionReference // Tipo para referencias de colección
} from '@angular/fire/firestore'; // Importar desde @angular/fire/firestore
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Las interfaces Project y Attachment permanecen igual
export interface Project {
  id?: string;
  name: string;
  description: string;
  deliveryDate: string;
  status: 'active' | 'completed' | 'pending';
  location?: { lat: number; lng: number; address?: string; };
  attachments?: Attachment[];
  createdAt?: Timestamp | Date; // Puede ser Timestamp de Firestore o Date de JS
  updatedAt?: Timestamp | Date;
}

export interface Attachment {
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt?: Timestamp | Date;
  storagePath?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  private firestore: Firestore = inject(Firestore); // Inyectar el servicio Firestore v9+
  private readonly collectionName = 'projects';
  private projectsCollectionRef: CollectionReference<Project>;

  constructor() {
    console.log('[FirestoreService v9] Constructor: Iniciando servicio...');
    // Obtener la referencia a la colección
    // Especificamos el tipo <Project> para la referencia de la colección
    this.projectsCollectionRef = collection(this.firestore, this.collectionName) as CollectionReference<Project>;
    console.log('[FirestoreService v9] projectsCollectionRef inicializada.');

    // Prueba de lectura simple (opcional, para verificar que firestore está inyectado)
    // import { getDocs } from '@angular/fire/firestore';
    // const q = query(this.projectsCollectionRef, limit(1));
    // getDocs(q).then(snapshot => console.log('[FirestoreService v9] Prueba de lectura en constructor:', snapshot.docs.length))
    //           .catch(err => console.error('[FirestoreService v9] Error en prueba de lectura:', err));
  }

  // Obtener todos los proyectos con sus IDs
  getProjects(): Observable<Project[]> {
    if (!this.projectsCollectionRef) {
      console.error('[FirestoreService v9] getProjects: projectsCollectionRef no está inicializada!');
      return new Observable(observer => observer.error(new Error('projectsCollectionRef no inicializada')));
    }
    // Crear una consulta con ordenamiento
    const q = query(this.projectsCollectionRef, orderBy('createdAt', 'desc'));

    // collectionData permite obtener los datos y el ID
    return collectionData(q, { idField: 'id' }) as Observable<Project[]>;
  }

  // Obtener un proyecto por su ID
  getProjectById(id: string): Observable<Project | undefined> {
    console.log(`[FirestoreService v9] getProjectById llamado para ID: ${id}`);
    if (!this.firestore) {
      console.error(`[FirestoreService v9] getProjectById(${id}): Firestore no está disponible.`);
      return new Observable(observer => observer.error(new Error('Firestore no disponible')));
    }
    const docRef = doc(this.firestore, `${this.collectionName}/${id}`) as DocumentReference<Project>;
    return docData(docRef, { idField: 'id' }) as Observable<Project | undefined>;
  }

  // Crear un nuevo proyecto
  async addProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<DocumentReference<Project>> {
    if (!this.projectsCollectionRef) {
      console.error('[FirestoreService v9] addProject: projectsCollectionRef no está inicializada!');
      return Promise.reject(new Error('projectsCollectionRef no inicializada'));
    }
    const projectWithTimestamps = {
      ...projectData,
      createdAt: serverTimestamp(), // Usar serverTimestamp para la fecha de creación
      updatedAt: serverTimestamp()  // Usar serverTimestamp para la fecha de actualización
    };
    // addDoc no devuelve el ID directamente en la promesa, sino la referencia al documento.
    // El ID se puede obtener de la referencia si es necesario después.
    return addDoc(this.projectsCollectionRef, projectWithTimestamps);
  }

  // Actualizar un proyecto existente
  async updateProject(id: string, projectData: Partial<Project>): Promise<void> {
    if (!this.firestore) {
      console.error(`[FirestoreService v9] updateProject(${id}): Firestore no está disponible.`);
      return Promise.reject(new Error('Firestore no disponible'));
    }
    const docRef = doc(this.firestore, `${this.collectionName}/${id}`);
    const dataToUpdate = {
      ...projectData,
      updatedAt: serverTimestamp() // Actualizar el timestamp
    };
    return updateDoc(docRef, dataToUpdate);
  }

  // Eliminar un proyecto
  async deleteProject(id: string): Promise<void> {
    if (!this.firestore) {
      console.error(`[FirestoreService v9] deleteProject(${id}): Firestore no está disponible.`);
      return Promise.reject(new Error('Firestore no disponible'));
    }
    const docRef = doc(this.firestore, `${this.collectionName}/${id}`);
    return deleteDoc(docRef);
  }
}
