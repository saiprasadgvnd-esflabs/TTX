import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ScenarioInject } from '../models/scenario-inject';

@Injectable({
  providedIn: 'root'
})
export class ScenarioInjectService {
  private apiUrl = 'http://localhost:3000/scenario-injects';

  constructor(private http: HttpClient) {}

  getInjectsByScenarioId(scenarioId: number): Observable<ScenarioInject[]> {
    return this.http.get<ScenarioInject[]>(`${this.apiUrl}/scenario/${scenarioId}`);
  }
}