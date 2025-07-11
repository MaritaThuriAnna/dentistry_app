import { Component, OnInit } from '@angular/core';
import { ImageUploadService } from '../../../services/image-upload.service';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { FormsModule } from '@angular/forms';

interface Patient {
  userId: string;
  surname: string;
  forname: string;
  email: string;
  telNr: string;
  role: string;
  profilePictureUrl: string;
}

@Component({
  selector: 'app-xray-upload',
  standalone: true,
  imports: [NgIf, NgFor, CommonModule, FormsModule],
  templateUrl: './xray-upload.component.html',
  styleUrls: ['./xray-upload.component.css']
})
export class XrayUploadComponent implements OnInit {
  selectedFile: File | null = null;
  uploadMessage = '';
  result = '';
  patients: Patient[] = [];
  patientId: string = '';
  doctorId: string = '';
  isAnalyzing = false;
  overlayImage: string = '';
  cariesTeeth: string[] = [];
  cariesAreaRatio: number = 0;
  doctorNote: string = '';
  analysisResult: string = '';
  originalImageData: string = '';
  processedImageData: string = '';
  imageId: string = '';

  constructor(
    private imageUploadService: ImageUploadService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.http.get<Patient[]>('http://localhost:8082/User/ReadAll').subscribe((data) => {
      this.patients = data.filter(user => user.role === 'PATIENT');
    });

    this.route.queryParams.subscribe(params => {
      this.patientId = params['userId'] || '';
    });

    this.doctorId = this.authService.getLoggedInUserId();
  }

  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5 MB limit
        this.uploadMessage = 'File size exceeds 5 MB limit.';
        this.selectedFile = null;
        return;
      }
      this.selectedFile = file;
      this.uploadMessage = '';
    }
  }

  analyzeImage() {
    if (!this.selectedFile || !this.patientId || !this.doctorId) {
      this.uploadMessage = 'Please select a patient and file.';
      return;
    }

    this.isAnalyzing = true;

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('patientId', this.patientId);
    formData.append('doctorId', this.doctorId);

    this.imageUploadService.analyzeOnly(formData)
      .subscribe({
        next: (response: any) => {
          console.log('Analyze Response:', response);
          this.uploadMessage = 'Analysis and save complete.';
          this.result = response.caries_teeth && response.caries_teeth.length > 0
            ? `Caries detected on: ${response.caries_teeth.join(', ')}`
            : 'No caries detected.';
          this.cariesAreaRatio = response.caries_area_ratio || 0;
          this.cariesTeeth = response.caries_teeth || [];
          this.overlayImage = 'data:image/png;base64,' + response.output_image;
          this.imageId = response.data?.imageId || response.imageId;
          this.isAnalyzing = false;
        },
        error: (err) => {
          this.uploadMessage = 'Analysis or save failed: ' + (err.message || 'Unknown error');
          this.result = '';
          this.isAnalyzing = false;
          console.error('Error:', err);
        }
      });
  }

  updateDoctorNote() {
    if (!this.doctorNote || !this.imageId) {
      this.uploadMessage = 'Please enter a doctor\'s note and ensure analysis is complete.';
      console.warn('doctorNote:', this.doctorNote, 'imageId:', this.imageId);
      return;
    }

    this.imageUploadService.updateNote(this.imageId, this.doctorNote).subscribe({
      next: (response: any) => {
        this.uploadMessage = response.message;
        console.log('Update Response:', response);
      },
      error: (err) => {
        this.uploadMessage = 'Failed to update doctor note: ' + (err.message || 'Unknown error');
        console.error('Update Error:', err);
      }
    });
  }
  resetForm() {
    this.selectedFile = null;
    this.patientId = '';
    this.doctorNote = '';
    this.uploadMessage = '';
    this.result = '';
    this.overlayImage = '';
    this.cariesTeeth = [];
    this.cariesAreaRatio = 0;

    const fileInput = document.getElementById('file') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  exitOperation() {
    this.resetForm();
  }

}