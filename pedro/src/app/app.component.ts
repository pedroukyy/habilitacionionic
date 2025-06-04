        // src/app/app.component.ts
        import { Component, inject } from '@angular/core';
        import { CommonModule } from '@angular/common';
        import { RouterOutlet } from '@angular/router';
        import { IonApp, IonRouterOutlet, IonIcon } from '@ionic/angular/standalone'; // Asegúrate de importar IonIcon

        // Importar addIcons y el icono específico
        import { addIcons } from 'ionicons';
        import { addOutline } from 'ionicons/icons'; // O el icono específico que estés usando como 'add'

        @Component({
          selector: 'app-root',
          templateUrl: 'app.component.html',
          styleUrls: ['app.component.scss'],
          standalone: true,
          imports: [
            CommonModule,
            RouterOutlet,
            IonApp,
            IonRouterOutlet,
            IonIcon // Importa IonIcon aquí también
          ],
        })
        export class AppComponent {
          constructor() {
            // Registrar los iconos que se usan en app.component.html
            addIcons({
              add: addOutline, // Mapea el nombre 'add' al icono importado
              // Añade otros iconos globales aquí si los usas en app.component.html
            });
          }
        }
