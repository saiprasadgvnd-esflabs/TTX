import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Exercise } from '../models/exercise';

@Injectable({
  providedIn: 'root'
})
export class ExerciseService {
  private apiUrl = 'http://localhost:3000/exercises';  // Update with your actual API base URL

  constructor(private http: HttpClient) {}

  getExercisesByClientId(clientId: number): Observable<Exercise[]> {
    return this.http.get<Exercise[]>(`${this.apiUrl}/client/${clientId}`);
  }
}