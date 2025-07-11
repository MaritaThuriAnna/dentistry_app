import { NgFor } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserCrudService } from '../../../services/user_crud.service';

interface Patient {
  userId: string;
  surname: string;
  forname: string;
  email: string;
  telNr: string;
  role: string;
  profilePictureUrl: string;
}

@Component({
  selector: 'app-patient-list',
  imports: [NgFor, RouterLink],
  templateUrl: './patient-list.component.html',
  styleUrl: './patient-list.component.css'
})
export class PatientListComponent {
  patients: Patient[] = [];

  constructor(private userService: UserCrudService, private router: Router) {}

  ngOnInit() {
    this.userService.getAllUsers().subscribe((data) => {
      this.patients = data.filter(user => user.role === 'PATIENT'); 
    });
  }

  selectPatient(patientId: string) {
    this.router.navigate(['/doctor/patient', patientId]);
  }
}
