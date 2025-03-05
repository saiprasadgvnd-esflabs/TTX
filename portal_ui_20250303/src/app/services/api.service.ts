import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Role, Exercise, Scenario } from '../models/role.interface';
import { ExerciseData, Nist } from '../models/exercise.interface';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'https://esflabs.ai/ttx';
  
  constructor(private http: HttpClient) {}

  getRoles(client_id:number): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.baseUrl}/roles/client/${client_id}`);
  }
  
  getRoleByID(role_id:number):Observable<Role>{
    return this.http.get<Role>(`${this.baseUrl}/roles/${role_id}`)
  }

  getExercises(client_id:number): Observable<Exercise[]> {
    return this.http.get<Exercise[]>(`${this.baseUrl}/exercises/client/${client_id}`);
  }
  
  getExercisesByID(exercise_id:number): Observable<Exercise> {
    return this.http.get<Exercise>(`${this.baseUrl}/exercises/${exercise_id}`);
  }
  
  getScenarios(client_id:number): Observable<Scenario[]> {
    return this.http.get<Scenario[]>(`${this.baseUrl}/scenarios/client/${client_id}`);
  }
  
  getScenariosByID(scenario_id:number): Observable<Scenario> {
    return this.http.get<Scenario>(`${this.baseUrl}/scenarios/${scenario_id}`);
  }
  
  getExerciseData(user_session_id:string): Observable<ExerciseData> {
    return this.http.get<ExerciseData>(
      `${this.baseUrl}/scenario-questions/user-session/${user_session_id}`
    );
  }

  getExerciseSession(session_id:string){
    return this.http.get(`${this.baseUrl}/exercise-session/session/${session_id}`);
  }

  getNistFrameworks(): Observable<Nist[]> {
    return this.http.get<Nist[]>(`${this.baseUrl}/nist`);
  }
  
  createUserSession(body:any){
    return this.http.post(`${this.baseUrl}/user-session`, body)
  }
  
  submitUserSessionAnswer(payload: { session_id: string; scenario_question_id: number; option: any; is_correct: boolean; answered_in: number }) {
    return this.http.post(`${this.baseUrl}/user-session-answers/${payload.session_id}`, payload);
  }
  
  setUserSessionComplted(session_id:string){
    return this.http.put(`${this.baseUrl}/user-session/${session_id}/completed`, {})
  }
  
  getuserSessionReport(session_id:string){
    return this.http.get(`${this.baseUrl}/user-session/result/${session_id}`)
  }
  
  getLiveDashboardData(sessionId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/live-dashboard/${sessionId}`).pipe(
      catchError(error => {
        console.error('Error fetching dashboard data:', error);
        return of(null);
      })
    );
  }
  
  getOrgReport(sessionId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/reports/client/session/${sessionId}`).pipe(
      catchError(error => {
        console.error('Error fetching organization report:', error);
        return of(null);
      })
    );
  }
}