import { Component } from '@angular/core';
import { UserCrudService } from '../../../services/user_crud.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-patient-home',
  imports: [RouterLink],
  templateUrl: './patient-home.component.html',
  styleUrl: './patient-home.component.css'
})
export class PatientHomeComponent {
  patient: any;

  constructor(private userService: UserCrudService) {}

  ngOnInit() {
    const patientId = localStorage.getItem('userId');
    this.userService.getPatientWithRecord(patientId!).subscribe(data => {
      this.patient = data;
      console.log("Patient Data:", this.patient);
    });
  }
}
