import { DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { UserCrudService } from '../../services/user_crud.service';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';

interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  reason?: string;
  status: string;
}

interface User {
  userId: string;
  surname: string;
  forname: string;
  email: string;
  telNr: string;
  role: string;
  profilePictureUrl: string;
}

@Component({
  selector: 'app-appointment-calendar',
  imports: [NgFor, NgIf, DatePipe, FormsModule],
  templateUrl: './appointment-calendar.component.html',
  styleUrl: './appointment-calendar.component.css'
})
export class AppointmentCalendarComponent implements OnInit {
  @Input() appointments: Appointment[] = [];
  @Output() appointmentDeclined = new EventEmitter<string>();

  @Input() doctor: User | null = null;
  @Input() patients: User[] = [];

  @Input() patient: User | null = null;
  @Input() doctors: User[] = [];

  currentMonth: Date = new Date();
  daysInMonth: Date[] = [];
  selectedDateAppointments: Appointment[] = [];
  showModal: boolean = false;
  selectedDate: string = '';

  loggedInUserRole: string = '';

  constructor(
    private userService: UserCrudService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
    this.generateCalendar();
    this.loggedInUserRole = this.authService.getLoggedInUserRole();

    this.userService.getAllUsers().subscribe((users) => {
      this.doctors = users.filter(user => user.role === 'DENTIST');
    });

    this.userService.getAllUsers().subscribe((users) => {
      this.patients = users.filter(user => user.role === 'PATIENT');
    });

  }

  get currentMonthYear(): string {
    return this.currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  }

  generateCalendar() {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    const date = new Date(year, month, 1);
    this.daysInMonth = [];

    while (date.getMonth() === month) {
      this.daysInMonth.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
  }

  hasAppointment(day: Date): boolean {
    const filteredAppointments = this.loggedInUserRole === 'DENTIST'
      ? this.appointments.filter(appointment => appointment.status !== 'CANCELLED')
      : this.appointments;

    return filteredAppointments.some(appointment => {
      const appointmentDate = new Date(appointment.date).toLocaleDateString('en-CA');
      const calendarDate = day.toLocaleDateString('en-CA');
      return appointmentDate === calendarDate;
    });
  }

getAppointmentsForDay(day: Date): Appointment[] {
  const filteredAppointments = this.loggedInUserRole === 'DENTIST'
    ? this.appointments.filter(appointment => appointment.status !== 'CANCELLED')
    : this.appointments;

  const targetDate = day.toLocaleDateString('en-CA');
  console.log('🔍 Checking appointments for date:', targetDate);
  console.log('📋 Available appointments:', filteredAppointments);

  return filteredAppointments
    .filter(appointment => {
      const appointmentDate = new Date(appointment.date).toLocaleDateString('en-CA');
      return appointmentDate === targetDate;
    })
    .map(appointment => {
      const doctor = this.doctors.find(d => d.userId === appointment.doctorId);
      const patient = this.patients.find(p => p.userId === appointment.patientId);

      console.log('📌 Resolving doctor for appointment:', appointment.doctorId, '=>', doctor);
      console.log('📌 Resolving patient for appointment:', appointment.patientId, '=>', patient);

      return {
        ...appointment,
        doctorForName: doctor?.forname || 'Unknown',
        doctorSurName: doctor?.surname || 'Unknown',
        patientForName: patient?.forname || 'Unknown',
        patientSurName: patient?.surname || 'Unknown'
      };
    });
}


  openAppointments(day: Date) {
    this.selectedDate = day.toISOString().split('T')[0];
    this.selectedDateAppointments = this.getAppointmentsForDay(day);

    if (this.selectedDateAppointments.length > 0) {
      this.showModal = true;
    }
  }


  isEditableAppointment(appointmentDate: string): boolean {
    const appointment = new Date(appointmentDate);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    appointment.setHours(0, 0, 0, 0);
    return appointment >= today;
  }

  prevMonth() {
    this.currentMonth.setMonth(this.currentMonth.getMonth() - 1);
    this.generateCalendar();
  }

  nextMonth() {
    this.currentMonth.setMonth(this.currentMonth.getMonth() + 1);
    this.generateCalendar();
  }

  acceptAppointment(appointmentId: string) {
    this.userService.confirmAppointment(appointmentId).subscribe({
      next: () => {
        this.notificationService.showNotification('Appointment Accepted!', 'success');
        const appointment = this.selectedDateAppointments.find(app => app.id === appointmentId);
        if (appointment) {
          appointment.status = 'CONFIRMED';
        }
        this.closeModal();
      },
      error: (error) => {
        this.notificationService.showNotification('Error accepting appointment!', 'error');
        console.error('Error accepting appointment:', error);
      }
    });
  }

  declineAppointment(appointmentId: string) {
    this.userService.cancelAppointment(appointmentId).subscribe({
      next: () => {
        this.notificationService.showNotification('Appointment Declined!', 'warning');
        this.appointmentDeclined.emit(appointmentId);
        this.closeModal();
      },
      error: (error) => {
        this.notificationService.showNotification('Error declining appointment!', 'error');
        console.error('Error declining appointment:', error);
      }
    });
  }

  updateAppointment(appointment: Appointment) {
    this.userService.updateAppointment(appointment).subscribe({
      next: (response) => {
        this.notificationService.showNotification('Appointment updated successfully!', 'success');
        console.log('Appointment updated successfully:', response);
        this.closeModal();
      },
      error: (error) => {
        this.notificationService.showNotification('Error updating appointment!', 'error');
        console.error('Error updating appointment:', error);
      }
    });
  }

  closeModal() {
    this.showModal = false;
  }

  getDoctorName(doctorId: string): string {
    const doctor = this.doctors.find(d => d.userId === doctorId);
    return doctor ? `${doctor.forname} ${doctor.surname}` : 'Unknown';
  }

    getPatientName(patientId: string): string {
    const patient = this.patients.find(d => d.userId === patientId);
    return patient ? `${patient.forname} ${patient.surname}` : 'Unknown';
  }

}