import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';

interface Xray {
  imageId: string; 
  image: string; 
  analysis: string;
  doctorNote: string;
  uploadDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImageUploadService {

  private apiUrl = 'http://localhost:8083/Images';

  constructor(private http: HttpClient) {}

  analyzeOnly(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/AnalyzeOnly`, formData).pipe(
      catchError(this.handleError)
    );
  }

  updateNote(imageId: string, doctorNote: string): Observable<any> {
    const url = `${this.apiUrl}/${imageId}/updateNote?doctorNote=${encodeURIComponent(doctorNote)}`;
    return this.http.put(url, null);
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Upload/Analysis Error:', error);
    return throwError(() => new Error(error.message || 'Operation failed'));
  }

  getXraysByPatientId(patientId: string | null): Observable<Xray[]> {
    if (!patientId) throw new Error('patientId is null');
    return this.http.get<Xray[]>(`${this.apiUrl}/Patient/${patientId}`);
  }

}
