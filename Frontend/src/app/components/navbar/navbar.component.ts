import { NgClass, NgIf } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, NgIf, NgClass],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  menuOpen = false;
  isLoggedIn: boolean = false;
  isDoctor: boolean = false;
  isPatient: boolean = false;

  constructor(private router: Router) {}

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  ngOnInit() {
    this.checkLoginStatus();

    this.router.events.subscribe(() => {
      this.checkLoginStatus();
    });
  }

  checkLoginStatus() {
    const token = sessionStorage.getItem('authToken');
    const role = sessionStorage.getItem('role');
    this.isLoggedIn = !!token;
    this.isDoctor = role === 'DENTIST';
    this.isPatient = role === 'PATIENT';
  }
  
  logout() {
    sessionStorage.clear();
    this.isLoggedIn = false;
    this.isDoctor = false;
    this.isPatient = false;
    this.router.navigate(['/home']).then(() => {
      this.checkLoginStatus();
    });
  }
  
  @HostListener('window:beforeunload', ['$event'])
  clearLocalStorage(event: Event) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
  }

  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }
}
