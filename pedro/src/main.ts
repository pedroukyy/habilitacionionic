// src/main.ts
import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

// Importa provideHttpClient para la configuración moderna de HttpClient
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

// Firebase v9+ Modular Imports
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
// Si planeas usar otros servicios de Firebase como Auth o Storage con la API modular:
// import { getAuth, provideAuth } from '@angular/fire/auth';
// import { getStorage, provideStorage } from '@angular/fire/storage';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    // Proveedor para las rutas de la aplicación
    provideRouter(routes, withPreloading(PreloadAllModules)),

    // Proveedor para Ionic Angular Standalone
    provideIonicAngular({
      mode: 'md',
    }),

    // Proveedores para Firebase v9+ Modular API
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideFirestore(() => getFirestore()),
    // provideAuth(() => getAuth()), // Descomenta si usas Firebase Authentication v9+
    // provideStorage(() => getStorage()), // Descomenta si usas Firebase Storage v9+

    // Proveer HttpClient de la forma moderna para standalone
    provideHttpClient(),

    // { provide: RouteReuseStrategy, useClass: IonicRouteStrategy } // Generalmente cubierto por provideIonicAngular
  ],
}).catch(err => {
  console.error("Error durante el bootstrap de la aplicación:", err);
});
