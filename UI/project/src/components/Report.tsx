import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import { Shield, Target, Activity, AlertOctagon, Zap, Award, PieChart, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';

function Report() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [quizResults, setQuizResults] = useState<any>(null);

  useEffect(() => {
    const storedUserInfo = sessionStorage.getItem('userInfo');
    const storedResults = sessionStorage.getItem('quizResults');
    
    if (!storedUserInfo || !storedResults) {
      navigate('/login');
      return;
    }

    setUserInfo(JSON.parse(storedUserInfo));
    setQuizResults(JSON.parse(storedResults));
  }, [navigate]);

  if (!userInfo || !quizResults) return null;

  const calculateMetrics = () => {
    const totalQuestions = 10;
    const answeredCount = Object.keys(quizResults.answeredQuestions).length;
    const correctAnswers = Object.entries(quizResults.answeredQuestions).filter(
      ([qIndex, answer]: [string, any]) => answer === 1 // Assuming correctAnswer is 1 for simplicity
    ).length;
    
    return {
      totalQuestions,
      answeredCount,
      correctAnswers,
      incorrectAnswers: answeredCount - correctAnswers,
      accuracy: (correctAnswers / totalQuestions) * 100,
      avgTimePerQuestion: quizResults.timeSpent / answeredCount,
      responseTime: quizResults.timeSpent,
      riskLevel: quizResults.amount > 5000000 ? 'High' : 'Low',
      performanceScore: (quizResults.score / (totalQuestions * 5)) * 100
    };
  };

  const metrics = calculateMetrics();

  const performanceChartOption = {
    title: {
      text: 'Performance Metrics',
      textStyle: { color: '#fff' }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    backgroundColor: 'transparent',
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      axisLabel: { color: '#fff' }
    },
    yAxis: {
      type: 'category',
      data: ['Accuracy', 'Response Time', 'Risk Score'],
      axisLabel: { color: '#fff' }
    },
    series: [
      {
        name: 'Score',
        type: 'bar',
        data: [
          metrics.accuracy,
          100 - (metrics.avgTimePerQuestion / 30) * 100,
          100 - ((quizResults.amount - 5000000) / 1000000) * 10
        ],
        itemStyle: {
          color: new Function('params', `
            const colors = ['#22c55e', '#3b82f6', '#f59e0b'];
            return colors[params.dataIndex];
          `)
        }
      }
    ]
  };

  const decisionDistributionOption = {
    title: {
      text: 'Decision Distribution',
      textStyle: { color: '#fff' }
    },
    tooltip: {
      trigger: 'item'
    },
    backgroundColor: 'transparent',
    series: [
      {
        name: 'Decisions',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#000',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold',
            color: '#fff'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: metrics.correctAnswers, name: 'Correct', itemStyle: { color: '#22c55e' } },
          { value: metrics.incorrectAnswers, name: 'Incorrect', itemStyle: { color: '#ef4444' } }
        ]
      }
    ]
  };

  const timelineChartOption = {
    title: {
      text: 'Response Timeline',
      textStyle: { color: '#fff' }
    },
    tooltip: {
      trigger: 'axis'
    },
    backgroundColor: 'transparent',
    xAxis: {
      type: 'category',
      data: Array.from({ length: 10 }, (_, i) => `Q${i + 1}`),
      axisLabel: { color: '#fff' }
    },
    yAxis: {
      type: 'value',
      name: 'Time (s)',
      axisLabel: { color: '#fff' }
    },
    series: [
      {
        data: Array.from({ length: 10 }, () => Math.floor(Math.random() * 20 + 10)),
        type: 'line',
        smooth: true,
        lineStyle: {
          color: '#3b82f6',
          width: 4
        },
        symbolSize: 8,
        itemStyle: {
          color: '#3b82f6'
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-black text-cyan-500 p-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <Shield className="w-8 h-8" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
            Cyber Dharshinik - Exercise Report
          </h1>
        </div>
        <div className="bg-gray-900 px-6 py-3 rounded-lg">
          <span className="font-bold text-xl">Final Score: {quizResults.score}/50</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-gray-900 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Target className="w-6 h-6 mr-2" /> Performance Overview
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Role:</span>
              <span className="font-bold text-xl">{userInfo.role}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Exercise Type:</span>
              <span className="font-bold text-xl">{userInfo.exerciseType}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Risk Level:</span>
              <span className={`font-bold ${metrics.riskLevel === 'High' ? 'text-red-500' : 'text-green-500'}`}>
                {metrics.riskLevel}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Financial Impact:</span>
              <span className="font-bold">${(quizResults.amount - 5000000).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Activity className="w-6 h-6 mr-2" /> Response Metrics
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Response Time:</span>
              <span className="font-bold">{Math.floor(metrics.responseTime / 60)}m {metrics.responseTime % 60}s</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Avg. Time per Question:</span>
              <span className="font-bold">{Math.round(metrics.avgTimePerQuestion)}s</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Decision Accuracy:</span>
              <span className="font-bold">{metrics.accuracy.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div className="bg-gray-900 rounded-xl p-6">
          <ReactECharts option={performanceChartOption} style={{ height: '300px' }} />
        </div>

        <div className="bg-gray-900 rounded-xl p-6">
          <ReactECharts option={decisionDistributionOption} style={{ height: '300px' }} />
        </div>

        <div className="bg-gray-900 rounded-xl p-6">
          <ReactECharts option={timelineChartOption} style={{ height: '300px' }} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div className="bg-gray-900 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <AlertOctagon className="w-6 h-6 mr-2" /> Critical Findings
          </h2>
          <div className="space-y-3">
            <div className="p-3 bg-gray-800 rounded-lg">
              <span className="text-red-400">• Incident Response Speed</span>
              <p className="text-sm text-gray-400 mt-1">
                Average response time: {Math.round(metrics.avgTimePerQuestion)}s per decision
              </p>
            </div>
            <div className="p-3 bg-gray-800 rounded-lg">
              <span className="text-yellow-400">• Decision Quality</span>
              <p className="text-sm text-gray-400 mt-1">
                {metrics.correctAnswers} correct out of {metrics.totalQuestions} decisions
              </p>
            </div>
            <div className="p-3 bg-gray-800 rounded-lg">
              <span className="text-green-400">• Risk Management</span>
              <p className="text-sm text-gray-400 mt-1">
                Financial exposure: ${(quizResults.amount - 5000000).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Zap className="w-6 h-6 mr-2" /> Key Strengths
          </h2>
          <div className="space-y-3">
            {metrics.accuracy >= 70 && (
              <div className="p-3 bg-gray-800 rounded-lg">
                <span className="text-green-400">• Strong Decision Making</span>
                <p className="text-sm text-gray-400 mt-1">
                  Demonstrated high accuracy in critical situations
                </p>
              </div>
            )}
            {metrics.avgTimePerQuestion <= 45 && (
              <div className="p-3 bg-gray-800 rounded-lg">
                <span className="text-green-400">• Quick Response Time</span>
                <p className="text-sm text-gray-400 mt-1">
                  Efficient decision-making under pressure
                </p>
              </div>
            )}
            {quizResults.amount <= 7000000 && (
              <div className="p-3 bg-gray-800 rounded-lg">
                <span className="text-green-400">• Risk Mitigation</span>
                <p className="text-sm text-gray-400 mt-1">
                  Maintained effective cost control
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Award className="w-6 h-6 mr-2" /> Recommendations
          </h2>
          <div className="space-y-3">
            {metrics.accuracy < 70 && (
              <div className="p-3 bg-gray-800 rounded-lg">
                <span className="text-yellow-400">• Incident Response Training</span>
                <p className="text-sm text-gray-400 mt-1">
                  Focus on improving decision accuracy
                </p>
              </div>
            )}
            {metrics.avgTimePerQuestion > 45 && (
              <div className="p-3 bg-gray-800 rounded-lg">
                <span className="text-yellow-400">• Crisis Management</span>
                <p className="text-sm text-gray-400 mt-1">
                  Enhance rapid response capabilities
                </p>
              </div>
            )}
            {quizResults.amount > 7000000 && (
              <div className="p-3 bg-gray-800 rounded-lg">
                <span className="text-yellow-400">• Risk Assessment</span>
                <p className="text-sm text-gray-400 mt-1">
                  Improve risk evaluation strategies
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <PieChart className="w-6 h-6 mr-2" /> Detailed Question Analysis
        </h2>
        <div className="space-y-4">
          {Object.entries(quizResults.answeredQuestions).map(([index, answer]: [string, any]) => {
            const isCorrect = answer === 1; // Assuming correctAnswer is 1 for simplicity
            
            return (
              <div key={index} className="p-4 bg-gray-800 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
                    )}
                    <div>
                      <p className="font-medium">Question {parseInt(index) + 1}</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Response time: {Math.round(metrics.avgTimePerQuestion)}s
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      isCorrect ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {isCorrect ? '+5 points' : '+$1M to ransom'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Report;