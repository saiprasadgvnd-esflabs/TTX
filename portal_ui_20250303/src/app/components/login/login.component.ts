import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Role, Exercise, Scenario } from '../../models/role.interface';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls:['./login.component.css']
})
export class LoginComponent {
  name: string = '';
  selectedRole: string = '';
  selectedExercise: string = '';
  selectedScenario: string = '';
  roles: Role[] = [];
  exercises: Exercise = {} as Exercise;
  scenarios: Scenario = {} as Scenario;
  session_id:string = ''
  constructor(
    private router: Router,
    private apiService: ApiService,
    private route:ActivatedRoute
  ) {
    this.loadData();
  }

  loadData() {
    this.session_id = this.route.snapshot.params["session_id"];
    
    this.apiService.getExerciseSession(this.session_id).subscribe((data:any)=>{
      console.log(data)
      this.apiService.getRoles(data.client_id).subscribe(roles => this.roles = roles);
      this.apiService.getExercisesByID(data.exercise_id).subscribe(exercises => {
        this.exercises = exercises
        this.selectedExercise = String(exercises.id)
      });
      this.apiService.getScenariosByID(data.scenario_id).subscribe(scenarios => {
        this.scenarios = scenarios
        this.selectedScenario = String(scenarios.id)
      });
      console.log(this.scenarios)
    })
    
  }

  isFormValid(): boolean {
    return !!(this.name && this.selectedRole && this.selectedExercise && this.selectedScenario);
  }

  onSubmit() {
    if (this.isFormValid()) {
      var body = {
        exercise_scenario_session_id: this.session_id,
        user_name:this.name,
        role_id:this.selectedRole
      }
      this.apiService.createUserSession(body).subscribe((data:any)=>{
        console.log(data)
        this.router.navigate([`/exercise/session/${data.userSession.session_id}`], {
        
      });
    })
      
    }
  }
}