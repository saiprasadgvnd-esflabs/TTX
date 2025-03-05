import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxEchartsModule } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';
import * as echarts from 'echarts';
import { ApiService } from '../../services/api.service';

interface SessionResult {
  exercise_name: string;
  time_spent: string;
  total_questions: number;
  correct_answers: number;
  wrong_answers: number;
  base_amount: number;
  final_amount: number;
  time_insignt: string;
  nist_insight: string;
  finincial_impact_insight: string;
  strengths: string;
  area_of_improvement: string;
  recommended_actions: string;
  references: string;
  answers: Array<{
    question_number: number;
    time_taken: number;
    is_correct: boolean;
  }>;
  nistScores: Array<{
    frameworkName: string;
    totalCount: number;
    correctCount: number;
  }>;
  swot_analysis: {
    strengths: {
      score: number;
      details: string;
    };
    weaknesses: {
      score: number;
      details: string;
    };
    opportunities: {
      score: number;
      details: string;
    };
    threats: {
      score: number;
      details: string;
    };
  };
}

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule, NgxEchartsModule],
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent implements OnInit, OnDestroy {
  loading = true;
  error: string | null = null;
  sessionResult: SessionResult | null = null;
  responseTimeChartOptions: EChartsOption = {};
  nistRadarChartOptions: EChartsOption = {};
  financialImpactOptions: EChartsOption = {};
  swotChartOptions: EChartsOption = {};
  sessionId: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.sessionId = this.route.snapshot.params['session_id'];
    this.loadSessionResults(this.sessionId);
  }

  loadSessionResults(sessionId: string) {
    this.loading = true;
    this.error = null;

    this.apiService.getuserSessionReport(sessionId).subscribe({
      next: (data: any) => {
        if (!data) {
          this.error = 'No results data available for this session.';
          this.loading = false;
          return;
        }
        
        this.sessionResult = data;
        this.initializeCharts();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading session results:', err);
        
        // Provide a more user-friendly error message
        if (err.status === 500) {
          this.error = 'The session results are not available yet. This could be because the session is still in progress or has not been completed.';
        } else if (err.status === 404) {
          this.error = 'Session not found. Please check if the session ID is correct.';
        } else {
          this.error = 'Failed to load session results. Please try again later.';
        }
        
        this.loading = false;
      }
    });
  }

  initializeCharts() {
    if (!this.sessionResult) return;

    const chartTextStyle = {
      color: '#FFFFFF',
      fontSize: 12
    };

    // Response Time Chart
    this.responseTimeChartOptions = {
      grid: {
        top: '10%',
        right: '5%',
        bottom: '15%',
        left: '10%',
        containLabel: true
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        textStyle: chartTextStyle,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        extraCssText: 'z-index: 1000;' // Add z-index to tooltip
      },
      xAxis: {
        type: 'category',
        data: this.sessionResult.answers.map((_, i) => `Q${i + 1}`),
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
      },
      yAxis: {
        type: 'value',
        name: 'Time (s)',
        nameTextStyle: chartTextStyle,
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
      },
      series: [{
        name: 'Response Time',
        type: 'bar',
        data: this.sessionResult.answers.map(a => ({
          value: a.time_taken,
          itemStyle: {
            color: a.is_correct ? '#2ecc71' : '#e74c3c'
          }
        })),
        barWidth: '40%',
        label: {
          show: true,
          position: 'top',
          color: '#FFFFFF',
          formatter: '{c}s'
        }
      }]
    };

    // NIST Framework Radar Chart
    this.nistRadarChartOptions = {
      tooltip: {
        extraCssText: 'z-index: 1000;' // Add z-index to tooltip
      },
      radar: {
        indicator: this.sessionResult.nistScores.map(score => ({
          name: score.frameworkName,
          max: 100
        })),
        splitArea: {
          areaStyle: {
            color: ['rgba(255, 255, 255, 0.05)']
          }
        },
        axisLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.2)'
          }
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.2)'
          }
        },
        axisName: {
          color: '#FFFFFF'
        }
      },
      series: [{
        type: 'radar',
        data: [{
          value: this.sessionResult.nistScores.map(score => 
            score.totalCount > 0 ? (score.correctCount / score.totalCount) * 100 : 0
          ),
          name: 'Framework Coverage',
          areaStyle: {
            color: 'rgba(52, 152, 219, 0.3)'
          },
          lineStyle: {
            color: '#3498db',
            width: 2
          },
          itemStyle: {
            color: '#3498db'
          }
        }]
      }]
    };

    // Financial Impact Chart
    const savedAmount = this.sessionResult.base_amount - this.sessionResult.final_amount;
    this.financialImpactOptions = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: ${c}',
        textStyle: chartTextStyle,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        extraCssText: 'z-index: 1000;' // Add z-index to tooltip
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
        name: 'Financial Impact',
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
        data: [
          { 
            value: savedAmount, 
            name: 'Amount Saved',
            itemStyle: { color: '#2ecc71' }
          },
          { 
            value: this.sessionResult.final_amount, 
            name: 'Final Amount',
            itemStyle: { color: '#e74c3c' }
          }
        ]
      }]
    };

    // SWOT Analysis Treemap Chart
    if (this.sessionResult.swot_analysis) {
      // Store details separately to use in tooltip formatter
      const swotDetails: Record<string, string> = {
        'Strengths': this.sessionResult.swot_analysis.strengths.details,
        'Weaknesses': this.sessionResult.swot_analysis.weaknesses.details,
        'Opportunities': this.sessionResult.swot_analysis.opportunities.details,
        'Threats': this.sessionResult.swot_analysis.threats.details
      };

      this.swotChartOptions = {
        backgroundColor: 'transparent',
        tooltip: {
          formatter: function(info: any) {
            const value = info.value;
            const name = info.name as string;
            // Use type assertion to tell TypeScript that name is a valid key
            const details = swotDetails[name] || 'No details available';
            
            return [
              '<div style="padding: 10px;">',
              `<div style="font-weight:bold;color:#fff;font-size:16px;margin-bottom:8px;">${name}</div>`,
              `<div style="color:#fff;font-size:14px;margin-bottom:8px;">Score: <span style="font-weight:bold">${value}%</span></div>`,
              `<div style="color:#ddd;font-size:12px;">${details}</div>`,
              '</div>'
            ].join('');
          },
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderColor: 'rgba(255, 255, 255, 0.3)',
          borderWidth: 1,
          padding: 0,
          textStyle: {
            color: '#FFFFFF',
            fontSize: 14
          },
          extraCssText: 'z-index: 1000 !important; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5); border-radius: 8px;'
        },
        series: [{
          type: 'treemap',
          roam: false,
          nodeClick: false,
          breadcrumb: {
            show: false
          },
          label: {
            show: true,
            formatter: '{b}\n{c}%',
            fontSize: 16,
            fontWeight: 'bold',
            color: '#FFFFFF',
            textBorderColor: 'rgba(0, 0, 0, 0.3)',
            textBorderWidth: 2,
            textShadowBlur: 4,
            textShadowColor: 'rgba(0, 0, 0, 0.5)'
          },
          upperLabel: {
            show: false
          },
          itemStyle: {
            borderColor: '#000',
            borderWidth: 3,
            gapWidth: 3,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
            shadowBlur: 10
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 20,
              shadowColor: 'rgba(0, 0, 0, 0.8)'
            },
            label: {
              fontSize: 18,
              fontWeight: 'bold'
            }
          },
          levels: [
            {
              itemStyle: {
                borderColor: '#333',
                borderWidth: 3,
                gapWidth: 3
              }
            }
          ],
          data: [
            {
              name: 'Strengths',
              value: this.sessionResult.swot_analysis.strengths.score,
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#2ecc71' },
                  { offset: 1, color: '#27ae60' }
                ])
              }
            },
            {
              name: 'Opportunities',
              value: this.sessionResult.swot_analysis.opportunities.score,
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#3498db' },
                  { offset: 1, color: '#2980b9' }
                ])
              }
            },
            {
              name: 'Weaknesses',
              value: this.sessionResult.swot_analysis.weaknesses.score,
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#e74c3c' },
                  { offset: 1, color: '#c0392b' }
                ])
              }
            },
            {
              name: 'Threats',
              value: this.sessionResult.swot_analysis.threats.score,
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#f39c12' },
                  { offset: 1, color: '#d35400' }
                ])
              }
            }
          ]
        }]
      };
    }
  }

  getAccuracyPercentage(): number {
    if (!this.sessionResult) return 0;
    return (this.sessionResult.correct_answers / this.sessionResult.total_questions) * 100;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  retryExercise() {
    // Navigate back to the exercise selection or start page
    this.router.navigate(['/exercise/session', this.sessionId]);
  }

  downloadReport() {
    // Implement report download functionality
    console.log('Downloading report...');
    
    if (!this.sessionResult) return;
    
    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add headers
    csvContent += "Exercise Results\r\n";
    csvContent += `Exercise: ${this.sessionResult.exercise_name}\r\n`;
    csvContent += `Time Spent: ${this.sessionResult.time_spent}\r\n`;
    csvContent += `Score: ${this.getAccuracyPercentage().toFixed(1)}%\r\n`;
    csvContent += `Correct Answers: ${this.sessionResult.correct_answers}/${this.sessionResult.total_questions}\r\n`;
    csvContent += `Amount Saved: $${(this.sessionResult.base_amount - this.sessionResult.final_amount).toLocaleString()}\r\n\r\n`;
    
    // Add NIST scores
    csvContent += "NIST Framework Coverage\r\n";
    csvContent += "Framework,Score\r\n";
    this.sessionResult.nistScores.forEach(score => {
      const scorePercentage = score.totalCount > 0 ? (score.correctCount / score.totalCount) * 100 : 0;
      csvContent += `${score.frameworkName},${scorePercentage.toFixed(1)}%\r\n`;
    });
    csvContent += "\r\n";
    
    // Add SWOT analysis if available
    if (this.sessionResult.swot_analysis) {
      csvContent += "SWOT Analysis\r\n";
      csvContent += `Strengths,${this.sessionResult.swot_analysis.strengths.score}%,${this.sessionResult.swot_analysis.strengths.details}\r\n`;
      csvContent += `Opportunities,${this.sessionResult.swot_analysis.opportunities.score}%,${this.sessionResult.swot_analysis.opportunities.details}\r\n`;
      csvContent += `Weaknesses,${this.sessionResult.swot_analysis.weaknesses.score}%,${this.sessionResult.swot_analysis.weaknesses.details}\r\n`;
      csvContent += `Threats,${this.sessionResult.swot_analysis.threats.score}%,${this.sessionResult.swot_analysis.threats.details}\r\n\r\n`;
    }
    
    // Add question details
    csvContent += "Question Details\r\n";
    csvContent += "Question,Time Taken (s),Correct\r\n";
    this.sessionResult.answers.forEach((answer, index) => {
      csvContent += `Question ${index + 1},${answer.time_taken},${answer.is_correct ? 'Yes' : 'No'}\r\n`;
    });
    csvContent += "\r\n";
    
    // Add insights
    csvContent += "Key Insights\r\n";
    csvContent += `Strengths: ${this.sessionResult.strengths}\r\n\r\n`;
    csvContent += `Areas for Improvement: ${this.sessionResult.area_of_improvement}\r\n\r\n`;
    csvContent += `Recommended Actions: ${this.sessionResult.recommended_actions}\r\n\r\n`;
    csvContent += `References: ${this.sessionResult.references}\r\n\r\n`;
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Exercise_Results_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    document.body.removeChild(link);
  }

  shareResults() {
    // Implement results sharing functionality
    const shareUrl = window.location.href;
    
    // Create a temporary input to copy the URL
    const tempInput = document.createElement('input');
    document.body.appendChild(tempInput);
    tempInput.value = shareUrl;
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    
    alert('Results URL copied to clipboard! You can now share this link.');
  }

  ngOnDestroy() {
    // Cleanup if needed
  }
}