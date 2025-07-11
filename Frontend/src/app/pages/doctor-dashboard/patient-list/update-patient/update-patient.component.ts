import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserCrudService } from '../../../../services/user_crud.service';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../../services/notification.service';
import { NotificationComponent } from "../../../../components/notification/notification.component";

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
    doctorNotes?: string;
  }
}

@Component({
  selector: 'app-update-patient',
  standalone: true,
  imports: [RouterLink, NgIf, FormsModule, NotificationComponent],
  templateUrl: './update-patient.component.html',
  styleUrl: './update-patient.component.css'
})
export class UpdatePatientComponent {
  patientId!: string;
  selectedPatientId: string | null = null;


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
    }
  };


  constructor(
    private route: ActivatedRoute,
    private userService: UserCrudService,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
    this.patientId = this.route.snapshot.paramMap.get('id')!;
    console.log(this.patientId);

    this.userService.getPatientWithRecord(this.patientId).subscribe((data) => {
      this.patient = {
        ...data,
        medicalRecord: data.medicalRecord || {
          id: '',
          allergies: '',
          conditions: [],
          previousTreatments: [],
          doctorNotes: []
        }
      };

      console.log('Loaded patient:', this.patient);
    });
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

    console.log("Payload to send:\n", JSON.stringify(requestPayload, null, 2));

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