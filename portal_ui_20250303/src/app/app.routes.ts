import { Routes } from '@angular/router';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { LoginComponent } from './components/login/login.component';
import { ExerciseComponent } from './components/exercise/exercise.component';
import { ResultsComponent } from './components/results/results.component';
import { ObserverDashboardComponent } from './components/observer-dashboard/observer-dashboard.component';
import { LiveDashboardComponent } from './components/live-dashboard/live-dashboard.component';
import { AdminComponent } from './components/admin/admin.component';
import { PreOnboardingComponent } from './components/pre-onboarding/pre-onboarding.component';
import { TeamReportComponent } from './components/team-report/team-report.component';
import { OrgReportComponent } from './components/org-report/org-report.component';

export const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'login/session/:session_id', component: LoginComponent },
  { path: 'exercise/session/:user_session_id', component: ExerciseComponent },
  { path: 'results/session/:session_id', component: ResultsComponent },
  { path: 'observer', component: ObserverDashboardComponent },
  { path: 'live', component: LiveDashboardComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'pre-onboarding', component: PreOnboardingComponent },
  { path: 'team-report', component: TeamReportComponent },
  { path: 'team-report/session/:session_id', component: TeamReportComponent },
  { path: 'org-report', component: OrgReportComponent },
  { path: 'org-report/session/:session_id', component: OrgReportComponent }
];