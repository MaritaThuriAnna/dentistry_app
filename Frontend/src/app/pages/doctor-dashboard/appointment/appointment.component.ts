import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component } from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { AuthService } from '../../../services/auth.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UserCrudService } from '../../../services/user_crud.service';
import { AppointmentCalendarComponent } from "../../../components/appointment-calendar/appointment-calendar.component";

interface User {
  userId: string;
  surname: string;
  forname: string;
  email: string;
  telNr: string;
  role: string;
  profilePictureUrl: string;
}

interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  reason?: string;
  status: string
}

@Component({
  selector: 'app-appointment',
  standalone: true,
  templateUrl: './appointment.component.html',
  styleUrls: ['./appointment.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    NgIf,
    RouterLink,
    AppointmentCalendarComponent
  ]
})
export class AppointmentComponent {
  patients: User[] = [];
  doctor: User | null = null;
  appointments: Appointment[] = [];

  patient: User | null = null;

  selectedPatientId: string | null = null;
  appointmentDate: Date | null = null;
  appointmentReason: string = '';
  doctorId: string = '';
  isScheduling: boolean = false;

  constructor(private authService: AuthService, private route: ActivatedRoute, private userService: UserCrudService) { }

  ngOnInit() {
    this.doctorId = this.authService.getLoggedInUserId();

    this.userService.getAllUsers().subscribe((data) => {
      this.patients = data.filter(user => user.role === 'PATIENT');
    });

    this.userService.getUserById(this.doctorId).subscribe((doctorData) => {
      this.doctor = doctorData;
    });

    this.route.queryParams.subscribe(params => {
      if (params['schedule'] === 'true' && params['patientId']) {
        this.isScheduling = true;
        this.selectedPatientId = params['patientId'];
      }
    });

    this.userService.getDoctorsAppointments(this.doctorId).subscribe((data) => {
      this.appointments = data;
    });

    this.route.queryParams.subscribe(params => {
      if (params['schedule'] === 'true' && params['patientId']) {
        this.isScheduling = true;
        this.selectedPatientId = params['patientId'];
      }
    });

    this.fetchAppointments();
  }

  fetchAppointments() {
    this.userService.getDoctorsAppointments(this.doctorId).subscribe((data) => {
      this.appointments = data;
    });
  }

  get selectedPatientName(): string {
    const patient = this.patients.find(p => p.userId === this.selectedPatientId);
    return patient ? `${patient.forname} ${patient.surname}` : 'Unknown';
  }

  scheduleAppointment() {
    if (!this.selectedPatientId || !this.appointmentDate || !this.appointmentReason.trim()) {
      alert("Please select a patient, date, and enter a reason.");
      return;
    }

    const selectedPatient = this.patients.find(p => p.userId === this.selectedPatientId);
    if (!selectedPatient) return;

    const newAppointment = {
      patientId: selectedPatient.userId,
      patientForName: selectedPatient.forname,
      patientSurName: selectedPatient.surname,
      doctorId: this.doctorId,
      doctorForName: this.doctor?.forname,
      doctorSurName: this.doctor?.surname,
      date: this.appointmentDate.toISOString().split('T')[0],
      reason: this.appointmentReason
    };


    this.userService.createAppointment(newAppointment).subscribe({
      next: () => {
        alert('Appointment Scheduled Successfully!');
        this.isScheduling = false;
        this.clearForm();
        this.fetchAppointments();
      },
      error: (err) => {
        console.error('Error scheduling appointment:', err);
        alert('Failed to schedule appointment.');
      }
    });
  }

  clearForm() {
    this.selectedPatientId = null;
    this.appointmentDate = null;
    this.appointmentReason = '';
  }
}
