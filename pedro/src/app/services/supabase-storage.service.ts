  // src/app/services/supabase-storage.service.ts
    import { Injectable } from '@angular/core';
    import { createClient, SupabaseClient, PostgrestError } from '@supabase/supabase-js';
    import { environment } from '../../environments/environment';
    import { Attachment } from './firestore.service'; // Importa la interfaz Attachment

    @Injectable({
      providedIn: 'root'
    })
    export class SupabaseStorageService {
      private supabase: SupabaseClient;
      private bucketName = 'project-attachments'; // El nombre del bucket que creaste en Supabase

      constructor() {
        this.supabase = createClient(environment.supabaseConfig.url, environment.supabaseConfig.anonKey);
      }

      /**
       * Sube un archivo a Supabase Storage.
       * @param file El archivo a subir.
       * @param projectId El ID del proyecto para organizar los archivos (opcional pero recomendado).
       * @returns Promise<Attachment> Información del archivo subido.
       */
      async uploadFile(file: File, projectId?: string): Promise<Attachment> {
        const fileName = `${file.name}`;
        // Crea una ruta única para el archivo, por ejemplo, usando el ID del proyecto y un timestamp
        // Esto ayuda a evitar colisiones de nombres y organiza los archivos.
        const filePath = projectId
          ? `${projectId}/${new Date().getTime()}_${fileName}`
          : `general/${new Date().getTime()}_${fileName}`;

        try {
          const { data, error } = await this.supabase.storage
            .from(this.bucketName)
            .upload(filePath, file, {
              cacheControl: '3600', // Control de caché en segundos (opcional)
              upsert: false // No sobrescribir si ya existe (puedes cambiar a true si lo necesitas)
            });

          if (error) {
            console.error('Error uploading file to Supabase:', error);
            throw error;
          }

          if (data) {
            // Obtener la URL pública del archivo subido
            const { data: publicUrlData } = this.supabase.storage
              .from(this.bucketName)
              .getPublicUrl(data.path);

            if (!publicUrlData || !publicUrlData.publicUrl) {
                throw new Error('Could not get public URL for uploaded file.');
            }

            console.log('File uploaded successfully:', data);
            console.log('Public URL:', publicUrlData.publicUrl);

            return {
              name: fileName,
              url: publicUrlData.publicUrl,
              type: file.type || 'application/octet-stream', // Tipo MIME del archivo
              size: Math.round(file.size / 1024), // Tamaño en KB
              uploadedAt: new Date().toISOString(),
              storagePath: data.path // Guardamos la ruta completa para poder borrarlo después
            };
          } else {
            throw new Error('Upload to Supabase returned no data.');
          }
        } catch (err) {
          console.error('Supabase upload error:', err);
          throw err; // Re-lanza el error para que el componente lo maneje
        }
      }

      /**
       * Elimina un archivo de Supabase Storage.
       * @param storagePath La ruta completa del archivo en Supabase Storage (ej: 'projectId/timestamp_filename.pdf').
       * @returns Promise<any>
       */
      async deleteFile(storagePath: string): Promise<any> {
        try {
          const { data, error } = await this.supabase.storage
            .from(this.bucketName)
            .remove([storagePath]); // remove espera un array de rutas

          if (error) {
            console.error('Error deleting file from Supabase:', error);
            throw error;
          }
          console.log('File deleted successfully from Supabase:', data);
          return data;
        } catch (err) {
          console.error('Supabase delete error:', err);
          throw err;
        }
      }
    }
