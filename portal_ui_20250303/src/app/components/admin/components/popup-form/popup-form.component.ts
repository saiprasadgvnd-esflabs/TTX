import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientFormComponent } from '../forms/client-form/client-form.component';
import { ExerciseFormComponent } from '../forms/exercise-form/exercise-form.component';
import { ScenarioFormComponent } from '../forms/scenario-form/scenario-form.component';
import { InjectFormComponent } from '../forms/inject-form/inject-form.component';
import { QuestionFormComponent } from '../forms/question-form/question-form.component';
import { SessionFormComponent } from '../forms/session-form/session-form.component';

@Component({
  selector: 'app-popup-form',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    ClientFormComponent,
    ExerciseFormComponent,
    ScenarioFormComponent,
    InjectFormComponent,
    QuestionFormComponent,
    SessionFormComponent
  ],
  template: `
    <div class="popup-overlay" *ngIf="showForm" (click)="onClose()">
      <div class="popup-content" (click)="$event.stopPropagation()">
        <div class="popup-header">
          <h2>{{ title }}</h2>
          <button class="close-btn" (click)="onClose()">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="popup-body" [ngSwitch]="formType">
          <app-client-form 
            *ngSwitchCase="'client'" 
            [client]="clientData" 
            (clientChange)="onClientChange($event)">
          </app-client-form>

          <app-exercise-form 
            *ngSwitchCase="'exercise'" 
            [exercise]="exerciseData" 
            [clients]="clients"
            (exerciseChange)="onExerciseChange($event)">
          </app-exercise-form>

          <app-scenario-form 
            *ngSwitchCase="'scenario'" 
            [scenario]="scenarioData" 
            [clients]="clients"
            [exercises]="exercises"
            (scenarioChange)="onScenarioChange($event)">
          </app-scenario-form>

          <app-inject-form 
            *ngSwitchCase="'inject'" 
            [inject]="injectData" 
            [scenarios]="scenarios"
            (injectChange)="onInjectChange($event)">
          </app-inject-form>

          <app-question-form 
            *ngSwitchCase="'question'" 
            [question]="questionData" 
            [exercises]="exercises"
            [scenarios]="scenarios"
            [injects]="injects"
            [roles]="roles"
            [swotCategories]="swotCategories"
            [questionCategories]="questionCategories"
            [nistFrameworks]="nistFrameworks"
            [filteredScenarios]="filteredScenarios"
            [filteredInjects]="filteredInjects"
            [filteredRoles]="filteredRoles"
            (questionChange)="onQuestionChange($event)"
            (exerciseChanged)="onExerciseSelectionChange($event)"
            (scenarioChanged)="onScenarioSelectionChange($event)">
          </app-question-form>

          <app-session-form 
            *ngSwitchCase="'session'" 
            [session]="sessionData" 
            [exercises]="exercises"
            [scenarios]="scenarios"
            (sessionChange)="onSessionChange($event)">
          </app-session-form>
        </div>

        <div class="popup-footer">
          <button class="cancel-btn" (click)="onClose()">Cancel</button>
          <button class="submit-btn" (click)="onSubmit()">Save</button>
        </div>
      </div>
    </div>
  `
})
export class PopupFormComponent {
  @Input() showForm: boolean = false;
  @Input() formType: string = '';
  @Input() title: string = '';
  
  // Data inputs
  @Input() clientData: any = {};
  @Input() exerciseData: any = {};
  @Input() scenarioData: any = {};
  @Input() injectData: any = {};
  @Input() questionData: any = {};
  @Input() sessionData: any = {};
  
  // Reference data
  @Input() clients: any[] = [];
  @Input() exercises: any[] = [];
  @Input() scenarios: any[] = [];
  @Input() injects: any[] = [];
  @Input() roles: any[] = [];
  @Input() swotCategories: any[] = [];
  @Input() questionCategories: any[] = [];
  @Input() nistFrameworks: any[] = [];
  @Input() filteredScenarios: any[] = [];
  @Input() filteredInjects: any[] = [];
  @Input() filteredRoles: any[] = [];
  
  // Events
  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<void>();
  @Output() exerciseSelectionChange = new EventEmitter<string>();
  @Output() scenarioSelectionChange = new EventEmitter<string>();
  
  // Form data change events
  @Output() clientDataChange = new EventEmitter<any>();
  @Output() exerciseDataChange = new EventEmitter<any>();
  @Output() scenarioDataChange = new EventEmitter<any>();
  @Output() injectDataChange = new EventEmitter<any>();
  @Output() questionDataChange = new EventEmitter<any>();
  @Output() sessionDataChange = new EventEmitter<any>();

  onClose(): void {
    this.close.emit();
  }

  onSubmit(): void {
    this.submit.emit();
  }

  onClientChange(data: any): void {
    this.clientDataChange.emit(data);
  }

  onExerciseChange(data: any): void {
    this.exerciseDataChange.emit(data);
  }

  onScenarioChange(data: any): void {
    this.scenarioDataChange.emit(data);
  }

  onInjectChange(data: any): void {
    this.injectDataChange.emit(data);
  }

  onQuestionChange(data: any): void {
    this.questionDataChange.emit(data);
  }

  onSessionChange(data: any): void {
    this.sessionDataChange.emit(data);
  }

  onExerciseSelectionChange(exerciseId: string): void {
    this.exerciseSelectionChange.emit(exerciseId);
  }

  onScenarioSelectionChange(scenarioId: string): void {
    this.scenarioSelectionChange.emit(scenarioId);
  }
}