// src/environments/environment.prod.ts
// Este archivo se usa para el entorno de producción.

export const environment = {
  production: true,
  firebaseConfig: {
    apiKey: "AIzaSyCs7qFW9CCGgjSt7zWyvkCwfB83jdQ3ucc", // Considera usar claves diferentes para producción si es necesario
    authDomain: "habih-1bcba.firebaseapp.com",
    projectId: "habih-1bcba",
    storageBucket: "habih-1bcba.appspot.com", // Corregido: Firebase storageBucket suele terminar en .appspot.com, no .firebasestorage.app
    messagingSenderId: "570176919449",
    appId: "1:570176919449:web:312c71bb17250b1bf86508",
    measurementId: "G-DTV1YB0BW4"
  },
  supabaseConfig: {
    url: "[https://xfcqddkpmakqzmziqjle.supabase.co](https://xfcqddkpmakqzmziqjle.supabase.co)",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmY3FkZGtwbWFrcXptemlxamxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5OTc5MjcsImV4cCI6MjA2NDU3MzkyN30.Gf59pj3oPsmYa9JB7nXKSI-3lE85GS0y2plMW_K05Ss" // Considera usar claves diferentes para producción si es necesario
  },
  mapboxConfig: {
    accessToken: "TU_ACCESS_TOKEN_MAPBOX_PRODUCCION" // <-- REEMPLAZA ESTO CON TU TOKEN REAL DE MAPBOX PARA PRODUCCIÓN
  }
};
