import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environment/environment';

export interface User {
  userId: string;
  role: string;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/User/Login`;
  private userDetailsUrl = `${environment.apiUrl}/User/findByEmail`;
  private currentUser = signal<User | null>(null);

  constructor(private http: HttpClient) { }

  loginUser(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}`, { userEmail: email, userPassword: password }, { observe: 'response' }).pipe(
      tap(response => {
        const body = response.body as User;

        const user: User = {
          userId: body.userId,
          role: body.role,
          token: body.token
        };
        this.currentUser.set(user);
        localStorage.setItem('user', JSON.stringify(user));
      })
    );

  }

  fetchUserByEmail(email: string): Observable<User> {
    return this.http.get<User>(`${this.userDetailsUrl}?email=${email}`).pipe(
      tap(user => {
        console.log("User details fetched:", user);
        this.setLoggedInUser(user.userId, user.role);
      })
    );
  }

  getLoggedInUserId(): string {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user).userId : '';
  }

  getLoggedInUserRole(): string {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user).role : '';
  }
  setLoggedInUser(userId: string, role: string) {
    localStorage.setItem('userId', userId);
    localStorage.setItem('role', role);
  }

  logout() {
    localStorage.clear();
  }

}
