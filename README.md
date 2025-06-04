# 📱 Habilitación Mobile


Habilitación Mobile es una aplicación móvil desarrollada con Ionic 7 y Angular, diseñada para gestionar proyectos de manera eficiente. La aplicación permite crear, editar, visualizar y eliminar proyectos, integrando funcionalidades como geolocalización, gestión de archivos y visualización de mapas.


🚀 Funcionalidades Principales
CRUD de Proyectos:

-Crear, editar y eliminar proyectos con campos como nombre, descripción, fecha de entrega y estado (activo/finalizado).

-Adjuntar archivos (PDF, Word, imágenes) mediante un selector de archivos HTML.

-Registrar ubicación utilizando Geolocation y mostrarla en Mapbox.

-Listar proyectos en vista de lista (filtros por estado o fecha y vista en cuadrícula pendientes).

-Mostrar detalles del proyecto, incluyendo información básica, lista de adjuntos y ubicación en un mapa.


*Gestión de Archivos:

-Subir archivos a Supabase Storage y guardar la URL en Firestore.

-Abrir archivos con aplicaciones externas mediante descarga temporal.


*Integración con Mapbox:

Mostrar un mapa interactivo al crear/editar un proyecto.

Guardar las coordenadas (latitud/longitud) en Firestore y mostrarlas en la vista de detalle.

Extras (Opcionales):

Búsqueda por nombre o descripción (pendiente).


🛠️ Tecnologías Utilizadas
Frontend:

Ionic 7

Angular

Plugins de Capacitor:

@capacitor/geolocation (integrado y funcional)

@capacitor-community/file-opener (integrado y funcional)

@capacitor/file-picker (se implementó un workaround funcional con input HTML estándar debido a problemas de instalación del plugin)


Mapas:

Mapbox GL JS (integrado en formulario y vista de detalle)


Backend:

Firestore (base de datos para proyectos y metadatos, CRUD funcional)

Supabase Storage (almacenamiento de archivos adjuntos, subida y eliminación funcionales)



📦 Instalación
Clonar el repositorio:

bash
Copiar
Editar
git clone https://github.com/pedroukyy/habilitacionionic.git
cd habilitacionionic
Instalar dependencias:

bash
Copiar
Editar
npm install
Configurar variables de entorno:

Crea un archivo src/environments/environment.ts con las siguientes variables:

typescript
Copiar
Editar
export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: 'TU_API_KEY',
    authDomain: 'TU_AUTH_DOMAIN',
    projectId: 'TU_PROJECT_ID',
    storageBucket: 'TU_STORAGE_BUCKET',
    messagingSenderId: 'TU_MESSAGING_SENDER_ID',
    appId: 'TU_APP_ID',
  },
  supabaseUrl: 'TU_SUPABASE_URL',
  supabaseKey: 'TU_SUPABASE_KEY',
  mapboxToken: 'TU_MAPBOX_TOKEN',
};


Ejecutar la aplicación:

bash
Copiar
Editar
ionic serve




📌 Estado Actual

CRUD de Proyectos: ✅ Mayormente completado.

Gestión de Archivos: ✅ Mayormente completado.

Geolocalización y Mapas: ✅ Funcionalidad base implementada.

 Vista en Cuadrícula: implementado

Búsqueda: ⏳ Pendiente.

📝 Licencia
Este proyecto está bajo la Licencia MIT. Consulta el archivo LICENSE para más detalles.

