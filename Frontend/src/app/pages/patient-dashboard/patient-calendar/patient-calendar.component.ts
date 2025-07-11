import { Component } from '@angular/core';
import { AppointmentCalendarComponent } from '../../../components/appointment-calendar/appointment-calendar.component';
import { AuthService } from '../../../services/auth.service';
import { UserCrudService } from '../../../services/user_crud.service';

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
  selector: 'app-patient-calendar',
  imports: [AppointmentCalendarComponent],
  templateUrl: './patient-calendar.component.html',
  styleUrl: './patient-calendar.component.css'
})
export class PatientCalendarComponent {
  currentMonth: Date = new Date();
  daysInMonth: Date[] = [];

  patient: User | null = null;
  doctors: User[] = [];
  patientId: string = '';

  appointments: Appointment[] = [];

  selectedDateAppointments: Appointment[] = [];
  showModal: boolean = false;
  selectedDate: string = '';

  constructor(private authService: AuthService, private userService: UserCrudService) { }

  ngOnInit() {
    this.patientId = this.authService.getLoggedInUserId();

    this.userService.getUserById(this.patientId).subscribe((patientData) => {
      this.patient = patientData;
    });

    this.userService.getPatientsAppointments(this.patientId).subscribe((data) => {
      this.appointments = data.filter(app => app.status !== 'CANCELLED');

      this.generateCalendar();
    });
  }


  onAppointmentDeclined(appointmentId: string) {
    this.appointments = this.appointments.filter(appointment => appointment.id !== appointmentId);
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
    const targetDate = day.toISOString().split('T')[0];
    return this.appointments.some(
      appointment => appointment.date === targetDate
    );
  }

  getAppointmentsForDay(day: Date): Appointment[] {
    const targetDate = day.toISOString().split('T')[0];
    return this.appointments
      .filter(appointment => appointment.date === targetDate)
      .map(appointment => ({
        ...appointment,
        doctorForName: this.doctors.find(d => d.userId === appointment.doctorId)?.forname || 'Unknown',
        doctorSurName: this.doctors.find(d => d.userId === appointment.doctorId)?.surname || 'Unknown',
        patientForName: this.patient?.forname || 'Unknown',
        patientSurName: this.patient?.surname || 'Unknown'
      }));
  }


  openAppointments(day: Date) {
    this.selectedDate = day.toISOString().split('T')[0];
    this.selectedDateAppointments = this.getAppointmentsForDay(day);
    if (this.selectedDateAppointments.length > 0) {
      this.showModal = true;
    }
  }

  closeModal() {
    this.showModal = false;
  }

  prevMonth() {
    this.currentMonth.setMonth(this.currentMonth.getMonth() - 1);
    this.generateCalendar();
  }

  nextMonth() {
    this.currentMonth.setMonth(this.currentMonth.getMonth() + 1);
    this.generateCalendar();
  }
}