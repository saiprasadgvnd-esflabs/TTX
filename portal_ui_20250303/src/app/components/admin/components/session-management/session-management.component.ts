import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import * as QRCode from 'qrcode';

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

// Extended Session interface with QR code properties
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
  // Added properties for QR code functionality
  showQR?: boolean;
  qrCodeDataUrl?: string;
}

@Component({
  selector: 'app-session-management',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="management-section">
      <div class="section-header">
        <div class="header-content">
          <h2>Session Management</h2>
          <button class="add-button" (click)="onAddSession()">
            <i class="fas fa-plus"></i> Create Session
          </button>
        </div>
      </div>
      <div class="list-container">
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Session ID</th>
                <th>Exercise</th>
                <th>Scenario</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Created By</th>
                <th>Status</th>
                <th>Link</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let session of sessions">
                <td>{{ session.session_id }}</td>
                <td>{{ getExerciseName(session.exercise_id) }}</td>
                <td>{{ getScenarioName(session.scenario_id) }}</td>
                <td>{{ session.scheduled_start_time | date : "medium" }}</td>
                <td>{{ session.scheduled_end_time | date : "medium" }}</td>
                <td>{{ session.created_by }}</td>
                <td>
                  <span
                    class="status-badge"
                    [class]="session.is_active ? 'active' : 'completed'"
                  >
                    {{ session.is_active ? "Active" : "Completed" }}
                  </span>
                </td>
                <td>
                  <div class="session-actions">
                    <a (click)="openLink(session)" class="session-link">
                      <i class="fas fa-external-link-alt"></i>
                      Open
                    </a>
                    <button class="qr-btn" (click)="showQRCode(session)">
                      <i class="fas fa-qrcode"></i>
                    </button>
                  </div>
                  
                  <!-- QR Code Modal -->
                  <div class="qr-modal" *ngIf="session.showQR" (click)="hideQRCode(session)">
                    <div class="qr-modal-content" (click)="$event.stopPropagation()">
                      <div class="qr-header">
                        <h3>Scan QR Code</h3>
                        <button class="close-btn" (click)="hideQRCode(session)">
                          <i class="fas fa-times"></i>
                        </button>
                      </div>
                      <div class="qr-body">
                        <img [src]="session.qrCodeDataUrl" alt="QR Code" class="qr-image" *ngIf="session.qrCodeDataUrl">
                        <p class="qr-info">Scan this QR code to open the session link</p>
                        <p class="qr-url">{{ getSessionUrl(session) }}</p>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `,
  styleUrls: ['./session-management.component.css']
})
export class SessionManagementComponent {
  @Input() sessions: Session[] = [];
  @Input() exercises: Exercise[] = [];
  @Input() scenarios: Scenario[] = [];
  @Output() addSession = new EventEmitter<void>();
  @Output() editSession = new EventEmitter<Session>();
  @Output() deleteSession = new EventEmitter<string>();

  constructor(private router: Router) {}

  onAddSession(): void {
    this.addSession.emit();
  }

  onEditSession(session: Session): void {
    this.editSession.emit(session);
  }

  onDeleteSession(id: string): void {
    this.deleteSession.emit(id);
  }

  getExerciseName(exerciseId: number): string {
    const exercise = this.exercises.find(e => e.id === exerciseId);
    return exercise ? exercise.name : 'Unknown Exercise';
  }

  getScenarioName(scenarioId: number): string {
    const scenario = this.scenarios.find(s => s.id === scenarioId);
    return scenario ? scenario.name : 'Unknown Scenario';
  }

  openLink(session: Session): void {
    this.router.navigate([`/login/session/${session.session_id}`]);
  }

  getSessionUrl(session: Session): string {
    return `${window.location.origin}/ttx_app/#/login/session/${session.session_id}`;
  }

  async showQRCode(session: Session): Promise<void> {
    try {
      // Generate QR code for the session URL
      const url = this.getSessionUrl(session);
      const qrCodeDataUrl = await QRCode.toDataURL(url, {
        width: 200,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      // Add QR code data URL and visibility flag to the session object
      session.qrCodeDataUrl = qrCodeDataUrl;
      session.showQR = true;
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  }

  hideQRCode(session: Session): void {
    session.showQR = false;
  }
}