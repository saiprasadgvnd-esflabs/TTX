import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Role } from '../models/role';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiUrl = 'http://localhost:3000/roles';  // Update with your actual API base URL

  constructor(private http: HttpClient) {}

  getRolesByClientId(clientId: number): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.apiUrl}/client/${clientId}`);
  }
}