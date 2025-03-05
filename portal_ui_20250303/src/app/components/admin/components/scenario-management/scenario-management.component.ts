import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  id: number;
  name: string;
  client_id: number;
  execrise_id: number;
  description: string;
}

@Component({
  selector: 'app-scenario-management',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="management-section">
      <div class="section-header">
        <div class="header-content">
          <h2>Scenario Management</h2>
          <button class="add-button" (click)="onAddScenario()">
            <i class="fas fa-plus"></i> Add Scenario
          </button>
        </div>
      </div>
      <div class="list-container">
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Client</th>
                <th>Exercise</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let scenario of scenarios">
                <td>{{ scenario.id }}</td>
                <td>{{ scenario.name }}</td>
                <td>{{ getClientName(scenario.client_id) }}</td>
                <td>{{ getExerciseName(scenario.execrise_id) }}</td>
                <td>{{ scenario.description }}</td>
                <td>
                  <button class="action-btn edit" (click)="onEditScenario(scenario)">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="action-btn delete" (click)="onDeleteScenario(scenario.id)">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `
})
export class ScenarioManagementComponent {
  @Input() scenarios: Scenario[] = [];
  @Input() clients: Client[] = [];
  @Input() exercises: Exercise[] = [];
  @Output() addScenario = new EventEmitter<void>();
  @Output() editScenario = new EventEmitter<Scenario>();
  @Output() deleteScenario = new EventEmitter<number>();

  onAddScenario(): void {
    this.addScenario.emit();
  }

  onEditScenario(scenario: Scenario): void {
    this.editScenario.emit(scenario);
  }

  onDeleteScenario(id: number): void {
    this.deleteScenario.emit(id);
  }

  getClientName(clientId: number): string {
    const client = this.clients.find(c => c.id === clientId);
    return client ? client.name : 'Unknown Client';
  }

  getExerciseName(exerciseId: number): string {
    const exercise = this.exercises.find(e => e.id === exerciseId);
    return exercise ? exercise.name : 'Unknown Exercise';
  }
}