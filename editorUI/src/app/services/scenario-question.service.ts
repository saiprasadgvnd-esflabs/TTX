import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ScenarioQuestion } from '../models/scenario-question';

@Injectable({
  providedIn: 'root'
})
export class ScenarioQuestionService {
  private apiUrl = 'http://localhost:3000/scenario-questions';  // Update with your actual API base URL

  constructor(private http: HttpClient) {}

  createScenarioQuestion(question: ScenarioQuestion): Observable<any> {
    return this.http.post(this.apiUrl, question);
  }
}