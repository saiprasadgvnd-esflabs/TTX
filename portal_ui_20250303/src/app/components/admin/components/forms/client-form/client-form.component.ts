import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Client {
  name: string;
}

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="form-content">
      <div class="form-group">
        <label for="clientName">Client Name</label>
        <input
          type="text"
          id="clientName"
          [(ngModel)]="client.name"
          name="clientName"
          required
        />
      </div>
    </div>
  `
})
export class ClientFormComponent {
  @Input() client: Client = { name: '' };
  @Output() clientChange = new EventEmitter<Client>();

  ngOnChanges(): void {
    this.clientChange.emit(this.client);
  }
}