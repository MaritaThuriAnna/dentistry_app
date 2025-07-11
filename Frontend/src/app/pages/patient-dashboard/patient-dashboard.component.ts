import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PatientHomeComponent } from "./patient-home/patient-home.component";
import { RouterOutlet } from '@angular/router';
import { NotificationComponent } from "../../components/notification/notification.component";

@Component({
  selector: 'app-patient-dashboard',
  imports: [CommonModule, RouterOutlet, NotificationComponent],
  templateUrl: './patient-dashboard.component.html',
  styleUrl: './patient-dashboard.component.css'
})
export class PatientDashboardComponent {

}
