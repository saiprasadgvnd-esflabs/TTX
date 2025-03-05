import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { interval, Subscription, timer } from 'rxjs';
import type { EChartsOption } from 'echarts';

interface TeamMember {
  user_name: string;
  role: string;
  score: number;
  response_time: string;
  exercises: number;
  accuracy: string;
  correct_decisions?: number;
}

interface NistScore {
  nist_phase: string;
  total_questions: number;
  correct_answers: number;
}

interface SwotData {
  user_name: string;
  strength_score: number;
  weakness_score: number;
  opportunity_score: number;
  threat_score: number;
}

interface Team {
  id: number;
  name: string;
  client_name: string;
}

interface TeamReport {
  average_score: number;
  avg_response_time: string;
  decision_accuracy: string;
  individual_performance: TeamMember[];
  decision_distribution: Array<{user_name: string, correct_decisions: number}>;
  individual_response_times: Array<{user_name: string, avg_response_time: string}>;
  swot_analysis: SwotData[];
  nist_coverage: NistScore[];
}

@Component({
  selector: 'app-team-report',
  standalone: true,
  imports: [CommonModule, NgxEchartsModule, FormsModule],
  templateUrl: './team-report.component.html',
  styleUrls: ['./team-report.component.css']
})
export class TeamReportComponent implements OnInit, OnDestroy {
  // Team selection
  teams: Team[] = [];
  selectedTeamId: number | null = null;
  isLoadingTeams = false;
  isLoadingReport = false;
  sessionId: string | null = null;
  clientName: string = '';
  selectedTeamName: string = '';
  
  // Report data
  report: TeamReport | null = null;
  teamMembers: TeamMember[] = [];
  nistScores: NistScore[] = [];
  swotData: SwotData[] = [];

  // Auto-refresh
  private refreshInterval = 60000; // 1 minute in milliseconds
  private refreshSubscription: Subscription | null = null;
  private countdownSubscription: Subscription | null = null;
  lastRefreshTime: Date | null = null;
  nextRefreshTime: Date | null = null;
  timeUntilNextRefresh: number = this.refreshInterval / 1000;
  showRefreshIndicator = false;

