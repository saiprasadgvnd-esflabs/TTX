import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

interface ParticipantData {
  id: string;
  name: string;
  department: string;
  role: string;
  currentQuestion: number;
  totalQuestions: number;
  correctAnswers: number;
  averageResponseTime: number;
  currentAmount: number;
  status: 'active' | 'completed' | 'not_started';
}

interface DepartmentStats {
  name: string;
  participantCount: number;
  averageScore: number;
  averageResponseTime: number;
  totalAmount: number;
  nistCoverage: {
    [key: string]: number;
  };
}

interface OrgPerformance {
  totalParticipants: number;
  activeParticipants: number;
  completedParticipants: number;
  averageScore: number;
  totalAmount: number;
  savedAmount: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  nistMaturity: {
    [key: string]: number;
  };
  recentIncidents: {
    time: string;
    type: string;
    impact: string;
    department: string;
  }[];
}

interface Client {
  id: number;
  name: string;
  selected: boolean;
}

@Component({
  selector: 'app-observer-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './observer-dashboard.component.html',
  styleUrls: ['./observer-dashboard.component.css']
})
export class ObserverDashboardComponent implements OnInit {
  participants: ParticipantData[] = [
    {
      id: '1',
      name: 'John Smith',
      department: 'IT Security',
      role: 'Security Analyst',
      currentQuestion: 8,
      totalQuestions: 10,
      correctAnswers: 7,
      averageResponseTime: 45.5,
      currentAmount: 850000,
      status: 'active'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      department: 'IT Security',
      role: 'Security Engineer',
      currentQuestion: 10,
      totalQuestions: 10,
      correctAnswers: 9,
      averageResponseTime: 32.3,
      currentAmount: 750000,
      status: 'completed'
    },
    {
      id: '3',
      name: 'Mike Chen',
      department: 'Operations',
      role: 'Operations Manager',
      currentQuestion: 6,
      totalQuestions: 10,
      correctAnswers: 4,
      averageResponseTime: 55.7,
      currentAmount: 920000,
      status: 'active'
    },
    {
      id: '4',
      name: 'Emily Brown',
      department: 'Risk Management',
      role: 'Risk Analyst',
      currentQuestion: 9,
      totalQuestions: 10,
      correctAnswers: 8,
      averageResponseTime: 38.9,
      currentAmount: 800000,
      status: 'active'
    },
    {
      id: '5',
      name: 'David Wilson',
      department: 'IT Security',
      role: 'Network Security Engineer',
      currentQuestion: 7,
      totalQuestions: 10,
      correctAnswers: 6,
      averageResponseTime: 41.2,
      currentAmount: 680000,
      status: 'active'
    },
    {
      id: '6',
      name: 'Lisa Martinez',
      department: 'Operations',
      role: 'Systems Administrator',
      currentQuestion: 10,
      totalQuestions: 10,
      correctAnswers: 8,
      averageResponseTime: 35.8,
      currentAmount: 770000,
      status: 'completed'
    },
    {
      id: '7',
      name: 'James Taylor',
      department: 'Risk Management',
      role: 'Compliance Officer',
      currentQuestion: 5,
      totalQuestions: 10,
      correctAnswers: 4,
      averageResponseTime: 48.5,
      currentAmount: 890000,
      status: 'active'
    },
    {
      id: '8',
      name: 'Maria Garcia',
      department: 'IT Security',
      role: 'Incident Response Specialist',
      currentQuestion: 3,
      totalQuestions: 10,
      correctAnswers: 3,
      averageResponseTime: 29.7,
      currentAmount: 950000,
      status: 'active'
    },
    {
      id: '9',
      name: 'Robert Lee',
      department: 'Operations',
      role: 'Infrastructure Manager',
      currentQuestion: 0,
      totalQuestions: 10,
      correctAnswers: 0,
      averageResponseTime: 0,
      currentAmount: 1000000,
      status: 'not_started'
    },
    {
      id: '10',
      name: 'Jennifer White',
      department: 'Risk Management',
      role: 'Risk Manager',
      currentQuestion: 10,
      totalQuestions: 10,
      correctAnswers: 9,
      averageResponseTime: 33.4,
      currentAmount: 720000,
      status: 'completed'
    }
  ];

