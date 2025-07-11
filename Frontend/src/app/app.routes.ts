import { Routes } from '@angular/router';
import { DoctorDashboardComponent } from './pages/doctor-dashboard/doctor-dashboard.component';
import { PatientDashboardComponent } from './pages/patient-dashboard/patient-dashboard.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './login/AuthGuard';
import { AppointmentComponent } from './pages/doctor-dashboard/appointment/appointment.component';
import { PatientDetailsComponent } from './pages/doctor-dashboard/patient-list/patient-details/patient-details.component';
import { PatientListComponent } from './pages/doctor-dashboard/patient-list/patient-list.component';
import { XrayUploadComponent } from './pages/doctor-dashboard/xray-upload/xray-upload.component';
import { HomeComponent } from './components/home/home.component';
import { UpdatePatientComponent } from './pages/doctor-dashboard/patient-list/update-patient/update-patient.component';
import { PatientHomeComponent } from './pages/patient-dashboard/patient-home/patient-home.component';
import { PatientCalendarComponent } from './pages/patient-dashboard/patient-calendar/patient-calendar.component';
import { DoctorHomeComponent } from './pages/doctor-dashboard/doctor-home/doctor-home.component';
import { PatientProfileComponent } from './pages/patient-dashboard/patient-profile/patient-profile.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  
  { path: 'login', component: LoginComponent },

  {
    path: 'doctor',
    component: DoctorDashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'home', component: DoctorHomeComponent },
      { path: 'patients', component: PatientListComponent },
      { path: 'patient/:id', component: PatientDetailsComponent },
      { path: 'patient/update/:id', component: UpdatePatientComponent },
      { path: 'appointments', component: AppointmentComponent },
      { path: 'xrays', component: XrayUploadComponent },
    ]
  },

  {
    path: 'patient',
    component: PatientDashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'home', component: PatientHomeComponent },
      { path: 'calendar', component: PatientCalendarComponent },
      { path: 'profile', component: PatientProfileComponent }
    ]
  },

  { path: '**', redirectTo: '' }
];