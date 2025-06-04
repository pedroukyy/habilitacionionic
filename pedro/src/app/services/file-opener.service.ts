// src/app/services/file-opener.service.ts
import { Injectable } from '@angular/core';
import { FileOpener, FileOpenerOptions } from '@capacitor-community/file-opener';
import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem, WriteFileResult } from '@capacitor/filesystem';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileOpenerService {

  constructor(private http: HttpClient) {

  }

  private getMimeType(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return 'application/pdf';
      case 'doc': return 'application/msword';
      case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'xls': return 'application/vnd.ms-excel';
      case 'xlsx': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'ppt': return 'application/vnd.ms-powerpoint';
      case 'pptx': return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
      case 'txt': return 'text/plain';
      case 'jpg': case 'jpeg': return 'image/jpeg';
      case 'png': return 'image/png';
      case 'gif': return 'image/gif';
      default: return 'application/octet-stream';
    }
  }

  async openFile(fileUrl: string, originalFileName: string): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      window.open(fileUrl, '_blank');
      console.log('Opening file in browser (web platform):', fileUrl);
      return;
    }

    let writeResult: WriteFileResult | undefined = undefined;

    try {
      console.log('Attempting to download file:', fileUrl);
      const response = await firstValueFrom(this.http.get(fileUrl, { responseType: 'blob', observe: 'response' }));
      const blob = response.body;

      if (!blob) {
        throw new Error('Failed to download file: Blob is null.');
      }

      const base64Data = await this.convertBlobToBase64(blob) as string;

      writeResult = await Filesystem.writeFile({
        path: originalFileName,
        data: base64Data,
        directory: Directory.Cache,
      });
      console.log('File written to cache:', writeResult.uri);

      const fileOpenerOptions: FileOpenerOptions = {
        filePath: writeResult.uri,
        contentType: this.getMimeType(originalFileName),
        openWithDefault: true,
      };

      await FileOpener.open(fileOpenerOptions);
      console.log('FileOpener.open called successfully for:', writeResult.uri);

    } catch (error: any) {
      console.error('Error opening file:', error);
      let errorMessage = 'Error al abrir el archivo.';
      if (error.message) {
        errorMessage += ` Detalles: ${error.message}`;
      }

      if (error.message && error.message.includes('Activity not found')) {
        errorMessage = `No se encontró una aplicación para abrir este tipo de archivo (${this.getMimeType(originalFileName)}).`;
      } else if (error.message && error.message.includes('File not found')) {

        errorMessage = `Archivo no encontrado en la ruta especificada. (${writeResult?.uri || 'ruta desconocida o error previo a la escritura'})`;
      }


      if (typeof alert !== 'undefined') {
        alert(errorMessage);
      } else {
        console.warn('`alert` not available. UI Error Message:', errorMessage);
      }
      throw error;
    }
  }

  private convertBlobToBase64 = (blob: Blob): Promise<string | ArrayBuffer | null> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result); 
      };
      reader.readAsDataURL(blob);
    });
  }
}