  departmentStats: DepartmentStats[] = [
    {
      name: 'IT Security',
      participantCount: 4,
      averageScore: 87.2,
      averageResponseTime: 37.2,
      totalAmount: 3230000,
      nistCoverage: {
        'Identify': 92,
        'Protect': 88,
        'Detect': 90,
        'Respond': 85,
        'Recover': 82
      }
    },
    {
      name: 'Operations',
      participantCount: 3,
      averageScore: 75.5,
      averageResponseTime: 45.7,
      totalAmount: 2690000,
      nistCoverage: {
        'Identify': 78,
        'Protect': 72,
        'Detect': 80,
        'Respond': 68,
        'Recover': 70
      }
    },
    {
      name: 'Risk Management',
      participantCount: 3,
      averageScore: 84.3,
      averageResponseTime: 40.3,
      totalAmount: 2410000,
      nistCoverage: {
        'Identify': 88,
        'Protect': 85,
        'Detect': 82,
        'Respond': 87,
        'Recover': 84
      }
    }
  ];

  orgPerformance: OrgPerformance = {
    totalParticipants: 45,
    activeParticipants: 32,
    completedParticipants: 10,
    averageScore: 85,
    totalAmount: 5000000,
    savedAmount: 750000,
    riskLevel: 'Medium',
    nistMaturity: {
      'Identify': 88,
      'Protect': 92,
      'Detect': 78,
      'Respond': 85,
      'Recover': 82
    },
    recentIncidents: [
      {
        time: '10:45 AM',
        type: 'Phishing Attempt',
        impact: 'Medium Risk - $50,000 potential loss prevented',
        department: 'Finance'
      },
      {
        time: '10:30 AM',
        type: 'Access Control Violation',
        impact: 'Low Risk - Unauthorized access prevented',
        department: 'IT'
      },
      {
        time: '10:15 AM',
        type: 'Data Breach Attempt',
        impact: 'High Risk - Customer data protected',
        department: 'Operations'
      }
    ]
  };

  clients: Client[] = [
    { id: 1, name: 'Acme Corporation', selected: true },
    { id: 2, name: 'TechCorp Solutions', selected: true },
    { id: 3, name: 'Global Industries', selected: true },
    { id: 4, name: 'Innovative Systems', selected: true },
    { id: 5, name: 'Future Enterprises', selected: true }
  ];

  showClientDropdown = false;
  dropdownPosition = { top: '0px', left: '0px' };

  toggleClientDropdown(event: MouseEvent) {
    event.stopPropagation();
    this.showClientDropdown = !this.showClientDropdown;
    
    // Close dropdown when clicking outside
    if (this.showClientDropdown) {
      setTimeout(() => {
        window.addEventListener('click', this.closeDropdown);
      });
    }
  }

  closeDropdown = () => {
    this.showClientDropdown = false;
    window.removeEventListener('click', this.closeDropdown);
  }

  toggleAllClients(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    this.clients.forEach(client => client.selected = checkbox.checked);
    this.updateDashboard();
  }

  toggleClient(client: Client) {
    client.selected = !client.selected;
    this.updateDashboard();
  }

  areAllClientsSelected(): boolean {
    return this.clients.every(client => client.selected);
  }

  getSelectedClientsCount(): number {
    return this.clients.filter(client => client.selected).length;
  }

  updateDashboard() {
    // In a real implementation, this would fetch and update data based on selected clients
    console.log('Selected clients:', this.clients.filter(c => c.selected).map(c => c.name));
  }

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    // Initial dashboard update with all clients selected
    this.updateDashboard();
  }

  ngOnDestroy() {
    window.removeEventListener('click', this.closeDropdown);
  }
}