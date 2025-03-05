import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { interval, Subscription, timer } from 'rxjs';
import type { EChartsOption } from 'echarts';
import * as echarts from 'echarts';

interface TeamPerformance {
  team_name: string;
  average_team_score: number;
  avg_response_time: number;
  completion_rate: string;
  wrong_answer_percentage: number;
}

interface RiskAnalysis {
  low_risk: number;
  medium_risk: number;
  high_risk: number;
}

interface SwotAnalysis {
  team_name: string;
  strength_score: number;
  weakness_score: number;
  opportunity_score: number;
  threat_score: number;
}

interface NistCoverage {
  nist_phase: string;
  total_questions: number;
  correct_answers: number;
}

interface OrgReport {
  session_id: string;
  team_performance: TeamPerformance[];
  risk_analysis: RiskAnalysis[];
  swot_analysis: SwotAnalysis[];
  nist_coverage: NistCoverage[];
  strengths?: string;
  area_of_improvement?: string;
  recommended_actions?: string;
  references?: string;
}

@Component({
  selector: "app-org-report",
  standalone: true,
  imports: [CommonModule, NgxEchartsModule],
  templateUrl: "./org-report.component.html",
  styleUrls: ["./org-report.component.css"]
})
export class OrgReportComponent implements OnInit, OnDestroy {
  teams: TeamPerformance[] = [];
  swotData: SwotAnalysis[] = [];
  nistScores: NistCoverage[] = [];
  riskAnalysis: RiskAnalysis | null = null;
  
  sessionId: string | null = null;
  clientName: string = 'Organization';
  isLoading: boolean = false;
  error: string | null = null;
  report: OrgReport | null = null;
  
  performanceChartOption: EChartsOption = {};
  riskDistributionOption: EChartsOption = {};
  nistRadarChartOption: EChartsOption = {};
  swotHeatmapOption: EChartsOption = {};
  trendLineOption: EChartsOption = {};

