import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Exercise {
  id: number;
  name: string;
  time: number;
  exercise_simulated_amount: number;
  client_id: number;
}

interface Scenario {
  id: number;
  name: string;
  client_id: number;
  execrise_id: number;
  description: string;
}

interface Session {
  exercise_id: string;
  scenario_id: string;
  scheduled_start_time: string;
  scheduled_end_time: string;
  created_by: string;
}

@Component({
  selector: 'app-session-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="form-content">
      <div class="form-group">
        <label for="sessionExercise">Exercise</label>
        <select id="sessionExercise" [(ngModel)]="session.exercise_id" name="sessionExercise">
          <option value="">Select an exercise</option>
          <option *ngFor="let exercise of exercises" [value]="exercise.id">
            {{ exercise.name }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label for="sessionScenario">Scenario</label>
        <select id="sessionScenario" [(ngModel)]="session.scenario_id" name="sessionScenario">
          <option value="">Select a scenario</option>
          <option *ngFor="let scenario of scenarios" [value]="scenario.id">
            {{ scenario.name }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label for="startTime">Scheduled Start Time</label>
        <input
          type="datetime-local"
          id="startTime"
          [(ngModel)]="session.scheduled_start_time"
          name="startTime"
        />
      </div>
      <div class="form-group">
        <label for="endTime">Scheduled End Time</label>
        <input
          type="datetime-local"
          id="endTime"
          [(ngModel)]="session.scheduled_end_time"
          name="endTime"
        />
      </div>
      <div class="form-group">
        <label for="createdBy">Created By</label>
        <input
          type="text"
          id="createdBy"
          [(ngModel)]="session.created_by"
          name="createdBy"
          placeholder="Enter your name"
        />
      </div>
    </div>
  `
})
export class SessionFormComponent {
  @Input() session: Session = {
    exercise_id: '',
    scenario_id: '',
    scheduled_start_time: '',
    scheduled_end_time: '',
    created_by: ''
  };
  @Input() exercises: Exercise[] = [];
  @Input() scenarios: Scenario[] = [];
  @Output() sessionChange = new EventEmitter<Session>();

  ngOnChanges(): void {
    this.sessionChange.emit(this.session);
  }
}