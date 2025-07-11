import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NotificationService } from '../../../services/notification.service';
import { UserCrudService } from '../../../services/user_crud.service';
import { NotificationComponent } from '../../../components/notification/notification.component';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageUploadService } from '../../../services/image-upload.service';

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
    id: string;
    allergies: string[] | string;
    conditions: string[] | string;
    previousTreatments: string[] | string;
    doctorNotes?: string[] | string;
  };
}

interface Xray {
  imageId: string;
  image: string;
  analysis: string;
  doctorNote: string;
  uploadDate: string;
}

@Component({
  selector: 'app-patient-profile',
  imports: [NgIf, FormsModule, NotificationComponent, NgFor, DatePipe],
  templateUrl: './patient-profile.component.html',
  styleUrl: './patient-profile.component.css'
})
export class PatientProfileComponent implements OnInit {
  patient: Patient = {
    userId: '',
    surname: '',
    forname: '',
    email: '',
    telNr: '',
    role: 'PATIENT',
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
  };

  patientId: string | null = null;
  selectedPatientId: string | null = null;
  xrays: Xray[] = [];

  constructor(
    private userService: UserCrudService,
    private router: Router,
    private notificationService: NotificationService,
    private imageUploadService: ImageUploadService
  ) { }

  ngOnInit() {
    const storedUser = localStorage.getItem('user');
    this.patientId = storedUser ? JSON.parse(storedUser).userId : '';
    console.log('Patient ID:', this.patientId);

    if (this.patientId) {
      this.userService.getPatientWithRecord(this.patientId).subscribe((data) => {
        this.patient = {
          ...data,
          medicalRecord: data.medicalRecord || {
            id: '',
            allergies: Array.isArray(data.medicalRecord?.allergies) ? data.medicalRecord.allergies : [data.medicalRecord?.allergies || ''],
            conditions: Array.isArray(data.medicalRecord?.conditions) ? data.medicalRecord.conditions : [data.medicalRecord?.conditions || ''],
            previousTreatments: Array.isArray(data.medicalRecord?.previousTreatments) ? data.medicalRecord.previousTreatments : [data.medicalRecord?.previousTreatments || ''],
            doctorNotes: Array.isArray(data.medicalRecord?.doctorNotes) ? data.medicalRecord.doctorNotes.join(', ') : data.medicalRecord?.doctorNotes || ''
          }
        };
        console.log('Loaded patient:', this.patient);
      });

      this.imageUploadService.getXraysByPatientId(this.patientId).subscribe((data: Xray[]) => {
        this.xrays = data.map((xray: Xray) => ({
          imageId: xray.imageId,
          image: xray.image,
          analysis: xray.analysis,
          doctorNote: xray.doctorNote || '',
          uploadDate: xray.uploadDate
        }));
        console.log('Loaded X-rays:', this.xrays);
      }, (error) => {
        console.error('Error fetching X-rays:', error);
        this.notificationService.showNotification('Failed to load X-rays.', 'error');
      });
    } else {
      console.error('No patientId found in localStorage');
      this.notificationService.showNotification('Unable to load patient data. Please log in again.', 'error');
      this.router.navigate(['/login']);
    }
  }

  updatePatient() {
    const requestPayload = {
      user: {
        userId: this.patient.userId,
        surname: this.patient.surname,
        forname: this.patient.forname,
        email: this.patient.email,
        telNr: this.patient.telNr,
        role: this.patient.role,
        profilePictureUrl: this.patient.profilePictureUrl,
        gender: this.patient.gender,
        address: this.patient.address
      },
      medicalRecord: {
        allergies: Array.isArray(this.patient.medicalRecord?.allergies)
          ? this.patient.medicalRecord!.allergies
          : [this.patient.medicalRecord?.allergies || ''],
        conditions: Array.isArray(this.patient.medicalRecord?.conditions)
          ? this.patient.medicalRecord!.conditions
          : [this.patient.medicalRecord?.conditions || ''],
        previousTreatments: Array.isArray(this.patient.medicalRecord?.previousTreatments)
          ? this.patient.medicalRecord!.previousTreatments
          : [this.patient.medicalRecord?.previousTreatments || ''],
        doctorNotes: Array.isArray(this.patient.medicalRecord?.doctorNotes)
          ? this.patient.medicalRecord!.doctorNotes
          : [this.patient.medicalRecord?.doctorNotes || '']
      }
    };

    console.log('Payload to send:\n', JSON.stringify(requestPayload, null, 2));

    this.userService.updatePatientData(requestPayload).subscribe({
      next: () => {
        this.notificationService.showNotification('Patient updated successfully!', 'success');
      },
      error: () => {
        this.notificationService.showNotification('Failed to update patient. Please try again.', 'error');
      }
    });
  }
}