  // Auto-refresh
  private refreshInterval = 60000; // 1 minute in milliseconds
  private refreshSubscription: Subscription | null = null;
  private countdownSubscription: Subscription | null = null;
  lastRefreshTime: Date | null = null;
  nextRefreshTime: Date | null = null;
  timeUntilNextRefresh: number = this.refreshInterval / 1000;
  showRefreshIndicator = false;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Check if session_id is provided in the route
    this.route.paramMap.subscribe(params => {
      this.sessionId = params.get('session_id');
      
      if (this.sessionId) {
        this.loadOrgReport(this.sessionId);
        // Start auto-refresh for reports
        this.startAutoRefresh();
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
      if (this.sessionId) {
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
    if (!this.isLoading && this.sessionId) {
      console.log('Auto-refreshing organization report data...');
      
      // Show refresh indicator
      this.showRefreshIndicator = true;
      
      // Load the report data
      this.loadOrgReport(this.sessionId, true);
      
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

  loadOrgReport(sessionId: string, isRefresh: boolean = false) {
    if (!isRefresh) {
      this.isLoading = true;
    }
    this.error = null;
    
    this.http.get<OrgReport>(`https://esflabs.ai/ttx/reports/client/session/${sessionId}`)
      .subscribe({
        next: (data) => {
          this.report = data;
          this.teams = data.team_performance;
          this.swotData = data.swot_analysis;
          this.nistScores = data.nist_coverage;
          this.riskAnalysis = data.risk_analysis[0];
          
          // Initialize charts with the new data
          // Add a small delay to ensure DOM is ready
          setTimeout(() => {
            this.initializeCharts();
            this.isLoading = false;
          }, 300);
        },
        error: (error) => {
          console.error('Error loading organization report:', error);
          this.error = 'Failed to load organization report. Please try again.';
          this.isLoading = false;
        }
      });
  }

  getOverallScore(): number {
    if (!this.teams || this.teams.length === 0) return 0;
    return this.teams.reduce((sum, team) => sum + team.average_team_score, 0) / this.teams.length;
  }

  getAverageResponseTime(): number {
    if (!this.teams || this.teams.length === 0) return 0;
    return this.teams.reduce((sum, team) => sum + team.avg_response_time, 0) / this.teams.length;
  }

  getCompletionRate(): number {
    if (!this.teams || this.teams.length === 0) return 0;
    return this.teams.reduce((sum, team) => sum + parseFloat(team.completion_rate.replace('%', '')), 0) / this.teams.length;
  }

  getTotalMembers(): number {
    // This is a placeholder since the API doesn't provide member count
    return this.teams.length * 5; // Assuming 5 members per team
  }

  getRiskColor(level: string): string {
    switch (level.toLowerCase()) {
      case 'low': return '#2ecc71';
      case 'medium': return '#f1c40f';
      case 'high': return '#e74c3c';
      default: return '#95a5a6';
    }
  }

  getScoreColor(score: number): string {
    if (score >= 90) return '#2ecc71';
    if (score >= 80) return '#3498db';
    if (score >= 70) return '#f1c40f';
    if (score >= 60) return '#e67e22';
    return '#e74c3c';
  }

  manualRefresh() {
    if (this.sessionId) {
      this.refreshData();
    }
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
    link.setAttribute('download', `Organization_Report_${this.sessionId}.csv`);
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
    csvRows.push(`Organization Performance Report`);
    csvRows.push(`Session ID: ${this.sessionId}`);
    csvRows.push(`Generated on: ${new Date().toLocaleString()}`);
    csvRows.push('');
    
    // Add summary stats
    csvRows.push('Summary Statistics');
    csvRows.push(`Overall Score,${this.getOverallScore().toFixed(2)}%`);
    csvRows.push(`Average Response Time,${this.getAverageResponseTime().toFixed(2)}s`);
    csvRows.push(`Completion Rate,${this.getCompletionRate().toFixed(2)}%`);
    csvRows.push('');
    
    // Add team performance
    csvRows.push('Team Performance');
    csvRows.push('Team Name,Average Score,Response Time,Completion Rate,Wrong Answer %');
    
    this.teams.forEach(team => {
      csvRows.push(`${team.team_name},${team.average_team_score}%,${team.avg_response_time}s,${team.completion_rate},${team.wrong_answer_percentage}%`);
    });
    csvRows.push('');
    
    // Add risk analysis
    if (this.riskAnalysis) {
      csvRows.push('Risk Analysis');
      csvRows.push(`Low Risk,${this.riskAnalysis.low_risk}`);
      csvRows.push(`Medium Risk,${this.riskAnalysis.medium_risk}`);
      csvRows.push(`High Risk,${this.riskAnalysis.high_risk}`);
      csvRows.push('');
    }
    
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
    csvRows.push('Team,Strengths Score,Weaknesses Score,Opportunities Score,Threats Score');
    
    this.swotData.forEach(data => {
      csvRows.push(`${data.team_name},${data.strength_score}%,${data.weakness_score}%,${data.opportunity_score}%,${data.threat_score}%`);
    });
    
    // Add insights if available
    if (this.report.strengths) {
      csvRows.push('');
      csvRows.push('Strengths');
      csvRows.push(this.report.strengths);
    }
    
    if (this.report.area_of_improvement) {
      csvRows.push('');
      csvRows.push('Areas for Improvement');
      csvRows.push(this.report.area_of_improvement);
    }
    
    if (this.report.recommended_actions) {
      csvRows.push('');
      csvRows.push('Recommended Actions');
      csvRows.push(this.report.recommended_actions);
    }
    
    if (this.report.references) {
      csvRows.push('');
      csvRows.push('References');
      csvRows.push(this.report.references);
    }
    
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

  private initializeCharts() {
    if (!this.teams.length || !this.nistScores.length || !this.swotData.length) {
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
        bottom: '15%', // Increased bottom margin for rotated labels
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: this.teams.map(team => team.team_name),
        ...axisStyle,
        axisLabel: {
          ...axisStyle.axisLabel,
          rotate: 45,
          interval: 0
        }
      },
      yAxis: {
        type: 'value',
        name: 'Score',
        ...axisStyle,
        max: 100
      },
      series: [
        {
          name: 'Performance Score',
          type: 'bar',
          data: this.teams.map(team => ({
            value: team.average_team_score,
            itemStyle: {
              color: this.getScoreColor(team.average_team_score)
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

    // Risk Distribution Chart
    if (this.riskAnalysis) {
      const riskData = [
        { value: this.riskAnalysis.low_risk, name: 'Low Risk', itemStyle: { color: '#2ecc71' } },
        { value: this.riskAnalysis.medium_risk, name: 'Medium Risk', itemStyle: { color: '#f1c40f' } },
        { value: this.riskAnalysis.high_risk, name: 'High Risk', itemStyle: { color: '#e74c3c' } }
      ];

      this.riskDistributionOption = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          borderColor: 'rgba(255, 255, 255, 0.2)',
          textStyle: chartTextStyle
        },
        legend: {
          orient: 'vertical',
          right: '5%',
          top: 'center',
          textStyle: {
            color: '#FFFFFF'
          }
        },
        series: [{
          name: 'Risk Distribution',
          type: 'pie',
          radius: ['50%', '70%'],
          center: ['40%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#FFFFFF',
            borderWidth: 2
          },
          label: {
            show: false
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 20,
              fontWeight: 'bold',
              color: '#FFFFFF'
            }
          },
          data: riskData
        }]
      };
    }

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
              name: 'Organization Score',
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

    // SWOT Analysis Heatmap
    const categories = ['Strengths', 'Weaknesses', 'Opportunities', 'Threats'];
    
    // Prepare data for heatmap
    const heatmapData: any[] = [];
    
    this.swotData.forEach((teamData, teamIndex) => {
      // Add strength score
      heatmapData.push([0, teamIndex, teamData.strength_score]);
      // Add weakness score
      heatmapData.push([1, teamIndex, teamData.weakness_score]);
      // Add opportunity score
      heatmapData.push([2, teamIndex, teamData.opportunity_score]);
      // Add threat score
      heatmapData.push([3, teamIndex, teamData.threat_score]);
    });

    this.swotHeatmapOption = {
      backgroundColor: 'transparent',
      tooltip: {
        position: 'top',
        formatter: (params: any) => {
          const categoryIndex = params.data[0];
          const teamIndex = params.data[1];
          const score = params.data[2];
          const teamName = this.swotData[teamIndex].team_name;
          const category = categories[categoryIndex];
          
          return `
            <div style="padding: 8px;">
              <strong>${teamName}</strong><br/>
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
        data: this.swotData.map(item => item.team_name),
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

    // Response Time Chart
    this.trendLineOption = {
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
        bottom: '15%', // Increased bottom margin for rotated labels
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: this.teams.map(team => team.team_name),
        ...axisStyle,
        axisLabel: {
          ...axisStyle.axisLabel,
          rotate: 45,
          interval: 0
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
          data: this.teams.map(team => team.avg_response_time),
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
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgba(52, 152, 219, 0.5)'
              },
              {
                offset: 1,
                color: 'rgba(52, 152, 219, 0.1)'
              }
            ])
          },
          symbol: 'circle',
          symbolSize: 8
        }
      ]
    };
  }
}