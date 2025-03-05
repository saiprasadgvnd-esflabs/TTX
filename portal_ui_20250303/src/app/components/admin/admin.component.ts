import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../services/api.service';
import { Nist } from '../../models/exercise.interface';

// Component imports
import { ClientManagementComponent } from './components/client-management/client-management.component';
import { RoleManagementComponent } from './components/role-management/role-management.component';
import { TeamManagementComponent } from './components/team-management/team-management.component';
import { ExerciseManagementComponent } from './components/exercise-management/exercise-management.component';
import { ScenarioManagementComponent } from './components/scenario-management/scenario-management.component';
import { InjectManagementComponent } from './components/inject-management/inject-management.component';
import { QuestionManagementComponent } from './components/question-management/question-management.component';
import { SessionManagementComponent } from './components/session-management/session-management.component';
import { PopupFormComponent } from './components/popup-form/popup-form.component';

interface Client {
  id: number;
  name: string;
}

interface Role {
  id: number;
  client_id: number;
  name: string;
  selected?: boolean;
}

interface Team {
  id: number;
  client_id: number;
  name: string;
  role_id: number[]; // Changed from assigned_role_ids to role_id to match API response
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

interface Question {
  id: number;
  scenario_inject_id: number;
  question: string;
  options: Array<{
    option: string;
    is_correct: boolean;
  }>;
  nist_framework_id: number[];
  swot_category_id?: number | null;
  question_category_id?: number | null;
  question_type_id?: number;
  role_id?: number | null; // Single role ID
  role_ids?: number[] | null; // For backward compatibility with multiple roles
  compliance_reference?: string;
}

interface Session {
  session_id: string;
  exercise_id: number;
  scenario_id: number;
  link: string;
  scheduled_start_time: string;
  scheduled_end_time: string;
  created_by: string;
  created_on: string;
  is_active: boolean;
}

interface SwotCategory {
  id: number;
  name: string;
  description: string;
}

interface QuestionCategory {
  id: number;
  name: string;
  description: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    ClientManagementComponent,
    RoleManagementComponent,
    TeamManagementComponent,
    ExerciseManagementComponent,
    ScenarioManagementComponent,
    InjectManagementComponent,
    QuestionManagementComponent,
    SessionManagementComponent,
    PopupFormComponent
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit, OnDestroy {
  activeTab: 'clients' | 'roles' | 'teams' | 'exercises' | 'scenarios' | 'injects' | 'questions' | 'sessions' = 'clients';
  showForm = false;
  currentForm: string | null = null;

  // Data arrays
  clients: Client[] = [];
  roles: Role[] = [];
  teams: Team[] = [];
  exercises: Exercise[] = [];
  scenarios: Scenario[] = [];
  scenarioInjects: ScenarioInject[] = [];
  questions: Question[] = [];
  sessions: Session[] = [];
  nistFrameworks: Nist[] = [];
  swotCategories: SwotCategory[] = [];
  questionCategories: QuestionCategory[] = [];

  // Filtered arrays for cascading dropdowns
  filteredScenarios: Scenario[] = [];
  filteredInjects: ScenarioInject[] = [];
  filteredRoles: Role[] = [];

  // Form models
  newClient = {
    name: ''
  };

  newRole = {
    name: '',
    client_id: ''
  };

  newTeam = {
    name: '',
    client_id: '',
    role_id: [] as number[] // Changed from assigned_role_ids to role_id to match API response
  };

  newExercise = {
    name: '',
    time: 0,
    exercise_simulated_amount: 0,
    client_id: ''
  };

  newScenario = {
    name: '',
    client_id: '',
    exercise_id: '',
    description: ''
  };

  newScenarioInject = {
    scenario_id: '',
    name: '',
    data: {
      situation: {
        description: '',
        type: 'external'
      },
      impact: {
        description: '',
        type: 'external'
      },
      action_required: {
        description: '',
        type: 'external'
      }
    }
  };

  newQuestion = {
    scenario_inject_id: '',
    question: '',
    options: [
      { option: '', is_correct: true },
      { option: '', is_correct: false },
      { option: '', is_correct: false },
      { option: '', is_correct: false }
    ],
    nist_framework_id: [] as number[],
    swot_category_id: null as number | null,
    question_category_id: null as number | null,
    question_type_id: 1, // Default question type ID set to 1
    execrise_id: '', // Added for cascading dropdowns
    scenario_id: '',  // Added for cascading dropdowns
    role_id: null as number | null, // Single role ID
    compliance_reference: '' // Added compliance reference field
  };

  newSession = {
    exercise_id: '',
    scenario_id: '',
    scheduled_start_time: '',
    scheduled_end_time: '',
    created_by: ''
  };

  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.loadAllData();
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  loadAllData() {
    this.loadClients();
    this.loadRoles();
    this.loadTeams();
    this.loadExercises();
    this.loadScenarios();
    this.loadScenarioInjects();
    this.loadQuestions();
    this.loadSessions();
    this.loadNistFrameworks();
    this.loadSwotCategories();
    this.loadQuestionCategories();
  }

  // Tab Management
  setActiveTab(tab: 'clients' | 'roles' | 'teams' | 'exercises' | 'scenarios' | 'injects' | 'questions' | 'sessions') {
    this.activeTab = tab;
    if (this.showForm) {
      this.closeForm();
    }
  }

  // Form Management
  openForm(type: string) {
    this.currentForm = type;
    this.showForm = true;
    this.resetForm();
    
    // If opening question form, set default exercise if available
    if (type === 'question' && this.exercises.length > 0) {
      this.newQuestion.execrise_id = this.exercises[0].id.toString();
      this.onExerciseChange();
    }
  }

  closeForm() {
    this.showForm = false;
    this.currentForm = null;
    this.resetForm();
  }

  getFormTitle(): string {
    switch (this.currentForm) {
      case 'client': return 'Add New Client';
      case 'role': return 'Add New Role';
      case 'team': return 'Add New Team';
      case 'exercise': return 'Add New Exercise';
      case 'scenario': return 'Add New Scenario';
      case 'inject': return 'Add New Inject';
      case 'question': return 'Add New Question';
      case 'session': return 'Create New Session';
      default: return '';
    }
  }

  resetForm() {
    switch (this.currentForm) {
      case 'client':
        this.newClient = { name: '' };
        break;
      case 'role':
        this.newRole = {
          name: '',
          client_id: ''
        };
        break;
      case 'team':
        this.newTeam = {
          name: '',
          client_id: '',
          role_id: []
        };
        this.filteredRoles = [];
        break;
      case 'exercise':
        this.newExercise = {
          name: '',
          time: 0,
          exercise_simulated_amount: 0,
          client_id: ''
        };
        break;
      case 'scenario':
        this.newScenario = {
          name: '',
          client_id: '',
          exercise_id: '',
          description: ''
        };
        break;
      case 'inject':
        this.newScenarioInject = {
          scenario_id: '',
          name: '',
          data: {
            situation: { description: '', type: 'external' },
            impact: { description: '', type: 'external' },
            action_required: { description: '', type: 'external' }
          }
        };
        break;
      case 'question':
        this.newQuestion = {
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
          execrise_id: this.exercises.length > 0 ? this.exercises[0].id.toString() : '',
          scenario_id: '',
          role_id: null, // Single role ID
          compliance_reference: ''
        };
        // Initialize cascading dropdowns if exercises exist
        if (this.exercises.length > 0) {
          this.onExerciseChange();
        }
        break;
      case 'session':
        this.newSession = {
          exercise_id: '',
          scenario_id: '',
          scheduled_start_time: '',
          scheduled_end_time: '',
          created_by: ''
        };
        break;
    }
  }

  // Data Loading
  loadClients() {
    this.http.get<Client[]>('https://esflabs.ai/ttx/clients')
      .subscribe({
        next: (data) => this.clients = data,
        error: (error) => console.error('Error loading clients:', error)
      });
  }

  loadRoles() {
    this.http.get<Role[]>('https://esflabs.ai/ttx/roles')
      .subscribe({
        next: (data) => this.roles = data,
        error: (error) => console.error('Error loading roles:', error)
      });
  }

  loadTeams() {
    this.http.get<Team[]>('https://esflabs.ai/ttx/teams')
      .subscribe({
        next: (data) => this.teams = data,
        error: (error) => console.error('Error loading teams:', error)
      });
  }

  loadExercises() {
    this.http.get<Exercise[]>('https://esflabs.ai/ttx/exercises')
      .subscribe({
        next: (data) => this.exercises = data,
        error: (error) => console.error('Error loading exercises:', error)
      });
  }

  loadScenarios() {
    this.http.get<Scenario[]>('https://esflabs.ai/ttx/scenarios')
      .subscribe({
        next: (data) => {
          this.scenarios = data;
          // If we're in the question form, update filtered scenarios
          if (this.currentForm === 'question' && this.newQuestion.execrise_id) {
            this.onExerciseChange();
          }
        },
        error: (error) => console.error('Error loading scenarios:', error)
      });
  }

  loadScenarioInjects() {
    this.http.get<ScenarioInject[]>('https://esflabs.ai/ttx/scenario-injects')
      .subscribe({
        next: (data) => {
          this.scenarioInjects = data;
          // If we're in the question form, update filtered injects
          if (this.currentForm === 'question' && this.newQuestion.scenario_id) {
            this.onScenarioChange();
          }
        },
        error: (error) => console.error('Error loading scenario injects:', error)
      });
  }

  loadQuestions() {
    this.http.get<Question[]>('https://esflabs.ai/ttx/scenario-questions')
      .subscribe({
        next: (data) => this.questions = data,
        error: (error) => console.error('Error loading questions:', error)
      });
  }

  loadSessions() {
    this.http.get<Session[]>('https://esflabs.ai/ttx/exercise-session')
      .subscribe({
        next: (data) => this.sessions = data,
        error: (error) => console.error('Error loading sessions:', error)
      });
  }

  loadNistFrameworks() {
    this.apiService.getNistFrameworks()
      .subscribe({
        next: (data) => this.nistFrameworks = data,
        error: (error) => console.error('Error loading NIST frameworks:', error)
      });
  }

  loadSwotCategories() {
    this.http.get<SwotCategory[]>('https://esflabs.ai/ttx/swot')
      .subscribe({
        next: (data) => this.swotCategories = data,
        error: (error) => console.error('Error loading SWOT categories:', error)
      });
  }

  loadQuestionCategories() {
    this.http.get<QuestionCategory[]>('https://esflabs.ai/ttx/question-categories')
      .subscribe({
        next: (data) => this.questionCategories = data,
        error: (error) => console.error('Error loading question categories:', error)
      });
  }

  loadRolesForClient(clientId: number) {
    this.http.get<Role[]>(`https://esflabs.ai/ttx/roles/client/${clientId}`)
      .subscribe({
        next: (data) => {
          // Reset selected state for all roles
          this.filteredRoles = data.map(role => ({
            ...role,
            selected: false
          }));
          console.log("Loaded roles for client:", this.filteredRoles);
        },
        error: (error) => console.error('Error loading roles for client:', error)
      });
  }

  // Form Submission
  submitForm() {
    switch (this.currentForm) {
      case 'client':
        this.createClient();
        break;
      case 'role':
        this.createRole();
        break;
      case 'team':
        this.createTeam();
        break;
      case 'exercise':
        this.createExercise();
        break;
      case 'scenario':
        this.createScenario();
        break;
      case 'inject':
        this.createScenarioInject();
        break;
      case 'question':
        this.createQuestion();
        break;
      case 'session':
        this.createSession();
        break;
    }
  }

  // Create Operations
  createClient() {
    if (!this.newClient.name) return;

    this.http.post('https://esflabs.ai/ttx/clients', this.newClient)
      .subscribe({
        next: () => {
          this.loadClients();
          this.closeForm();
        },
        error: (error) => console.error('Error creating client:', error)
      });
  }

  createRole() {
    if (!this.isRoleFormValid()) return;

    const roleData = {
      ...this.newRole,
      client_id: parseInt(this.newRole.client_id)
    };

    this.http.post('https://esflabs.ai/ttx/roles', roleData)
      .subscribe({
        next: () => {
          this.loadRoles();
          this.closeForm();
        },
        error: (error) => console.error('Error creating role:', error)
      });
  }

  createTeam() {
    if (!this.isTeamFormValid()) return;

    const teamData = {
      ...this.newTeam,
      client_id: parseInt(this.newTeam.client_id)
    };

    this.http.post('https://esflabs.ai/ttx/teams', teamData)
      .subscribe({
        next: () => {
          this.loadTeams();
          this.closeForm();
        },
        error: (error) => console.error('Error creating team:', error)
      });
  }

  createExercise() {
    if (!this.isExerciseFormValid()) return;

    const exerciseData = {
      ...this.newExercise,
      client_id: parseInt(this.newExercise.client_id)
    };

    this.http.post('https://esflabs.ai/ttx/exercises', exerciseData)
      .subscribe({
        next: () => {
          this.loadExercises();
          this.closeForm();
        },
        error: (error) => console.error('Error creating exercise:', error)
      });
  }

  createScenario() {
    if (!this.isScenarioFormValid()) return;

    const scenarioData = {
      ...this.newScenario,
      client_id: parseInt(this.newScenario.client_id),
      exercise_id: parseInt(this.newScenario.exercise_id)
    };

    this.http.post('https://esflabs.ai/ttx/scenarios', scenarioData)
      .subscribe({
        next: () => {
          this.loadScenarios();
          this.closeForm();
        },
        error: (error) => console.error('Error creating scenario:', error)
      });
  }

  createScenarioInject() {
    if (!this.isScenarioInjectFormValid()) return;

    const injectData = {
      ...this.newScenarioInject,
      scenario_id: parseInt(this.newScenarioInject.scenario_id)
    };

    this.http.post('https://esflabs.ai/ttx/scenario-injects', injectData)
      .subscribe({
        next: () => {
          this.loadScenarioInjects();
          this.closeForm();
        },
        error: (error) => console.error('Error creating scenario inject:', error)
      });
  }

  createQuestion() {
    if (!this.isQuestionFormValid()) return;

    // Get selected role ID
    const selectedRole = this.filteredRoles.find(role => role.selected);
    const roleId = selectedRole ? selectedRole.id : null;

    const questionData = {
      ...this.newQuestion,
      scenario_inject_id: parseInt(this.newQuestion.scenario_inject_id),
      options: this.newQuestion.options.filter(opt => opt.option.trim() !== ''),
      swot_category_id: this.newQuestion.swot_category_id,
      question_category_id: this.newQuestion.question_category_id,
      question_type_id: 1, // Always set question_type_id to 1
      role_id: roleId, // Use single role_id instead of role_ids array
      compliance_reference: this.newQuestion.compliance_reference // Include compliance reference in the payload
    };

    console.log("Submitting question with data:", questionData);

    this.http.post('https://esflabs.ai/ttx/scenario-questions', questionData)
      .subscribe({
        next: () => {
          this.loadQuestions();
          this.closeForm();
        },
        error: (error) => {
          console.error('Error creating question:', error);
          alert('Error creating question: ' + (error.message || 'Unknown error'));
        }
      });
  }

  createSession() {
    if (!this.isSessionFormValid()) return;

    const sessionData = {
      ...this.newSession,
      exercise_id: parseInt(this.newSession.exercise_id),
      scenario_id: parseInt(this.newSession.scenario_id)
    };

    this.http.post('https://esflabs.ai/ttx/exercise-session', sessionData)
      .subscribe({
        next: () => {
          this.loadSessions();
          this.closeForm();
        },
        error: (error) => console.error('Error creating session:', error)
      });
  }

  // Edit Operations
  editItem(type: string, item: any) {
    this.currentForm = type;
    this.showForm = true;

    switch (type) {
      case 'client':
        this.newClient = { ...item };
        break;
      case 'role':
        this.newRole = { ...item };
        break;
      case 'team':
        this.newTeam = { ...item };
        // Load roles for the client
        if (item.client_id) {
          this.loadRolesForClient(item.client_id);
        }
        break;
      case 'exercise':
        this.newExercise = { ...item };
        break;
      case 'scenario':
        this.newScenario = { ...item };
        break;
      case 'inject':
        this.newScenarioInject = { ...item };
        break;
      case 'question':
        // Find the inject to get scenario_id and exercise_id
        const inject = this.scenarioInjects.find(i => i.id === item.scenario_inject_id);
        const scenario = inject ? this.scenarios.find(s => s.id === inject.scenario_id) : null;
        
        this.newQuestion = { 
          ...item,
          question_type_id: item.question_type_id || 1, // Ensure question_type_id is set when editing
          scenario_id: inject ? inject.scenario_id.toString() : '',
          execrise_id: scenario ? scenario.execrise_id.toString() : '',
          role_id: item.role_id || null, // Use role_id instead of role_ids
          compliance_reference: item.compliance_reference || ''
        };
        
        // Update filtered lists
        if (this.newQuestion.execrise_id) {
          this.onExerciseChange();
        }
        if (this.newQuestion.scenario_id) {
          this.onScenarioChange();
        }
        
        // Load roles for the client and mark selected one
        if (scenario) {
          this.loadRolesForClient(scenario.client_id);
          // We'll need to update the selected state after roles are loaded
          setTimeout(() => {
            if (item.role_id !== undefined && item.role_id !== null && this.filteredRoles.length > 0) {
              this.filteredRoles.forEach(role => {
                role.selected = role.id === item.role_id;
              });
            }
          }, 500);
        }
        break;
      case 'session':
        this.newSession = { ...item };
        break;
    }
  }

  // Delete Operations
  deleteItem(type: string, id: number | string) {
    const endpoint = this.getDeleteEndpoint(type, id);
    if (!endpoint) return;

    if (confirm('Are you sure you want to delete this item?')) {
      this.http.delete(endpoint)
        .subscribe({
          next: () => this.refreshAfterDelete(type),
          error: (error) => console.error(`Error deleting ${type}:`, error)
        });
    }
  }

  getDeleteEndpoint(type: string, id: number | string): string {
    const baseUrl = 'https://esflabs.ai/ttx';
    switch (type) {
      case 'client': return `${baseUrl}/clients/${id}`;
      case 'role': return `${baseUrl}/roles/${id}`;
      case 'team': return `${baseUrl}/teams/${id}`;
      case 'exercise': return `${baseUrl}/exercises/${id}`;
      case 'scenario': return `${baseUrl}/scenarios/${id}`;
      case 'inject': return `${baseUrl}/scenario-injects/${id}`;
      case 'question': return `${baseUrl}/scenario-questions/${id}`;
      case 'session': return `${baseUrl}/exercise-session/${id}`;
      default: return '';
    }
  }

  refreshAfterDelete(type: string) {
    switch (type) {
      case 'client': this.loadClients(); break;
      case 'role': this.loadRoles(); break;
      case 'team': this.loadTeams(); break;
      case 'exercise': this.loadExercises(); break;
      case 'scenario': this.loadScenarios(); break;
      case 'inject': this.loadScenarioInjects(); break;
      case 'question': this.loadQuestions(); break;
      case 'session': this.loadSessions(); break;
    }
  }

  // Helper Methods
  getClientName(clientId: number): string {
    const client = this.clients.find(c => c.id === clientId);
    return client ? client.name : 'Unknown Client';
  }

  getExerciseName(exerciseId: number): string {
    const exercise = this.exercises.find(e => e.id === exerciseId);
    return exercise ? exercise.name : 'Unknown Exercise';
  }

  getScenarioName(scenarioId: number): string {
    const scenario = this.scenarios.find(s => s.id === scenarioId);
    return scenario ? scenario.name : 'Unknown Scenario';
  }

  getInjectName(injectId: number): string {
    const inject = this.scenarioInjects.find(i => i.id === injectId);
    return inject ? inject.name : 'Unknown Inject';
  }

  getNistFramework(id: number): string {
    const framework = this.nistFrameworks.find(f => f.id === id);
    return framework ? framework.name : '';
  }

  getSwotCategoryName(id: number | null | undefined): string {
    if (id === undefined || id === null) return 'None';
    const category = this.swotCategories.find(c => c.id === id);
    return category ? category.name : 'Unknown';
  }

  getQuestionCategoryName(id: number | null | undefined): string {
    if (id === undefined || id === null) return 'None';
    const category = this.questionCategories.find(c => c.id === id);
    return category ? category.name : 'Unknown';
  }

  getRoleName(id: number | null | undefined): string {
    if (id === undefined || id === null) return 'None';
    const role = this.roles.find(r => r.id === id);
    return role ? role.name : 'Unknown';
  }

  // Team-specific methods
  onTeamClientChange() {
    if (!this.newTeam.client_id) {
      this.filteredRoles = [];
      return;
    }

    const clientId = parseInt(this.newTeam.client_id);
    this.loadRolesForClient(clientId);
    this.newTeam.role_id = []; // Reset selected roles
  }

  isRoleSelected(roleId: number): boolean {
    return this.newTeam.role_id.includes(roleId);
  }

  toggleRoleForTeam(roleId: number) {
    const index = this.newTeam.role_id.indexOf(roleId);
    if (index === -1) {
      this.newTeam.role_id.push(roleId);
    } else {
      this.newTeam.role_id.splice(index, 1);
    }
  }

  // Toggle role selection for questions
  toggleRoleSelection(role: Role) {
    // Deselect all other roles first (single selection)
    this.filteredRoles.forEach(r => {
      r.selected = false;
    });
    
    // Then select the clicked role
    role.selected = true;
  }

  // Select all roles at once for questions
  selectAllRoles() {
    // This function is no longer needed for single role selection
    // But we'll keep it for backward compatibility
    alert("Questions can only be assigned to a single role. Please select one role.");
  }

  // Form Validation
  isRoleFormValid(): boolean {
    return !!(
      this.newRole.name &&
      this.newRole.client_id
    );
  }

  isTeamFormValid(): boolean {
    return !!(
      this.newTeam.name &&
      this.newTeam.client_id &&
      this.newTeam.role_id.length > 0
    );
  }

  isExerciseFormValid(): boolean {
    return !!(
      this.newExercise.name &&
      this.newExercise.time &&
      this.newExercise.exercise_simulated_amount &&
      this.newExercise.client_id
    );
  }

  isScenarioFormValid(): boolean {
    return !!(
      this.newScenario.name &&
      this.newScenario.client_id &&
      this.newScenario.exercise_id &&
      this.newScenario.description
    );
  }

  isScenarioInjectFormValid(): boolean {
    return !!(
      this.newScenarioInject.scenario_id &&
      this.newScenarioInject.name &&
      this.newScenarioInject.data.situation.description &&
      this.newScenarioInject.data.impact.description &&
      this.newScenarioInject.data.action_required.description
    );
  }

  isQuestionFormValid(): boolean {
    const hasValidOptions = this.newQuestion.options.filter(opt => opt.option.trim() !== '').length >= 2;
    const hasCorrectAnswer = this.newQuestion.options.some(opt => opt.is_correct);
    
    return !!(
      this.newQuestion.scenario_inject_id &&
      this.newQuestion.question &&
      hasValidOptions &&
      hasCorrectAnswer &&
      this.newQuestion.nist_framework_id.length > 0
    );
  }

  isSessionFormValid(): boolean {
    return !!(
      this.newSession.exercise_id &&
      this.newSession.scenario_id &&
      this.newSession.scheduled_start_time &&
      this.newSession.scheduled_end_time &&
      this.newSession.created_by
    );
  }

  // Question-specific Methods
  setCorrectOption(index: number) {
    this.newQuestion.options.forEach((option, i) => {
      option.is_correct = (i === index);
    });
  }

  toggleNistFramework(id: number) {
    console.log("Toggling NIST framework:", id);
    const index = this.newQuestion.nist_framework_id.indexOf(id);
    if (index === -1) {
      this.newQuestion.nist_framework_id.push(id);
    } else {
      this.newQuestion.nist_framework_id.splice(index, 1);
    }
  }

  isNistFrameworkSelected(id: number): boolean {
    return this.newQuestion.nist_framework_id.includes(id);
  }

  // Cascading dropdown methods
  onExerciseChange() {
    console.log("Exercise changed to:", this.newQuestion.execrise_id);
    
    if (!this.newQuestion.execrise_id) {
      this.filteredScenarios = [];
      this.filteredInjects = [];
      this.filteredRoles = [];
      this.newQuestion.scenario_id = '';
      this.newQuestion.scenario_inject_id = '';
      this.newQuestion.role_id = null;
      return;
    }

    const exerciseId = parseInt(this.newQuestion.execrise_id);
    
    // Find the exercise to get client_id
    const exercise = this.exercises.find(e => e.id === exerciseId);
    if (exercise) {
      // Load roles for this client
      this.loadRolesForClient(exercise.client_id);
    }
    
    // Filter scenarios by exercise_id
    this.filteredScenarios = this.scenarios.filter(s => s.execrise_id === exerciseId);
    console.log("Filtered scenarios:", this.filteredScenarios);
    
    // Reset scenario and inject selections
    if (this.filteredScenarios.length > 0) {
      this.newQuestion.scenario_id = this.filteredScenarios[0].id.toString();
      this.onScenarioChange();
    } else {
      this.newQuestion.scenario_id = '';
      this.filteredInjects = [];
      this.newQuestion.scenario_inject_id = '';
    }
  }

  onScenarioChange() {
    console.log("Scenario changed to:", this.newQuestion.scenario_id);
    
    if (!this.newQuestion.scenario_id) {
      this.filteredInjects = [];
      this.newQuestion.scenario_inject_id = '';
      return;
    }

    const scenarioId = parseInt(this.newQuestion.scenario_id);
    
    // Filter injects by scenario_id
    this.filteredInjects = this.scenarioInjects.filter(i => i.scenario_id === scenarioId);
    console.log("Filtered injects:", this.filteredInjects);
    
    // Set default inject if available
    if (this.filteredInjects.length > 0) {
      this.newQuestion.scenario_inject_id = this.filteredInjects[0].id.toString();
    } else {
      this.newQuestion.scenario_inject_id = '';
    }
  }
}