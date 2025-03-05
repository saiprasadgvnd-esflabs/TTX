import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Client {
  id: number;
  name: string;
}

interface Exercise {
  name: string;
  time: number;
  exercise_simulated_amount: number;
  client_id: string;
}

@Component({
  selector: 'app-exercise-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="form-content">
      <div class="form-group">
        <label for="exerciseClient">Client</label>
        <select id="exerciseClient" [(ngModel)]="exercise.client_id" name="exerciseClient">
          <option value="">Select a client</option>
          <option *ngFor="let client of clients" [value]="client.id">
            {{ client.name }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label for="exerciseName">Exercise Name</label>
        <input
          type="text"
          id="exerciseName"
          [(ngModel)]="exercise.name"
          name="exerciseName"
          placeholder="Enter exercise name"
        />
      </div>
      <div class="form-group">
        <label for="exerciseTime">Time (minutes)</label>
        <input
          type="number"
          id="exerciseTime"
          [(ngModel)]="exercise.time"
          name="exerciseTime"
          placeholder="Enter time in minutes"
        />
      </div>
      <div class="form-group">
        <label for="exerciseAmount">Simulated Amount ($)</label>
        <input
          type="number"
          id="exerciseAmount"
          [(ngModel)]="exercise.exercise_simulated_amount"
          name="exerciseAmount"
          placeholder="Enter simulated amount"
        />
      </div>
    </div>
  `
})
export class ExerciseFormComponent {
  @Input() exercise: Exercise = {
    name: '',
    time: 0,
    exercise_simulated_amount: 0,
    client_id: ''
  };
  @Input() clients: Client[] = [];
  @Output() exerciseChange = new EventEmitter<Exercise>();

  ngOnChanges(): void {
    this.exerciseChange.emit(this.exercise);
  }
}