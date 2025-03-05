import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from '@angular/common';
import { ApiService } from "../../services/api.service";
import { io, Socket } from "socket.io-client";

interface NistPhase {
  id: number;
  name: string;
  progress: number;
  active: boolean;
}

interface Team {
  name: string;
  icon: string;
  accuracy: number;
  responseTime: number;
  currentStatus: "success" | "failed" | "pending";
  progressPercentage: number;
  phaseStatus: { [key: string]: "success" | "failed" | "pending" };
  moneySaved: number;
  moneyLost: number;
}

@Component({
  selector: "app-live-dashboard",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./live-dashboard.component.html",
  styleUrls: ["./live-dashboard.component.css"]
})
export class LiveDashboardComponent implements OnInit, OnDestroy {
  nistPhases: NistPhase[] = [
    { id: 1, name: 'Identify', progress: 0, active: true },
    { id: 2, name: 'Protect', progress: 0, active: false },
    { id: 3, name: 'Detect', progress: 0, active: false },
    { id: 4, name: 'Respond', progress: 0, active: false },
    { id: 5, name: 'Recover', progress: 0, active: false }
  ];

  teams: Team[] = [
    {
      name: 'Security Team',
      icon: 'shield-halved',
      accuracy: 85,
      responseTime: 45,
      currentStatus: 'success',
      progressPercentage: 75,
      phaseStatus: {
        'Identify': 'success',
        'Protect': 'pending',
        'Detect': 'pending',
        'Respond': 'pending',
        'Recover': 'pending'
      },
      moneySaved: 250000,
      moneyLost: 50000
    },
    {
      name: 'IT Operations',
      icon: 'network-wired',
      accuracy: 78,
      responseTime: 52,
      currentStatus: 'failed',
      progressPercentage: 30,
      phaseStatus: {
        'Identify': 'success',
        'Protect': 'failed',
        'Detect': 'pending',
        'Respond': 'pending',
        'Recover': 'pending'
      },
      moneySaved: 150000,
      moneyLost: 200000
    }
  ];

  showCelebration = false;
  private socket!: Socket;
  private sessionId = "40a6cfab-dc29-4287-89c1-846963b412ce"; // Replace with actual session ID
  private baseUrl = 'https://esflabs.ai/ttx';

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    // Connect to WebSocket with error handling and reconnection
    this.initializeWebSocket();
    this.loadDashboardData();
  }

  private initializeWebSocket() {
    try {
      this.socket = io(this.baseUrl, {
        path: '/ttx/socket.io',
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        transports: ['websocket', 'polling']
      });

      this.socket.on('connect', () => {
        console.log('WebSocket connected successfully');
      });

      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', reason);
      });

      this.socket.on("live-dashboard-update", (data) => {
        this.updateDashboard(data);
      });
    } catch (error) {
      console.error('Error initializing WebSocket:', error);
    }
  }

  loadDashboardData() {
    this.apiService.getLiveDashboardData(this.sessionId).subscribe(
      (data) => {
        if (data) {
          this.updateDashboard(data);
        }
      }
    );
  }

  updateDashboard(data: any) {
    if (data.nistPhases) {
      this.nistPhases = data.nistPhases;
    }
    if (data.teams) {
      this.teams = data.teams;
    }
  }

  getFlightPosition(): number {
    const activePhase = this.nistPhases.find(phase => phase.active);
    if (!activePhase) return 0;
    
    const phaseIndex = this.nistPhases.indexOf(activePhase);
    const phaseWidth = 100 / this.nistPhases.length;
    return phaseIndex * phaseWidth + (phaseWidth * (activePhase.progress / 100));
  }

  getFlightClass(): string {
    const lastPhase = this.nistPhases[this.nistPhases.length - 1];
    
    if (!this.nistPhases[0].active) {
      return 'grounded';
    } else if (lastPhase.progress === 100) {
      return 'takeoff';
    }
    return 'flying';
  }

  getNetAmount(team: Team): number {
    return team.moneySaved - team.moneyLost;
  }

  getStatusColor(status: 'success' | 'failed' | 'pending'): string {
    switch (status) {
      case 'success': return '#4CAF50';
      case 'failed': return '#FF4D4D';
      case 'pending': return '#9E9E9E';
      default: return '#9E9E9E';
    }
  }

  ngOnDestroy() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}