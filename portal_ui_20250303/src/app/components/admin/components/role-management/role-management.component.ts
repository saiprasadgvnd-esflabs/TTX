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

@Component({
  selector: 'app-role-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="management-section">
      <div class="section-header">
        <div class="header-content">
          <h2>Role Management</h2>
          <div class="header-actions">
            <div class="client-filter">
              <select [(ngModel)]="selectedClientId" (change)="filterRolesByClient()">
                <option value="">All Clients</option>
                <option *ngFor="let client of clients" [value]="client.id">
                  {{ client.name }}
                </option>
              </select>
            </div>
            <button class="add-button" (click)="onAddRole()">
              <i class="fas fa-plus"></i> Add Role
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let role of filteredRoles">
                <td>{{ role.id }}</td>
                <td>{{ role.name }}</td>
                <td>{{ getClientName(role.client_id) }}</td>
                <td>
                  <button class="action-btn edit" (click)="onEditRole(role)">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="action-btn delete" (click)="onDeleteRole(role.id)">
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
  styleUrls: ['./role-management.component.css']
})
export class RoleManagementComponent {
  @Input() roles: Role[] = [];
  @Input() clients: Client[] = [];
  @Output() addRole = new EventEmitter<void>();
  @Output() editRole = new EventEmitter<Role>();
  @Output() deleteRole = new EventEmitter<number>();

  selectedClientId: string = '';
  filteredRoles: Role[] = [];

  ngOnInit() {
    this.filteredRoles = [...this.roles];
  }

  ngOnChanges() {
    this.filterRolesByClient();
  }

  filterRolesByClient() {
    if (!this.selectedClientId) {
      this.filteredRoles = [...this.roles];
    } else {
      const clientId = parseInt(this.selectedClientId);
      this.filteredRoles = this.roles.filter(role => role.client_id === clientId);
    }
  }

  onAddRole(): void {
    this.addRole.emit();
  }

  onEditRole(role: Role): void {
    this.editRole.emit(role);
  }

  onDeleteRole(id: number): void {
    this.deleteRole.emit(id);
  }

  getClientName(clientId: number): string {
    const client = this.clients.find(c => c.id === clientId);
    return client ? client.name : 'Unknown Client';
  }
}