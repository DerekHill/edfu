import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable()
export class UploadService {
  constructor(private http: HttpClient) {}
  postFile(fileToUpload: File): Observable<boolean> {
    const endpoint = `${environment.apiUri}/api/upload/upload`;
    const formData: FormData = new FormData();
    formData.append('file', fileToUpload, fileToUpload.name);
    return this.http.post<any>(endpoint, formData);
  }
}