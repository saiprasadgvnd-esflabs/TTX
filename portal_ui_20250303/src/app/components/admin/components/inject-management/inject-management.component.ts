import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Scenario {
  id: number;
  name: string;
  client_id: number;
  execrise_id: number;
  description: string;
}

interface ScenarioInject {
  id: number;
  scenario_id: number;
  name: string;
  data: {
    situation: {
      description: string;
      type: string;
    };
    impact: {
      description: string;
      type: string;
    };
    action_required: {
      description: string;
      type: string;
    };
  };
}

@Component({
  selector: 'app-inject-management',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="management-section">
      <div class="section-header">
        <div class="header-content">
          <h2>Inject Management</h2>
          <button class="add-button" (click)="onAddInject()">
            <i class="fas fa-plus"></i> Add Inject
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
                <th>Scenario</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let inject of injects">
                <td>{{ inject.id }}</td>
                <td>{{ inject.name }}</td>
                <td>{{ getScenarioName(inject.scenario_id) }}</td>
                <td>
                  <button class="action-btn edit" (click)="onEditInject(inject)">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="action-btn delete" (click)="onDeleteInject(inject.id)">
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
export class InjectManagementComponent {
  @Input() injects: ScenarioInject[] = [];
  @Input() scenarios: Scenario[] = [];
  @Output() addInject = new EventEmitter<void>();
  @Output() editInject = new EventEmitter<ScenarioInject>();
  @Output() deleteInject = new EventEmitter<number>();

  onAddInject(): void {
    this.addInject.emit();
  }

  onEditInject(inject: ScenarioInject): void {
    this.editInject.emit(inject);
  }

  onDeleteInject(id: number): void {
    this.deleteInject.emit(id);
  }

  getScenarioName(scenarioId: number): string {
    const scenario = this.scenarios.find(s => s.id === scenarioId);
    return scenario ? scenario.name : 'Unknown Scenario';
  }
}