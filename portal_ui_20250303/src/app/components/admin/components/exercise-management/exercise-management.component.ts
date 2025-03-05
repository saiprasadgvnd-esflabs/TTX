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

@Component({
  selector: 'app-exercise-management',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="management-section">
      <div class="section-header">
        <div class="header-content">
          <h2>Exercise Management</h2>
          <button class="add-button" (click)="onAddExercise()">
            <i class="fas fa-plus"></i> Add Exercise
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
                <th>Time (min)</th>
                <th>Amount ($)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let exercise of exercises">
                <td>{{ exercise.id }}</td>
                <td>{{ exercise.name }}</td>
                <td>{{ getClientName(exercise.client_id) }}</td>
                <td>{{ exercise.time }}</td>
                <td>\${{ exercise.exercise_simulated_amount | number }}</td>
                <td>
                  <button class="action-btn edit" (click)="onEditExercise(exercise)">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="action-btn delete" (click)="onDeleteExercise(exercise.id)">
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
export class ExerciseManagementComponent {
  @Input() exercises: Exercise[] = [];
  @Input() clients: Client[] = [];
  @Output() addExercise = new EventEmitter<void>();
  @Output() editExercise = new EventEmitter<Exercise>();
  @Output() deleteExercise = new EventEmitter<number>();

  onAddExercise(): void {
    this.addExercise.emit();
  }

  onEditExercise(exercise: Exercise): void {
    this.editExercise.emit(exercise);
  }

  onDeleteExercise(id: number): void {
    this.deleteExercise.emit(id);
  }

  getClientName(clientId: number): string {
    const client = this.clients.find(c => c.id === clientId);
    return client ? client.name : 'Unknown Client';
  }
}