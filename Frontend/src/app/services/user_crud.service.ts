import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface User {
  userId: string;
  surname: string;
  forname: string;
  email: string;
  telNr: string;
  role: string;
  profilePictureUrl: string;
  gender?: string;
  address?: string;
  medicalHistory?: {
    allergies: string;
    conditions: string[];
    previousTreatments: string[]
  };
  doctorNotes?: string;
}

interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  reason?: string;
  status: string
}

@Injectable({
  providedIn: 'root'
})
export class UserCrudService {
  private userUrl = 'http://localhost:8082/User';
  private appointmentUrl = 'http://localhost:8084/Appointments';


  constructor(private http: HttpClient) { }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.userUrl}/ReadAll`);
  }

  getUserById(userId: string): Observable<User> {
    return this.http.get<User>(`${this.userUrl}/findUserById?id=${userId}`);
  }

  getUserByEmail(email: string): Observable<User> {
    return this.http.get<User>(`${this.userUrl}/findByEmail?email=${email}`);
  }

  getPatientWithRecord(userId: string): Observable<any> {
    return this.http.get<any>(`${this.userUrl}/findPatientWithRecord?id=${userId}`);
  }

  updatePatientData(payload: any): Observable<any> {
    return this.http.put(`${this.userUrl}/UpdateFull`, payload);
  }

  createAppointment(appointment: any): Observable<any> {
    return this.http.post(`${this.appointmentUrl}/Schedule`, appointment);
  }

  updateAppointment(appointment: Appointment): Observable<any> {
    return this.http.put(`${this.appointmentUrl}/Update/${appointment.id}`, {
      id: appointment.id,
      date: appointment.date,
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      reason: appointment.reason
    });
  }

  getDoctorsAppointments(doctorId: string): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.appointmentUrl}/Doctor/${doctorId}`);
  }

  getPatientsAppointments(patientId: string): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.appointmentUrl}/Patient/${patientId}`);
  }

  confirmAppointment(appointmentId: string): Observable<any> {
    return this.http.put(`${this.appointmentUrl}/Confirm/${appointmentId}`, {});
  }

  cancelAppointment(appointmentId: string): Observable<any> {
    return this.http.put(`${this.appointmentUrl}/Cancel/${appointmentId}`, {});
  }
}
