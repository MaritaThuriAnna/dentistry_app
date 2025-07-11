import { NgFor, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, NgModule, OnInit } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { ActivatedRoute, RouterLink, RouterOutlet } from '@angular/router';
import { UserCrudService } from '../../../../services/user_crud.service';

interface Patient {
  userId: string;
  surname: string;
  forname: string;
  email: string;
  telNr: string;
  role: string;
  profilePictureUrl: string;
  gender?: string;
  address?: string;
  medicalRecord?: {
    id: string
    allergies: string[];
    conditions: string[];
    previousTreatments: string[],
    doctorNotes?: string
  };
  appointments?: { 
    date: string; 
    type: string; 
    status: string 
  }[];
  xrayRecords?: { 
    imageId: string; 
    image: string; 
    analysis: string;
    doctorNote: string;
    uploadDate: string;
  }[];
}
  

@Component({
  selector: 'app-patient-details',
  imports: [RouterLink, NgFor, FormsModule, NgIf],
  standalone: true,
  templateUrl: './patient-details.component.html',
  styleUrl: './patient-details.component.css'
})
export class PatientDetailsComponent implements OnInit {
  patientId!: string;
  patient: Patient = {
    userId: '',
    surname: '',
    forname: '',
    email: '',
    telNr: '',
    role: '',
    profilePictureUrl: '',
    gender: '',
    address: '',
    medicalRecord: {
      id: '',
      allergies: [],
      conditions: [],
      previousTreatments: [],
      doctorNotes: ''
    },
    appointments: [],
    xrayRecords: []
   
  };

  constructor(
    private route: ActivatedRoute, 
    private userService: UserCrudService,
    private http: HttpClient) {}


  ngOnInit() {
    this.patientId = this.route.snapshot.paramMap.get('id')!;

    this.userService.getPatientWithRecord(this.patientId).subscribe((data) => {
      this.patient = {
        ...data,
        medicalRecord: data.medicalRecord || {
          id: '',
          allergies: [],
          conditions: [],
          previousTreatments: [],
          doctorNotes: ''
        }
      };

      this.http.get<any[]>(`http://localhost:8083/Images/Patient/${this.patientId}`).subscribe((images) => {
        this.patient.xrayRecords = images.map(image => ({
          imageId: image.imageId,
          image: image.image,
          analysis: image.analysis || 'No analysis available',
          doctorNote: image.doctorNote,
          uploadDate: image.uploadDate
        }));
        console.log('Loaded patient with X-rays:', this.patient);
      }, (error) => {
        console.error('Error fetching X-ray records:', error);
      });
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
}