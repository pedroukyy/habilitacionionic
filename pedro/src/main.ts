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

// Firebase (usando los módulos de compatibilidad con @angular/fire)
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
// Si planeas usar otros servicios de Firebase como Auth o Storage con @angular/fire/compat:
// import { AngularFireAuthModule } from '@angular/fire/compat/auth';
// import { AngularFireStorageModule } from '@angular/fire/compat/storage';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    // Proveedor para las rutas de la aplicación
    // Habilita preloading si lo deseas para cargar módulos en segundo plano
    provideRouter(routes, withPreloading(PreloadAllModules)),

    // Proveedor para Ionic Angular Standalone
    provideIonicAngular({
      mode: 'md', // o 'ios', o déjalo para que se adapte automáticamente
      // Aquí puedes añadir más configuraciones de Ionic si es necesario
      // Ejemplo: navAnimation: myCustomAnimation,
    }),

    // Importar proveedores desde los módulos de AngularFire (modo compatibilidad)
    importProvidersFrom(
      AngularFireModule.initializeApp(environment.firebaseConfig),
      AngularFirestoreModule // Para Firestore
      // AngularFireAuthModule, // Descomenta si usas Firebase Authentication
      // AngularFireStorageModule // Descomenta si usas Firebase Storage a través de @angular/fire/compat/storage
    ),

    // Proveer HttpClient de la forma moderna para standalone
    provideHttpClient(),
    // Si tuvieras interceptores definidos con la sintaxis antigua (multi-provider para HTTP_INTERCEPTORS),
    // podrías usar withInterceptorsFromDi() aquí:
    // Ejemplo: provideHttpClient(withInterceptorsFromDi())

    // IonicRouteStrategy ya suele estar cubierto por provideIonicAngular,
    // pero si necesitas especificarlo explícitamente (generalmente no es necesario con provideIonicAngular):
    // { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
}).catch(err => console.error(err));
