// src/app/services/firestore.service.ts
import { Injectable } from '@angular/core'; // 'inject' no es necesario aquí si no se usa correctamente
import { AngularFirestore, AngularFirestoreCollection, DocumentReference } from '@angular/fire/compat/firestore';
import { Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

export interface Project {
  id?: string;
  name: string;
  description: string;
  deliveryDate: string;
  status: 'active' | 'completed' | 'pending';
  location?: { lat: number; lng: number; address?: string; };
  attachments?: Attachment[];
  createdAt?: any;
  updatedAt?: any;
}

export interface Attachment {
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt?: any;
  storagePath?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  private projectsCollection!: AngularFirestoreCollection<Project>;
  private readonly collectionName = 'projects';
  private afsConstructorInstance: AngularFirestore; // Instancia inyectada en el constructor

  constructor(afs: AngularFirestore) { // AngularFirestore se inyecta aquí
    this.afsConstructorInstance = afs; // Se guarda la instancia
    console.log('[FirestoreService] Constructor: Iniciando servicio...');
    console.log('[FirestoreService] AngularFirestore instance (this.afsConstructorInstance):', this.afsConstructorInstance);

    if (!this.afsConstructorInstance) {
      console.error('[FirestoreService] ¡ERROR CRÍTICO! AngularFirestore (afsConstructorInstance) NO FUE INYECTADO CORRECTAMENTE.');
    } else {
      console.log('[FirestoreService] AngularFirestore (afsConstructorInstance) parece estar inyectado.');
      try {
        this.projectsCollection = this.afsConstructorInstance.collection<Project>(this.collectionName, ref => ref.orderBy('createdAt', 'desc'));
        console.log('[FirestoreService] projectsCollection inicializada.');
      } catch (initError) {
        console.error('[FirestoreService] ERROR al inicializar projectsCollection:', initError);
      }
    }
  }

  getProjects(): Observable<Project[]> {
    if (!this.projectsCollection) {
        console.error('[FirestoreService] getProjects: projectsCollection no está inicializada!');
        return throwError(() => new Error('projectsCollection no inicializada'));
    }
    return this.projectsCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Project;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

  /**
   * Método Corregido: getProjectById
   * Se elimina la llamada a inject() y se usa this.afsConstructorInstance
   */
  getProjectById(id: string): Observable<Project | undefined> {
    console.log(`[FirestoreService] getProjectById llamado para ID: ${id}`);

    // Se usa la instancia inyectada en el constructor (this.afsConstructorInstance)
    if (!this.afsConstructorInstance) {
      console.error(`[FirestoreService] getProjectById(${id}): afsConstructorInstance (inyectada en constructor) es null/undefined.`);
      return throwError(() => new Error('AngularFirestore (afsConstructorInstance) no está disponible en getProjectById'));
    }

    const docPath = `${this.collectionName}/${id}`;
    console.log(`[FirestoreService] getProjectById(${id}): Intentando acceder a la ruta del documento: ${docPath} usando this.afsConstructorInstance`);

    // Se usa this.afsConstructorInstance en lugar de una nueva llamada a inject()
    const docRef = this.afsConstructorInstance.doc<Project>(docPath);

    if (!docRef) {
      console.error(`[FirestoreService] getProjectById(${id}): this.afsConstructorInstance.doc(${docPath}) devolvió undefined o null.`);
      return throwError(() => new Error('Referencia de documento nula o indefinida en getProjectById'));
    }

    console.log(`[FirestoreService] getProjectById(${id}): Obtenida referencia al documento. Solicitando valueChanges...`);
    return docRef.valueChanges({ idField: 'id' }).pipe(
      tap(project => {
        console.log(`[FirestoreService] getProjectById(${id}): Datos recibidos de valueChanges:`, project);
      }),
      catchError(err => {
        console.error(`[FirestoreService] getProjectById(${id}): Error en valueChanges:`, err);
        return throwError(() => new Error(`Error obteniendo proyecto ${id}: ${err.message}`));
      })
    );
  }

  addProject(project: Project): Promise<DocumentReference<Project>> {
    if (!this.projectsCollection) {
        console.error('[FirestoreService] addProject: projectsCollection no está inicializada!');
        return Promise.reject(new Error('projectsCollection no inicializada'));
    }
    const timestamp = new Date();
    project.createdAt = timestamp;
    project.updatedAt = timestamp;
    return this.projectsCollection.add(project);
  }

  updateProject(id: string, projectData: Partial<Project>): Promise<void> {
    if (!this.projectsCollection) {
        console.error('[FirestoreService] updateProject: projectsCollection no está inicializada!');
        return Promise.reject(new Error('projectsCollection no inicializada'));
    }
    projectData.updatedAt = new Date();
    return this.projectsCollection.doc(id).update(projectData);
  }

  deleteProject(id: string): Promise<void> {
    if (!this.projectsCollection) {
        console.error('[FirestoreService] deleteProject: projectsCollection no está inicializada!');
        return Promise.reject(new Error('projectsCollection no inicializada'));
    }
    return this.projectsCollection.doc(id).delete();
  }
}
