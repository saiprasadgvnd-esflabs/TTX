import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Client {
  id: number;
  name: string;
}

@Component({
  selector: 'app-client-management',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="management-section">
      <div class="section-header">
        <div class="header-content">
          <h2>Client Management</h2>
          <button class="add-button" (click)="onAddClient()">
            <i class="fas fa-plus"></i> Add Client
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let client of clients">
                <td>{{ client.id }}</td>
                <td>{{ client.name }}</td>
                <td>
                  <button class="action-btn edit" (click)="onEditClient(client)">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="action-btn delete" (click)="onDeleteClient(client.id)">
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
  styleUrls: ['./client-management.component.css']
})
export class ClientManagementComponent {
  @Input() clients: Client[] = [];
  @Output() addClient = new EventEmitter<void>();
  @Output() editClient = new EventEmitter<Client>();
  @Output() deleteClient = new EventEmitter<number>();

  onAddClient(): void {
    this.addClient.emit();
  }

  onEditClient(client: Client): void {
    this.editClient.emit(client);
  }

  onDeleteClient(id: number): void {
    this.deleteClient.emit(id);
  }
}