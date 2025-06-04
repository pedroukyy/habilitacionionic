// src/app/services/geolocation.service.ts
import { Injectable } from '@angular/core';
import { Geolocation, Position, PermissionStatus } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core'; // Importar Capacitor

export interface Coordinates {
  lat: number;
  lng: number;
  accuracy?: number;
}

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {

  constructor() { }

  async requestPermissions(): Promise<PermissionStatus | { location: 'granted' | 'denied' | 'prompt' | 'prompt-with-rationale' }> { // Ajustar tipo para web
    if (!Capacitor.isNativePlatform()) {
      console.warn('Geolocation.requestPermissions is not fully implemented on web. Relying on browser prompt.');
      // Para web, la solicitud de permiso ocurre cuando llamas a getCurrentPosition.
      // Podemos simular un estado basado en una comprobación previa si es necesario,
      // o simplemente devolver un estado que indique que el navegador lo manejará.
      return new Promise((resolve) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            () => resolve({ location: 'granted' }), // Si tiene éxito, se concedió
            (error) => {
              if (error.code === error.PERMISSION_DENIED) {
                resolve({ location: 'denied' });
              } else {
                resolve({ location: 'prompt' }); // Otro error, podría ser un prompt
              }
            },
            { enableHighAccuracy: false, timeout: 1, maximumAge: Infinity } // Intento rápido solo para verificar permiso
          );
        } else {
          resolve({ location: 'denied' }); // No hay API de geolocalización
        }
      });
    }
    // Lógica nativa
    return Geolocation.requestPermissions();
  }

  async getCurrentPosition(): Promise<Coordinates> {
    if (!Capacitor.isNativePlatform()) {
      console.warn('Attempting to use browser geolocation for web.');
      if (navigator.geolocation) {
        return new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                accuracy: position.coords.accuracy
              });
            },
            (error) => {
              console.error('Browser geolocation error:', error);
              let message = 'Error de geolocalización del navegador.';
              switch(error.code) {
                case error.PERMISSION_DENIED:
                  message = "Permiso de geolocalización denegado por el usuario.";
                  break;
                case error.POSITION_UNAVAILABLE:
                  message = "Información de ubicación no disponible.";
                  break;
                case error.TIMEOUT:
                  message = "Se agotó el tiempo de espera para obtener la ubicación.";
                  break;
              }
              reject(new Error(message)); // Rechazar con un Error
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
          );
        });
      } else {
        throw new Error('Geolocalización no soportada en este navegador.');
      }
    }

    // Lógica nativa existente
    try {
      const permStatus = await this.requestPermissions(); // Llama a la versión actualizada
      // En nativo, permStatus tendrá la estructura de Capacitor.
      // Para simplificar, asumimos que si no lanza error aquí, el permiso fue adecuado.
      // Una comprobación más robusta sería:
      // if ((permStatus as PermissionStatus).location !== 'granted' && (permStatus as PermissionStatus).coarseLocation !== 'granted') {
      //   throw new Error('User did not grant geolocation permissions.');
      // }

      const position: Position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });
      return {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy
      };
    } catch (error: any) {
      console.error('Error getting current location (native service):', error);
      throw error; 
    }
  }
}
