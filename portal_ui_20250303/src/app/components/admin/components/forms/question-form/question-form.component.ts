import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Exercise {
  id: number;
  name: string;
}

interface Scenario {
  id: number;
  name: string;
}

interface ScenarioInject {
  id: number;
  name: string;
}

interface Role {
  id: number;
  name: string;
}

interface SwotCategory {
  id: number;
  name: string;
}

interface QuestionCategory {
  id: number;
  name: string;
}

interface Nist {
  id: number;
  name: string;
  seq_no: number;
}

interface Question {
  scenario_inject_id: string;
  question: string;
  options: Array<{
    option: string;
    is_correct: boolean;
  }>;
  nist_framework_id: number[];
  swot_category_id: number | null;
  question_category_id: number | null;
  question_type_id: number;
  execrise_id: string;
  scenario_id: string;
  role_id: number | null;
}

@Component({
  selector: 'app-question-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="form-content">
      <!-- Exercise Dropdown (First level) -->
      <div class="form-group">
        <label for="questionExercise">Exercise</label>
        <select
          id="questionExercise"
          [(ngModel)]="question.execrise_id"
          name="questionExercise"
          (change)="onExerciseChange()"
        >
          <option value="">Select an exercise</option>
          <option *ngFor="let exercise of exercises" [value]="exercise.id">
            {{ exercise.name }}
          </option>
        </select>
      </div>
      
      <!-- Scenario Dropdown (Second level) -->
      <div class="form-group">
        <label for="questionScenario">Scenario</label>
        <select
          id="questionScenario"
          [(ngModel)]="question.scenario_id"
          name="questionScenario"
          (change)="onScenarioChange()"
          [disabled]="!question.execrise_id || filteredScenarios.length === 0"
        >
          <option value="">Select a scenario</option>
          <option *ngFor="let scenario of filteredScenarios" [value]="scenario.id">
            {{ scenario.name }}
          </option>
        </select>
      </div>
      
      <!-- Inject Dropdown (Third level) -->
      <div class="form-group">
        <label for="questionInject">Inject</label>
        <select
          id="questionInject"
          [(ngModel)]="question.scenario_inject_id"
          name="questionInject"
          [disabled]="!question.scenario_id || filteredInjects.length === 0"
        >
          <option value="">Select an inject</option>
          <option *ngFor="let inject of filteredInjects" [value]="inject.id">
            {{ inject.name }}
          </option>
        </select>
      </div>
      
      <!-- Role Dropdown -->
      <div class="form-group">
        <label for="questionRole">Role</label>
        <select
          id="questionRole"
          [(ngModel)]="question.role_id"
          name="questionRole"
          [disabled]="filteredRoles.length === 0"
        >
          <option [ngValue]="null">Select Role (Optional)</option>
          <option *ngFor="let role of filteredRoles" [ngValue]="role.id">
            {{ role.name }}
          </option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="questionText">Question</label>
        <textarea
          id="questionText"
          [(ngModel)]="question.question"
          name="questionText"
          placeholder="Enter question text"
          class="question-textarea"
        ></textarea>
      </div>
      
      <!-- SWOT Category Dropdown -->
      <div class="form-group">
        <label for="swotCategory">SWOT Category</label>
        <select id="swotCategory" [(ngModel)]="question.swot_category_id" name="swotCategory">
          <option [ngValue]="null">Select SWOT Category (Optional)</option>
          <option *ngFor="let category of swotCategories" [ngValue]="category.id">
            {{ category.name }}
          </option>
        </select>
      </div>
      
      <!-- Question Category Dropdown -->
      <div class="form-group">
        <label for="questionCategory">Question Category</label>
        <select id="questionCategory" [(ngModel)]="question.question_category_id" name="questionCategory">
          <option [ngValue]="null">Select Question Category (Optional)</option>
          <option *ngFor="let category of questionCategories" [ngValue]="category.id">
            {{ category.name }}
          </option>
        </select>
      </div>
      
      <div class="form-group">
        <label>Options</label>
        <div class="options-container">
          <div
            class="option-input"
            *ngFor="let option of question.options; let i = index"
          >
             <div class="option-row">
              <input
                type="text"
                [placeholder]="'Option ' + (i + 1)"
                [(ngModel)]="option.option"
                [name]="'option_' + i"
                class="option-text"
              />
              <label class="correct-option-label">
                <input
                  type="radio"
                  [name]="'correct'"
                  [checked]="option.is_correct"
                  (change)="setCorrectOption(i)"
                />
                Correct Answer
              </label>
            </div>
          </div>
        </div>
      </div>
      <div class="form-group">
        <label>NIST Frameworks</label>
        <div class="nist-framework-selection">
          <div class="nist-framework-grid">
            <div 
              *ngFor="let framework of nistFrameworks"
              class="nist-framework-item"
              [class.selected]="isNistFrameworkSelected(framework.id)"
              (click)="toggleNistFramework(framework.id)"
            >
              <div class="framework-checkbox">
                <input 
                  type="checkbox" 
                  [checked]="isNistFrameworkSelected(framework.id)"
                  (change)="toggleNistFramework(framework.id)"
                />
                <span class="framework-name">{{framework.name}}</span>
              </div>
              <span class="framework-seq">#{{framework.seq_no}}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class QuestionFormComponent {
  @Input() question: Question = {
    scenario_inject_id: '',
    question: '',
    options: [
      { option: '', is_correct: true },
      { option: '', is_correct: false },
      { option: '', is_correct: false },
      { option: '', is_correct: false }
    ],
    nist_framework_id: [],
    swot_category_id: null,
    question_category_id: null,
    question_type_id: 1,
    execrise_id: '',
    scenario_id: '',
    role_id: null
  };
  @Input() exercises: Exercise[] = [];
  @Input() scenarios: Scenario[] = [];
  @Input() injects: ScenarioInject[] = [];
  @Input() roles: Role[] = [];
  @Input() swotCategories: SwotCategory[] = [];
  @Input() questionCategories: QuestionCategory[] = [];
  @Input() nistFrameworks: Nist[] = [];
  @Input() filteredScenarios: Scenario[] = [];
  @Input() filteredInjects: ScenarioInject[] = [];
  @Input() filteredRoles: Role[] = [];
  @Output() questionChange = new EventEmitter<Question>();
  @Output() exerciseChanged = new EventEmitter<string>();
  @Output() scenarioChanged = new EventEmitter<string>();

  ngOnChanges(): void {
    this.questionChange.emit(this.question);
  }

  onExerciseChange(): void {
    this.exerciseChanged.emit(this.question.execrise_id);
  }

  onScenarioChange(): void {
    this.scenarioChanged.emit(this.question.scenario_id);
  }

  setCorrectOption(index: number): void {
    this.question.options.forEach((option, i) => {
      option.is_correct = (i === index);
    });
    this.questionChange.emit(this.question);
  }

  toggleNistFramework(id: number): void {
    const index = this.question.nist_framework_id.indexOf(id);
    if (index === -1) {
      this.question.nist_framework_id.push(id);
    } else {
      this.question.nist_framework_id.splice(index, 1);
    }
    this.questionChange.emit(this.question);
  }

  isNistFrameworkSelected(id: number): boolean {
    return this.question.nist_framework_id.includes(id);
  }
}