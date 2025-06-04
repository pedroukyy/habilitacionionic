
import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { Attachment } from './firestore.service';

@Injectable({
  providedIn: 'root'
})
export class SupabaseStorageService {
  private supabase: SupabaseClient;
  private bucketName = 'project-attachments';

  constructor() {
    this.supabase = createClient(environment.supabaseConfig.url, environment.supabaseConfig.anonKey);
  }

  async uploadFile(file: File, projectId?: string): Promise<Attachment> {
    const fileName = `${file.name}`;
    const filePath = projectId
      ? `${projectId}/${new Date().getTime()}_${fileName}`
      : `general/${new Date().getTime()}_${fileName}`;

    try {
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error uploading file to Supabase:', error);
        throw error;
      }

      if (data) {

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
          type: file.type || 'application/octet-stream',
          size: Math.round(file.size / 1024),

          uploadedAt: new Date(), 
          storagePath: data.path
        };
      } else {
        throw new Error('Upload to Supabase returned no data.');
      }
    } catch (err) {
      console.error('Supabase upload error:', err);
      throw err;
    }
  }

  async deleteFile(storagePath: string): Promise<any> {

    try {
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .remove([storagePath]);

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
