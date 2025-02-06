import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ScenarioQuestionService } from '../../services/scenario-question.service';
import { ScenarioService } from '../../services/scenario.service';
import { RoleService } from '../../services/role.service';
import { ExerciseService } from '../../services/exercise.service';
import { ScenarioInjectService } from '../../services/scenario-inject.service';
import { Scenario } from '../../models/scenario';
import { Role } from '../../models/role';
import { Exercise } from '../../models/exercise';
import { ScenarioInject } from '../../models/scenario-inject';

@Component({
  selector: 'app-scenario-question-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  template: `
    <div class="container mx-auto backdrop-blur-lg bg-white/10 rounded-2xl p-8 shadow-2xl border border-white/20">
      <form [formGroup]="questionForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Scenario Selection -->
          <div class="form-group relative group">
            <label class="block mb-2 text-sm font-medium text-blue-300">Exercise</label>
            <select formControlName="exercise_id" 
                    class="w-full p-3 bg-gray-800/50 border border-blue-500/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300
                           backdrop-blur-sm group-hover:border-blue-400/50">
              <option value="">Select Exercise</option>
              <option *ngFor="let exercise of exercises" [value]="exercise.id">
                {{ exercise.name }}
              </option>
            </select>
            <div class="absolute inset-0 rounded-lg bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          </div>
          

          <!-- Role Selection -->
          <div class="form-group relative group">
            <label class="block mb-2 text-sm font-medium text-blue-300">Role</label>
            <select formControlName="role_id" 
                    class="w-full p-3 bg-gray-800/50 border border-blue-500/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300
                           backdrop-blur-sm group-hover:border-blue-400/50">
              <option value="">Select Role</option>
              <option *ngFor="let role of roles" [value]="role.id">
                {{ role.name }}
              </option>
            </select>
            <div class="absolute inset-0 rounded-lg bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          </div>

          <!-- Exercise Selection -->
          <div class="form-group relative group">
            <label class="block mb-2 text-sm font-medium text-blue-300">Scenario</label>
            <select formControlName="scenario_id" 
                    (change)="onScenarioChange($event)"
                    class="w-full p-3 bg-gray-800/50 border border-blue-500/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300
                           backdrop-blur-sm group-hover:border-blue-400/50">
              <option value="">Select Scenario</option>
              <option *ngFor="let scenario of scenarios" [value]="scenario.id">
                {{ scenario.name }}
              </option>
            </select>
            <div class="absolute inset-0 rounded-lg bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          </div>
        </div>

        <!-- Scenario Inject Selection -->
        <div class="form-group relative group" *ngIf="scenarioInjects.length > 0">
          <label class="block mb-2 text-sm font-medium text-blue-300">Scenario Inject</label>
          <select formControlName="scenario_inject_id" 
                  class="w-full p-3 bg-gray-800/50 border border-blue-500/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300
                         backdrop-blur-sm group-hover:border-blue-400/50">
            <option value="">Select Inject</option>
            <option *ngFor="let inject of scenarioInjects" [value]="inject.id">
              {{ inject.name }}
            </option>
          </select>
          <div class="absolute inset-0 rounded-lg bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
        </div>

        <!-- Question Input -->
        <div class="form-group relative group">
          <label class="block mb-2 text-sm font-medium text-blue-300">Question</label>
          <textarea formControlName="question" rows="3"
                    class="w-full p-3 bg-gray-800/50 border border-blue-500/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300
                           backdrop-blur-sm group-hover:border-blue-400/50"></textarea>
          <div class="absolute inset-0 rounded-lg bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
        </div>

        <!-- Compliance Reference -->
        <div class="form-group relative group">
          <label class="block mb-2 text-sm font-medium text-blue-300">Compliance Reference</label>
          <input type="text" formControlName="compliance_reference" 
                 class="w-full p-3 bg-gray-800/50 border border-blue-500/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300
                        backdrop-blur-sm group-hover:border-blue-400/50">
          <div class="absolute inset-0 rounded-lg bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
        </div>

        <!-- Question Type -->
        <div class="form-group relative group">
          <label class="block mb-2 text-sm font-medium text-blue-300">Question Type ID</label>
          <input type="number" formControlName="question_type_id" 
                 class="w-full p-3 bg-gray-800/50 border border-blue-500/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300
                        backdrop-blur-sm group-hover:border-blue-400/50">
          <div class="absolute inset-0 rounded-lg bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
        </div>

        <!-- Options Array -->
        <div formArrayName="options" class="space-y-4">
          <label class="block mb-2 text-sm font-medium text-blue-300">Options</label>
          <div *ngFor="let option of options.controls; let i=index" [formGroupName]="i" 
               class="flex gap-4 items-center p-4 bg-gray-800/30 rounded-lg border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300
                      backdrop-blur-sm group">
            <input type="text" formControlName="option" placeholder="Option" 
                   class="flex-1 p-3 bg-gray-800/50 border border-blue-500/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300">
            <input type="number" formControlName="weightage" placeholder="Weightage" 
                   class="w-32 p-3 bg-gray-800/50 border border-blue-500/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300">
            <button type="button" (click)="removeOption(i)" 
                    class="p-3 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-lg border border-red-500/30 hover:border-red-500/50 transition-all duration-300
                           transform hover:scale-105">
              <span class="font-medium">Remove</span>
            </button>
          </div>
          <button type="button" (click)="addOption()" 
                  class="w-full p-3 bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 rounded-lg border border-blue-500/30 hover:border-blue-500/50 transition-all duration-300
                         transform hover:scale-[1.02]">
            <span class="font-medium">+ Add Option</span>
          </button>
        </div>

        <!-- Submit Button -->
        <button type="submit" [disabled]="!questionForm.valid"
                class="w-full p-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium
                       hover:from-blue-600 hover:to-purple-600 focus:ring-4 focus:ring-blue-500/50 
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-500 disabled:hover:to-purple-500
                       transition-all duration-300 transform hover:scale-[1.02]
                       relative overflow-hidden group">
          <span class="relative z-10">Submit Question</span>
          <div class="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </button>
      </form>
    </div>
  `,
  styles: [`
    .form-group {
      @apply relative overflow-hidden;
    }
    .form-group::after {
      content: '';
      @apply absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 transition-transform duration-300;
    }
    .form-group:focus-within::after {
      @apply scale-x-100;
    }
  `]
})
export class ScenarioQuestionFormComponent implements OnInit {
  questionForm: FormGroup;
  scenarios: Scenario[] = [];
  roles: Role[] = [];
  exercises: Exercise[] = [];
  scenarioInjects: ScenarioInject[] = [];
  readonly clientId = 1;

  constructor(
    private fb: FormBuilder,
    private scenarioQuestionService: ScenarioQuestionService,
    private scenarioService: ScenarioService,
    private roleService: RoleService,
    private exerciseService: ExerciseService,
    private scenarioInjectService: ScenarioInjectService
  ) {
    this.questionForm = this.fb.group({
      scenario_id: ['', Validators.required],
      role_id: ['', Validators.required],
      exercise_id: ['', Validators.required],
      scenario_inject_id: ['', Validators.required],
      question: ['', Validators.required],
      compliance_reference: ['', Validators.required],
      question_type_id: ['', Validators.required],
      options: this.fb.array([])
    });

    this.addOption();
  }

  ngOnInit() {
    this.loadDropdownData();
  }

  loadDropdownData() {
    this.scenarioService.getScenariosByClientId(this.clientId)
      .subscribe({
        next: (scenarios) => this.scenarios = scenarios,
        error: (error) => console.error('Error loading scenarios:', error)
      });
    
    this.roleService.getRolesByClientId(this.clientId)
      .subscribe({
        next: (roles) => this.roles = roles,
        error: (error) => console.error('Error loading roles:', error)
      });
    
    this.exerciseService.getExercisesByClientId(this.clientId)
      .subscribe({
        next: (exercises) => this.exercises = exercises,
        error: (error) => console.error('Error loading exercises:', error)
      });
  }

  onScenarioChange(event: Event) {
    const scenarioId = (event.target as HTMLSelectElement).value;
    if (scenarioId) {
      this.scenarioInjectService.getInjectsByScenarioId(parseInt(scenarioId, 10))
        .subscribe({
          next: (injects) => {
            this.scenarioInjects = injects;
            if (injects.length === 0) {
              this.questionForm.patchValue({ scenario_inject_id: '' });
            }
          },
          error: (error) => console.error('Error loading scenario injects:', error)
        });
    } else {
      this.scenarioInjects = [];
      this.questionForm.patchValue({ scenario_inject_id: '' });
    }
  }

  get options() {
    return this.questionForm.get('options') as FormArray;
  }

  addOption() {
    const optionGroup = this.fb.group({
      option: ['', Validators.required],
      weightage: ['', [Validators.required, Validators.min(0), Validators.max(100)]]
    });
    this.options.push(optionGroup);
  }

  removeOption(index: number) {
    this.options.removeAt(index);
  }

  onSubmit() {
    if (this.questionForm.valid) {
      this.scenarioQuestionService.createScenarioQuestion(this.questionForm.value)
        .subscribe({
          next: (response) => {
            console.log('Question created successfully', response);
            this.questionForm.reset();
            this.options.clear();
            this.addOption();
          },
          error: (error) => {
            console.error('Error creating question', error);
          }
        });
    }
  }
}