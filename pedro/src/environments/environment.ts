// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.


/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
// src/environments/environment.ts
// Este archivo se usa para el entorno de desarrollo.

export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: "AIzaSyCs7qFW9CCGgjSt7zWyvkCwfB83jdQ3ucc",
    authDomain: "habih-1bcba.firebaseapp.com",
    projectId: "habih-1bcba",
    storageBucket: "habih-1bcba.appspot.com", // Corregido: Firebase storageBucket suele terminar en .appspot.com, no .firebasestorage.app
    messagingSenderId: "570176919449",
    appId: "1:570176919449:web:312c71bb17250b1bf86508",
    measurementId: "G-DTV1YB0BW4"
  },
  supabaseConfig: {
    url: "https://xfcqddkpmakqzmziqjle.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmY3FkZGtwbWFrcXptemlxamxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5OTc5MjcsImV4cCI6MjA2NDU3MzkyN30.Gf59pj3oPsmYa9JB7nXKSI-3lE85GS0y2plMW_K05Ss"
  },
  mapboxConfig: {
    accessToken: "pk.eyJ1IjoicGVkcm91c2t5IiwiYSI6ImNtYmhnb2sxYjBhNnUyb3B0Nm5hNjh6ZXgifQ.vPCiv5G6V95iqZNOZlGpGw" // <-- REEMPLAZA ESTO CON TU TOKEN REAL DE MAPBOX
  }
};