  performanceChartOption: EChartsOption = {};
  responseTimeChartOption: EChartsOption = {};
  nistRadarChartOption: EChartsOption = {};
  decisionTreeMapOption: EChartsOption = {};
  swotHeatmapOption: EChartsOption = {};

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Check if session_id is provided in the route
    this.route.paramMap.subscribe(params => {
      this.sessionId = params.get('session_id');
      
      if (this.sessionId) {
        // If session_id is provided, load team data for this specific session
        this.loadTeamsForSession(this.sessionId);
        
        // Start auto-refresh for reports
        this.startAutoRefresh();
      } else {
        // Otherwise, load all teams as before
        this.loadTeams();
      }
    });
  }

  ngOnDestroy() {
    // Clean up subscriptions when component is destroyed
    this.stopAutoRefresh();
  }

  startAutoRefresh() {
    // Stop any existing refresh
    this.stopAutoRefresh();
    
    // Set up a new interval to refresh data
    this.refreshSubscription = interval(this.refreshInterval).subscribe(() => {
      if (this.selectedTeamId && this.sessionId) {
        this.refreshData();
      }
    });
    
    // Start countdown timer
    this.startCountdown();
  }

  startCountdown() {
    // Stop any existing countdown
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }
    
    // Reset countdown value
    this.timeUntilNextRefresh = this.refreshInterval / 1000;
    
    // Create a timer that emits every second
    this.countdownSubscription = timer(0, 1000).subscribe(() => {
      if (this.timeUntilNextRefresh > 0) {
        this.timeUntilNextRefresh--;
      }
    });
  }

  stopAutoRefresh() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
      this.refreshSubscription = null;
    }
    
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
      this.countdownSubscription = null;
    }
  }

  refreshData() {
    // Only refresh if we're not already loading
    if (!this.isLoadingReport && this.selectedTeamId && this.sessionId) {
      console.log('Auto-refreshing team report data...');
      
      // Show refresh indicator
      this.showRefreshIndicator = true;
      
      // Load the report data
      this.loadTeamReport(this.selectedTeamId, this.sessionId, true);
      
      // Update refresh times
      this.updateRefreshTimes();
      
      // Hide refresh indicator after 2 seconds
      setTimeout(() => {
        this.showRefreshIndicator = false;
      }, 2000);
      
      // Restart countdown
      this.startCountdown();
    }
  }

  updateRefreshTimes() {
    this.lastRefreshTime = new Date();
    this.nextRefreshTime = new Date(this.lastRefreshTime.getTime() + this.refreshInterval);
  }

  getTimeUntilNextRefresh(): string {
    return `${this.timeUntilNextRefresh}s`;
  }

  loadTeamsForSession(sessionId: string) {
    this.isLoadingTeams = true;
    
    // Get teams for the specific session
    this.http.get<Team[]>(`https://esflabs.ai/ttx/teams/session/${sessionId}`)
      .subscribe({
        next: (data) => {
          this.teams = data;
          this.isLoadingTeams = false;
          
          // Set client name from the first team (all teams in a session have the same client)
          if (this.teams.length > 0) {
            this.clientName = this.teams[0].client_name;
            
            // Select the first team by default
            this.selectedTeamId = this.teams[0].id;
            this.selectedTeamName = this.teams[0].name;
            this.loadTeamReport(this.selectedTeamId, sessionId);
          }
          
          console.log("Loaded teams for session:", this.teams);
        },
        error: (error) => {
          console.error('Error loading teams for session:', error);
          this.isLoadingTeams = false;
        }
      });
  }

  loadTeams() {
    this.isLoadingTeams = true;
    this.teams = [];
    
    // Directly load all teams
    this.http.get<Team[]>('https://esflabs.ai/ttx/teams')
      .subscribe({
        next: (data) => {
          this.teams = data;
          this.isLoadingTeams = false;
          
          // If there are teams, select the first one by default
          if (this.teams.length > 0) {
            this.selectedTeamId = this.teams[0].id;
            this.selectedTeamName = this.teams[0].name;
            // If no session ID, we can't load a report yet
          }
        },
        error: (error) => {
          console.error('Error loading teams:', error);
          this.isLoadingTeams = false;
        }
      });
  }

  onTeamChange() {
    if (this.selectedTeamId && this.sessionId) {
      // Update selected team name
      const selectedTeam = this.teams.find(team => team.id === Number(this.selectedTeamId));
      if (selectedTeam) {
        this.selectedTeamName = selectedTeam.name;
      }
      this.loadTeamReport(this.selectedTeamId, this.sessionId);
      
      // Reset refresh timer when team changes
      this.startCountdown();
    }
  }

  loadTeamReport(teamId: number, sessionId: string, isRefresh: boolean = false) {
    if (!isRefresh) {
      this.isLoadingReport = true;
    }
    
    this.http.get<any>(`https://esflabs.ai/ttx/reports/team/${teamId}/session/${sessionId}`)
      .subscribe({
        next: (response) => {
          try {
            // Parse the JSON string from result_json
            console.log(isRefresh ? 'Refreshed team report data' : 'Loaded team report data');
            const reportData: TeamReport = response;
            this.report = reportData;
            
            // Update component data
            this.teamMembers = reportData.individual_performance;
            
            // Map decision distribution to team members
            if (reportData.decision_distribution) {
              reportData.decision_distribution.forEach(item => {
                const member = this.teamMembers.find(m => m.user_name === item.user_name);
                if (member) {
                  member.correct_decisions = item.correct_decisions;
                }
              });
            }
            
            this.nistScores = reportData.nist_coverage;
            this.swotData = reportData.swot_analysis;
            
            // Initialize charts with the new data
            this.initializeCharts();
            
            this.isLoadingReport = false;
          } catch (error) {
            console.error("Error parsing report data:", error);
            this.isLoadingReport = false;
          }
        },
        error: (error) => {
          console.error('Error loading team report:', error);
          this.isLoadingReport = false;
        }
      });
  }

  getAverageScore(): number {
    return this.report?.average_score || 0;
  }

  getAverageResponseTime(): string {
    if (this.report?.avg_response_time) {
      // Remove the 's' from the end if it exists
      return this.report.avg_response_time.replace('s', '');
    }
    return '0';
  }

  getAverageAccuracy(): string {
    if (this.report?.decision_accuracy) {
      // Remove the '%' from the end if it exists
      return this.report.decision_accuracy.replace('%', '');
    }
    return '0';
  }

  getScoreColor(score: number): string {
    if (score >= 90) return '#2ecc71';
    if (score >= 80) return '#3498db';
    if (score >= 70) return '#f1c40f';
    if (score >= 60) return '#e67e22';
    return '#e74c3c';
  }

  parseResponseTime(timeStr: string): number {
    // Remove the 's' and convert to number
    return parseFloat(timeStr.replace('s', ''));
  }

  parseAccuracy(accuracyStr: string): number {
    // Remove the '%' and convert to number
    return parseFloat(accuracyStr.replace('%', ''));
  }

  downloadReport() {
    if (!this.report) return;

    // Create CSV content
    let csvContent = this.generateCSVContent();
    
    // Create a blob with the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create a download link
    const link = document.createElement('a');
    
    // Create a URL for the blob
    const url = URL.createObjectURL(blob);
    
    // Set link properties
    link.setAttribute('href', url);
    link.setAttribute('download', `Team_Report_${this.selectedTeamName}_${this.sessionId}.csv`);
    link.style.visibility = 'hidden';
    
    // Append link to document
    document.body.appendChild(link);
    
    // Click the link to trigger download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  generateCSVContent(): string {
    if (!this.report) return '';
    
    let csvRows = [];
    
    // Add report header
    csvRows.push(`Team Performance Report - ${this.selectedTeamName}`);
    csvRows.push(`Client: ${this.clientName}`);
    csvRows.push(`Session ID: ${this.sessionId}`);
    csvRows.push(`Generated on: ${new Date().toLocaleString()}`);
    csvRows.push('');
    
    // Add summary stats
    csvRows.push('Summary Statistics');
    csvRows.push(`Average Score,${this.getAverageScore()}%`);
    csvRows.push(`Average Response Time,${this.getAverageResponseTime()}s`);
    csvRows.push(`Decision Accuracy,${this.getAverageAccuracy()}%`);
    csvRows.push('');
    
    // Add team members table
    csvRows.push('Team Member Details');
    csvRows.push('Name,Role,Score,Response Time,Exercises,Accuracy');
    
    this.teamMembers.forEach(member => {
      csvRows.push(`${member.user_name},${member.role},${member.score}%,${member.response_time},${member.exercises},${member.accuracy}`);
    });
    csvRows.push('');
    
    // Add NIST coverage
    csvRows.push('NIST Framework Coverage');
    csvRows.push('Framework,Total Questions,Correct Answers,Coverage Percentage');
    
    this.nistScores.forEach(score => {
      const coveragePercentage = score.total_questions > 0 
        ? (score.correct_answers / score.total_questions) * 100 
        : 0;
      csvRows.push(`${score.nist_phase},${score.total_questions},${score.correct_answers},${coveragePercentage.toFixed(2)}%`);
    });
    csvRows.push('');
    
    // Add SWOT analysis
    csvRows.push('SWOT Analysis');
    csvRows.push('User,Strengths Score,Weaknesses Score,Opportunities Score,Threats Score');
    
    this.swotData.forEach(data => {
      csvRows.push(`${data.user_name},${data.strength_score}%,${data.weakness_score}%,${data.opportunity_score}%,${data.threat_score}%`);
    });
    
    // Join all rows with newlines
    return csvRows.join('\n');
  }

  downloadPDF() {
    // This is a placeholder for PDF download functionality
    // In a real implementation, you would use a library like jsPDF or pdfmake
    alert('PDF download functionality would be implemented here with a PDF generation library.');
  }

  shareReport() {
    // This is a placeholder for sharing functionality
    const shareUrl = window.location.href;
    
    // Create a temporary input to copy the URL
    const tempInput = document.createElement('input');
    document.body.appendChild(tempInput);
    tempInput.value = shareUrl;
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    
    alert('Report URL copied to clipboard! You can now share this link.');
  }

  manualRefresh() {
    if (this.selectedTeamId && this.sessionId) {
      this.refreshData();
    }
  }

  private initializeCharts() {
    if (!this.teamMembers.length || !this.nistScores.length || !this.swotData.length) {
      return;
    }

    const chartTextStyle = {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: 500
    };

    const axisStyle = {
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.3)'
        }
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      axisLabel: {
        color: '#FFFFFF'
      }
    };

    // Performance Chart
    this.performanceChartOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        textStyle: chartTextStyle
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: this.teamMembers.map(member => member.user_name),
        ...axisStyle,
        axisLabel: {
          ...axisStyle.axisLabel,
          rotate: 45
        }
      },
      yAxis: {
        type: 'value',
        name: 'Score',
        ...axisStyle
      },
      series: [
        {
          name: 'Performance Score',
          type: 'bar',
          data: this.teamMembers.map(member => ({
            value: member.score,
            itemStyle: {
              color: this.getScoreColor(member.score)
            }
          })),
          barWidth: '40%',
          label: {
            show: true,
            position: 'top',
            color: '#FFFFFF',
            fontSize: 12
          }
        }
      ]
    };

    // Response Time Chart
    this.responseTimeChartOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        textStyle: chartTextStyle
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: this.teamMembers.map(member => member.user_name),
        ...axisStyle,
        axisLabel: {
          ...axisStyle.axisLabel,
          rotate: 45
        }
      },
      yAxis: {
        type: 'value',
        name: 'Response Time (s)',
        ...axisStyle
      },
      series: [
        {
          name: 'Average Response Time',
          type: 'line',
          smooth: true,
          data: this.teamMembers.map(member => this.parseResponseTime(member.response_time)),
          lineStyle: {
            width: 4,
            color: '#3498db'
          },
          itemStyle: {
            color: '#3498db',
            borderWidth: 2,
            borderColor: '#FFFFFF'
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: 'rgba(52, 152, 219, 0.5)'
                },
                {
                  offset: 1,
                  color: 'rgba(52, 152, 219, 0.1)'
                }
              ]
            }
          },
          symbol: 'circle',
          symbolSize: 8
        }
      ]
    };

    // NIST Radar Chart
    this.nistRadarChartOption = {
      backgroundColor: 'transparent',
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        textStyle: chartTextStyle
      },
      radar: [{
        indicator: this.nistScores.map(score => ({
          text: score.nist_phase,
          max: 100
        })),
        center: ['50%', '50%'],
        radius: '70%',
        splitNumber: 5,
        shape: 'circle',
        axisName: {
          color: '#FFFFFF',
          fontSize: 12,
          fontWeight: 500
        },
        splitArea: {
          areaStyle: {
            color: ['rgba(255, 255, 255, 0.05)']
          }
        },
        axisLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.3)'
          }
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.2)'
          }
        }
      }],
      series: [
        {
          type: 'radar',
          data: [
            {
              value: this.nistScores.map(score => 
                score.total_questions > 0 ? (score.correct_answers / score.total_questions) * 100 : 0
              ),
              name: 'Team Score',
              areaStyle: {
                color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 1,
                  y2: 1,
                  colorStops: [
                    {
                      offset: 0,
                      color: 'rgba(52, 152, 219, 0.7)'
                    },
                    {
                      offset: 1,
                      color: 'rgba(52, 152, 219, 0.3)'
                    }
                  ]
                }
              },
              lineStyle: {
                width: 3,
                color: '#3498db'
              },
              itemStyle: {
                color: '#3498db'
              }
            }
          ]
        }
      ]
    };

    // Decision TreeMap
    this.decisionTreeMapOption = {
      backgroundColor: 'transparent',
      tooltip: {
        formatter: '{b}: {c} correct decisions',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        textStyle: chartTextStyle
      },
      series: [
        {
          type: 'treemap',
          data: this.teamMembers.map(member => ({
            name: member.user_name,
            value: member.correct_decisions || 0,
            itemStyle: {
              color: this.getScoreColor(this.parseAccuracy(member.accuracy))
            }
          })),
          label: {
            show: true,
            formatter: '{b}\n{c} correct',
            color: '#FFFFFF',
            fontSize: 12
          },
          breadcrumb: {
            show: false
          }
        }
      ]
    };

    // SWOT Analysis Heatmap
    const categories = ['Strengths', 'Weaknesses', 'Opportunities', 'Threats'];
    
    // Prepare data for heatmap
    const heatmapData: any[] = [];
    
    this.swotData.forEach((userData, userIndex) => {
      // Add strength score
      heatmapData.push([0, userIndex, userData.strength_score]);
      // Add weakness score
      heatmapData.push([1, userIndex, userData.weakness_score]);
      // Add opportunity score
      heatmapData.push([2, userIndex, userData.opportunity_score]);
      // Add threat score
      heatmapData.push([3, userIndex, userData.threat_score]);
    });

    this.swotHeatmapOption = {
      backgroundColor: 'transparent',
      tooltip: {
        position: 'top',
        formatter: (params: any) => {
          const categoryIndex = params.data[0];
          const userIndex = params.data[1];
          const score = params.data[2];
          const userName = this.swotData[userIndex].user_name;
          const category = categories[categoryIndex];
          
          return `
            <div style="padding: 8px;">
              <strong>${userName}</strong><br/>
              <strong>${category}</strong><br/>
              Score: ${score}%
            </div>
          `;
        },
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        textStyle: {
          color: '#FFFFFF',
          fontSize: 12
        }
      },
      grid: {
        top: '10%',
        bottom: '15%',
        left: '15%',
        right: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: categories,
        splitArea: {
          show: true,
          areaStyle: {
            color: ['rgba(255, 255, 255, 0.02)', 'rgba(255, 255, 255, 0.05)']
          }
        },
        axisLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.3)'
          }
        },
        axisLabel: {
          color: '#FFFFFF',
          fontSize: 12,
          fontWeight: 'bold'
        }
      },
      yAxis: {
        type: 'category',
        data: this.swotData.map(item => item.user_name),
        splitArea: {
          show: true,
          areaStyle: {
            color: ['rgba(255, 255, 255, 0.02)', 'rgba(255, 255, 255, 0.05)']
          }
        },
        axisLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.3)'
          }
        },
        axisLabel: {
          color: '#FFFFFF',
          fontSize: 12
        }
      },
      visualMap: {
        min: 0,
        max: 100,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '0%',
        textStyle: {
          color: '#FFFFFF'
        },
        inRange: {
          color: [
            'rgba(255, 99, 71, 0.8)',   // Lower values
            'rgba(255, 165, 0, 0.8)',   // Middle values
            'rgba(46, 204, 113, 0.8)'   // Higher values
          ]
        }
      },
      series: [{
        name: 'SWOT Analysis',
        type: 'heatmap',
        data: heatmapData,
        label: {
          show: true,
          color: '#FFFFFF',
          fontSize: 12,
          formatter: (params: any) => {
            return `${params.data[2]}%`;
          }
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    };
  }
}