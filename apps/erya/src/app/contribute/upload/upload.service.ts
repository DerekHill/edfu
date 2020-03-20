import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { IResponse } from '@edfu/api-interfaces';

const endpoint = `${environment.apiUri}/api/signs`;

@Injectable()
export class UploadService {
  constructor(private http: HttpClient) {}

  postFile(fileToUpload: File, oxId: string): Promise<IResponse> {
    const formData: FormData = new FormData();
    formData.append('file', fileToUpload, fileToUpload.name);
    formData.append('oxId', oxId);

    return this.http.post<IResponse>(endpoint, formData).toPromise();
  }
}
