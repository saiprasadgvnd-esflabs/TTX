import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ScenarioInject {
  id: number;
  scenario_id: number;
  name: string;
  data: any;
}

interface Nist {
  id: number;
  name: string;
  seq_no: number;
}

interface Question {
  id: number;
  scenario_inject_id: number;
  question: string;
  options: Array<{
    option: string;
    is_correct: boolean;
  }>;
  nist_framework_id: number[];
  role_id?: number | null; // Single role ID
  role_ids?: number[] | null; // For backward compatibility with multiple roles
}

interface Client {
  id: number;
  name: string;
}

interface Role {
  id: number;
  client_id: number;
  name: string;
}

interface Team {
  id: number;
  name: string;
  client_id: number;
  role_id: number[];
}

interface Exercise {
  id: number;
  name: string;
  client_id: number;
}

interface Scenario {
  id: number;
  name: string;
  client_id: number;
  execrise_id: number;
}

@Component({
  selector: 'app-question-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="management-section">
      <div class="section-header">
        <div class="header-content">
          <h2>Question Management</h2>
          <div class="header-actions">
            <div class="filters-container">
              <div class="filter-group">
                <select [(ngModel)]="selectedClientId" (change)="applyFilters()">
                  <option value="">All Clients</option>
                  <option *ngFor="let client of clients" [value]="client.id">
                    {{ client.name }}
                  </option>
                </select>
              </div>
              <div class="filter-group">
                <select [(ngModel)]="selectedRoleId" (change)="applyFilters()" [disabled]="!selectedClientId">
                  <option value="">All Roles</option>
                  <option *ngFor="let role of getFilteredRoles()" [value]="role.id">
                    {{ role.name }}
                  </option>
                </select>
              </div>
              <div class="filter-group">
                <select [(ngModel)]="selectedTeamId" (change)="applyFilters()" [disabled]="!selectedClientId">
                  <option value="">All Teams</option>
                  <option *ngFor="let team of getFilteredTeams()" [value]="team.id">
                    {{ team.name }}
                  </option>
                </select>
              </div>
              <div class="filter-group">
                <select [(ngModel)]="selectedExerciseId" (change)="onExerciseChange()">
                  <option value="">All Exercises</option>
                  <option *ngFor="let exercise of getFilteredExercises()" [value]="exercise.id">
                    {{ exercise.name }}
                  </option>
                </select>
              </div>
              <div class="filter-group">
                <select [(ngModel)]="selectedScenarioId" (change)="onScenarioChange()" [disabled]="!selectedExerciseId">
                  <option value="">All Scenarios</option>
                  <option *ngFor="let scenario of getFilteredScenarios()" [value]="scenario.id">
                    {{ scenario.name }}
                  </option>
                </select>
              </div>
              <div class="filter-group">
                <select [(ngModel)]="selectedInjectId" (change)="applyFilters()" [disabled]="!selectedScenarioId">
                  <option value="">All Injects</option>
                  <option *ngFor="let inject of getFilteredInjects()" [value]="inject.id">
                    {{ inject.name }}
                  </option>
                </select>
              </div>
            </div>
            <button class="add-button" (click)="onAddQuestion()">
              <i class="fas fa-plus"></i> Add Question
            </button>
          </div>
        </div>
      </div>
      <div class="list-container">
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Question</th>
                <th>Inject</th>
                <th>Role</th>
                <th>NIST Frameworks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let question of filteredQuestions">
                <td>{{ question.id }}</td>
                <td>{{ question.question }}</td>
                <td>{{ getInjectName(question.scenario_inject_id) }}</td>
                <td>
                  <!-- Handle both single role_id and array of role_ids -->
                  <div *ngIf="question.role_id !== undefined && question.role_id !== null">
                    {{ getRoleName(question.role_id) }}
                  </div>
                  <div *ngIf="question.role_ids && question.role_ids.length > 0">
                    <div *ngFor="let roleId of question.role_ids">
                      {{ getRoleName(roleId) }}
                    </div>
                  </div>
                  <div *ngIf="(!question.role_id || question.role_id === null) && (!question.role_ids || question.role_ids.length === 0)">
                    All Roles
                  </div>
                </td>
                <td>
                  <div class="nist-frameworks">
                    <div
                      class="nist-badge"
                      *ngFor="let nistId of question.nist_framework_id"
                    >
                      {{ getNistFramework(nistId) }}
                    </div>
                  </div>
                </td>
                <td>
                  <button class="action-btn edit" (click)="onEditQuestion(question)">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="action-btn delete" (click)="onDeleteQuestion(question.id)">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `,
  styleUrls: ['./question-management.component.css']
})
export class QuestionManagementComponent implements OnInit {
  @Input() questions: Question[] = [];
  @Input() injects: ScenarioInject[] = [];
  @Input() nistFrameworks: Nist[] = [];
  @Input() getRoleName: (id: number | null | undefined) => string = () => 'Unknown';
  @Input() clients: Client[] = [];
  @Input() roles: Role[] = [];
  @Input() teams: Team[] = [];
  @Input() exercises: Exercise[] = [];
  @Input() scenarios: Scenario[] = [];
  @Output() addQuestion = new EventEmitter<void>();
  @Output() editQuestion = new EventEmitter<Question>();
  @Output() deleteQuestion = new EventEmitter<number>();

  // Filter state
  selectedClientId: string = '';
  selectedRoleId: string = '';
  selectedTeamId: string = '';
  selectedExerciseId: string = '';
  selectedScenarioId: string = '';
  selectedInjectId: string = '';
  filteredQuestions: Question[] = [];

  ngOnInit() {
    this.filteredQuestions = [...this.questions];
  }

  ngOnChanges() {
    this.applyFilters();
  }

  onAddQuestion(): void {
    this.addQuestion.emit();
  }

  onEditQuestion(question: Question): void {
    this.editQuestion.emit(question);
  }

  onDeleteQuestion(id: number): void {
    this.deleteQuestion.emit(id);
  }

  getInjectName(injectId: number): string {
    const inject = this.injects.find(i => i.id === injectId);
    return inject ? inject.name : 'Unknown Inject';
  }

  getNistFramework(id: number): string {
    const framework = this.nistFrameworks.find(f => f.id === id);
    return framework ? framework.name : '';
  }

  // Filter methods
  getFilteredRoles(): Role[] {
    if (!this.selectedClientId) {
      return this.roles;
    }
    const clientId = parseInt(this.selectedClientId);
    return this.roles.filter(role => role.client_id === clientId);
  }

  getFilteredTeams(): Team[] {
    if (!this.selectedClientId) {
      return this.teams;
    }
    const clientId = parseInt(this.selectedClientId);
    return this.teams.filter(team => team.client_id === clientId);
  }

  getFilteredExercises(): Exercise[] {
    if (!this.selectedClientId) {
      return this.exercises;
    }
    const clientId = parseInt(this.selectedClientId);
    return this.exercises.filter(exercise => exercise.client_id === clientId);
  }

  getFilteredScenarios(): Scenario[] {
    if (!this.selectedExerciseId) {
      return this.scenarios;
    }
    const exerciseId = parseInt(this.selectedExerciseId);
    return this.scenarios.filter(scenario => scenario.execrise_id === exerciseId);
  }

  getFilteredInjects(): ScenarioInject[] {
    if (!this.selectedScenarioId) {
      return this.injects;
    }
    const scenarioId = parseInt(this.selectedScenarioId);
    return this.injects.filter(inject => inject.scenario_id === scenarioId);
  }

  onExerciseChange(): void {
    // Reset scenario and inject selections when exercise changes
    this.selectedScenarioId = '';
    this.selectedInjectId = '';
    this.applyFilters();
  }

  onScenarioChange(): void {
    // Reset inject selection when scenario changes
    this.selectedInjectId = '';
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.questions];

    // Get all injects for filtering
    const allInjects = [...this.injects];

    // Filter by inject if selected
    if (this.selectedInjectId) {
      const injectId = parseInt(this.selectedInjectId);
      filtered = filtered.filter(q => q.scenario_inject_id === injectId);
    }
    // Filter by scenario if selected
    else if (this.selectedScenarioId) {
      const scenarioId = parseInt(this.selectedScenarioId);
      const injectIds = allInjects
        .filter(inject => inject.scenario_id === scenarioId)
        .map(inject => inject.id);
      filtered = filtered.filter(q => injectIds.includes(q.scenario_inject_id));
    }
    // Filter by exercise if selected
    else if (this.selectedExerciseId) {
      const exerciseId = parseInt(this.selectedExerciseId);
      const scenarioIds = this.scenarios
        .filter(scenario => scenario.execrise_id === exerciseId)
        .map(scenario => scenario.id);
      const injectIds = allInjects
        .filter(inject => scenarioIds.includes(inject.scenario_id))
        .map(inject => inject.id);
      filtered = filtered.filter(q => injectIds.includes(q.scenario_inject_id));
    }

    // Filter by role if selected
    if (this.selectedRoleId) {
      const roleId = parseInt(this.selectedRoleId);
      filtered = filtered.filter(q => 
        (q.role_id === roleId) || 
        (q.role_ids && q.role_ids.includes(roleId))
      );
    }
    // Filter by team if selected
    else if (this.selectedTeamId) {
      const teamId = parseInt(this.selectedTeamId);
      const team = this.teams.find(t => t.id === teamId);
      if (team) {
        const teamRoleIds = team.role_id;
        filtered = filtered.filter(q => 
          (teamRoleIds.includes(q.role_id as number)) || 
          (q.role_ids && q.role_ids.some(roleId => teamRoleIds.includes(roleId)))
        );
      }
    }
    // Filter by client if selected
    else if (this.selectedClientId) {
      const clientId = parseInt(this.selectedClientId);
      const clientRoleIds = this.roles
        .filter(role => role.client_id === clientId)
        .map(role => role.id);
      filtered = filtered.filter(q => 
        (q.role_id && clientRoleIds.includes(q.role_id)) || 
        (q.role_ids && q.role_ids.some(roleId => clientRoleIds.includes(roleId)))
      );
    }

    this.filteredQuestions = filtered;
  }
}