import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  client_id: number;
  name: string;
  role_id: number[]; // Changed from assigned_role_ids to role_id to match API response
}

@Component({
  selector: 'app-team-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="management-section">
      <div class="section-header">
        <div class="header-content">
          <h2>Team Management</h2>
          <div class="header-actions">
            <div class="client-filter">
              <select [(ngModel)]="selectedClientId" (change)="filterTeamsByClient()">
                <option value="">All Clients</option>
                <option *ngFor="let client of clients" [value]="client.id">
                  {{ client.name }}
                </option>
              </select>
            </div>
            <button class="add-button" (click)="onAddTeam()">
              <i class="fas fa-plus"></i> Add Team
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
                <th>Name</th>
                <th>Client</th>
                <th>Assigned Roles</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let team of filteredTeams">
                <td>{{ team.id }}</td>
                <td>{{ team.name }}</td>
                <td>{{ getClientName(team.client_id) }}</td>
                <td>
                  <div class="role-badges">
                    <span class="role-badge" *ngFor="let roleId of team.role_id">
                      {{ getRoleName(roleId) }}
                    </span>
                  </div>
                </td>
                <td>
                  <button class="action-btn edit" (click)="onEditTeam(team)">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="action-btn delete" (click)="onDeleteTeam(team.id)">
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
  styleUrls: ['./team-management.component.css']
})
export class TeamManagementComponent {
  @Input() teams: Team[] = [];
  @Input() clients: Client[] = [];
  @Input() roles: Role[] = [];
  @Output() addTeam = new EventEmitter<void>();
  @Output() editTeam = new EventEmitter<Team>();
  @Output() deleteTeam = new EventEmitter<number>();

  selectedClientId: string = '';
  filteredTeams: Team[] = [];

  ngOnInit() {
    this.filteredTeams = [...this.teams];
  }

  ngOnChanges() {
    this.filterTeamsByClient();
  }

  filterTeamsByClient() {
    if (!this.selectedClientId) {
      this.filteredTeams = [...this.teams];
    } else {
      const clientId = parseInt(this.selectedClientId);
      this.filteredTeams = this.teams.filter(team => team.client_id === clientId);
    }
  }

  onAddTeam(): void {
    this.addTeam.emit();
  }

  onEditTeam(team: Team): void {
    this.editTeam.emit(team);
  }

  onDeleteTeam(id: number): void {
    this.deleteTeam.emit(id);
  }

  getClientName(clientId: number): string {
    const client = this.clients.find(c => c.id === clientId);
    return client ? client.name : 'Unknown Client';
  }

  getRoleName(roleId: number): string {
    const role = this.roles.find(r => r.id === roleId);
    return role ? role.name : 'Unknown Role';
  }
}