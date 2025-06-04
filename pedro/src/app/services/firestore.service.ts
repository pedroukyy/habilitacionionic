// src/app/services/firestore.service.ts
import { Injectable, inject } from '@angular/core'; // Asegúrate de que inject esté importado
import { AngularFirestore, AngularFirestoreCollection, DocumentReference } from '@angular/fire/compat/firestore';
import { Observable, from, throwError } from 'rxjs';
import { map, take, catchError, tap } from 'rxjs/operators'; // Importar tap

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
  // Mantenemos la inyección en el constructor para la inicialización de la colección
  // y para la mayoría de los métodos.
  private afsConstructorInstance: AngularFirestore;

  constructor(afs: AngularFirestore) { // Inyectar AngularFirestore
    this.afsConstructorInstance = afs; // Guardar la instancia inyectada en el constructor
    console.log('[FirestoreService] Constructor: Iniciando servicio...');
    console.log('[FirestoreService] AngularFirestore instance (this.afsConstructorInstance):', this.afsConstructorInstance);

    if (!this.afsConstructorInstance) {
      console.error('[FirestoreService] ¡ERROR CRÍTICO! AngularFirestore (afsConstructorInstance) NO FUE INYECTADO CORRECTAMENTE.');
    } else {
      console.log('[FirestoreService] AngularFirestore (afsConstructorInstance) parece estar inyectado.');
      try {
        this.projectsCollection = this.afsConstructorInstance.collection<Project>(this.collectionName, ref => ref.orderBy('createdAt', 'desc'));
        console.log('[FirestoreService] projectsCollection inicializada.');

        // La prueba de lectura ya fue exitosa, la podemos mantener comentada.
        // console.log('[FirestoreService] Realizando prueba de lectura en el constructor a la colección "test_debug_collection"...');
        // this.afsConstructorInstance.collection('test_debug_collection').get().pipe(take(1),
        //   catchError(err => {
        //     console.error('[FirestoreService] PRUEBA DE LECTURA EN CONSTRUCTOR FALLÓ (catchError):', err);
        //     return throwError(() => new Error('Fallo en la prueba de lectura inicial de Firestore: ' + err.message));
        //   })
        // ).subscribe({
        //   next: snap => {
        //     console.log('[FirestoreService] PRUEBA DE LECTURA EN CONSTRUCTOR EXITOSA. Documentos en "test_debug_collection":', snap.docs.length);
        //   },
        //   error: err => {
        //     console.error('[FirestoreService] PRUEBA DE LECTURA EN CONSTRUCTOR FALLÓ (error callback):', err);
        //   }
        // });
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

  getProjectById(id: string): Observable<Project | undefined> {
    console.log(`[FirestoreService] getProjectById llamado para ID: ${id}`);
    try {
      // INTENTO DE SOLUCIÓN NG0203: Usar inject() DENTRO del método.
      const afsCurrentInstance = inject(AngularFirestore);
      console.log(`[FirestoreService] getProjectById(${id}): Instancia de AFS obtenida con inject():`, afsCurrentInstance);

      if (!afsCurrentInstance) {
        console.error(`[FirestoreService] getProjectById(${id}): inject(AngularFirestore) devolvió null/undefined.`);
        return throwError(() => new Error('No se pudo obtener AngularFirestore con inject() en getProjectById'));
      }

      const docPath = `${this.collectionName}/${id}`;
      console.log(`[FirestoreService] getProjectById(${id}): Intentando acceder a la ruta del documento: ${docPath} usando afsCurrentInstance`);
      const docRef = afsCurrentInstance.doc<Project>(docPath);

      if (!docRef) {
        console.error(`[FirestoreService] getProjectById(${id}): afsCurrentInstance.doc(${docPath}) devolvió undefined o null.`);
        return throwError(() => new Error('Referencia de documento nula o indefinida en getProjectById'));
      }

      console.log(`[FirestoreService] getProjectById(${id}): Obtenida referencia al documento. Solicitando valueChanges...`);
      return docRef.valueChanges({ idField: 'id' }).pipe(
        tap(project => { // Usar tap para loguear sin afectar el stream
          console.log(`[FirestoreService] getProjectById(${id}): Datos recibidos de valueChanges:`, project);
        }),
        catchError(err => {
          console.error(`[FirestoreService] getProjectById(${id}): Error en valueChanges:`, err);
          return throwError(() => new Error(`Error obteniendo proyecto ${id}: ${err.message}`));
        })
      );
    } catch (error) {
      // Este catch podría atrapar el error NG0203 si inject() falla directamente.
      console.error(`[FirestoreService] getProjectById(${id}): Error DENTRO de la función (posiblemente en inject()):`, error);
      return throwError(() => new Error(`Error crítico en getProjectById para ${id}: ${(error as Error).message}`));
    }
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
