// AuthGuards.ts:
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  constructor(private router: Router) { }

  canActivate(): boolean {
    if (!sessionStorage.getItem('authToken')) {
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }
}
