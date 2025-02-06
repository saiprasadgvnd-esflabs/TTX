import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Scenario } from '../models/scenario';

@Injectable({
  providedIn: 'root'
})
export class ScenarioService {
  private apiUrl = 'http://localhost:3000/scenarios';  // Update with your actual API base URL

  constructor(private http: HttpClient) {}

  getScenariosByClientId(clientId: number): Observable<Scenario[]> {
    return this.http.get<Scenario[]>(`${this.apiUrl}/client/${clientId}`);
  }
}