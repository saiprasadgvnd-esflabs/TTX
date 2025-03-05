import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Client {
  id: number;
  name: string;
}

interface Exercise {
  id: number;
  name: string;
  time: number;
  exercise_simulated_amount: number;
  client_id: number;
}

interface Scenario {
  name: string;
  client_id: string;
  exercise_id: string;
  description: string;
}

@Component({
  selector: 'app-scenario-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="form-content">
      <div class="form-group">
        <label for="scenarioClient">Client</label>
        <select id="scenarioClient" [(ngModel)]="scenario.client_id" name="scenarioClient">
          <option value="">Select a client</option>
          <option *ngFor="let client of clients" [value]="client.id">
            {{ client.name }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label for="scenarioExercise">Exercise</label>
        <select id="scenarioExercise" [(ngModel)]="scenario.exercise_id" name="scenarioExercise">
          <option value="">Select an exercise</option>
          <option *ngFor="let exercise of exercises" [value]="exercise.id">
            {{ exercise.name }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label for="scenarioName">Scenario Name</label>
        <input
          type="text"
          id="scenarioName"
          [(ngModel)]="scenario.name"
          name="scenarioName"
          placeholder="Enter scenario name"
        />
      </div>
      <div class="form-group">
        <label for="scenarioDescription">Description</label>
        <textarea
          id="scenarioDescription"
          [(ngModel)]="scenario.description"
          name="scenarioDescription"
          placeholder="Enter scenario description"
        ></textarea>
      </div>
    </div>
  `
})
export class ScenarioFormComponent {
  @Input() scenario: Scenario = {
    name: '',
    client_id: '',
    exercise_id: '',
    description: ''
  };
  @Input() clients: Client[] = [];
  @Input() exercises: Exercise[] = [];
  @Output() scenarioChange = new EventEmitter<Scenario>();

  ngOnChanges(): void {
    this.scenarioChange.emit(this.scenario);
  }
}