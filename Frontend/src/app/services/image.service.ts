import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  private apiUrl = `${environment.apiUrl}/images`;

  constructor(private http: HttpClient) {}

  uploadXray(file: File, patientId: string, uploadedBy: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('patientId', patientId);
    formData.append('uploadedBy', uploadedBy);

    return this.http.post(`${this.apiUrl}/upload`, formData);
  }}
