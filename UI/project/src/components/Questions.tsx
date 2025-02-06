import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Timer, Shield, DollarSign, Brain, AlertTriangle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { generateScenarioAndQuestions, Question } from '../lib/openai';

const INITIAL_AMOUNT = 5000000;
const PENALTY_AMOUNT = 1000000;
const REWARD_AMOUNT = 500000;
const CORRECT_SCORE = 5;
const TIME_PER_QUESTION = 60; // 60 seconds per question

function Questions() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [scenario, setScenario] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [amount, setAmount] = useState(INITIAL_AMOUNT);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<{[key: number]: number}>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [showScenario, setShowScenario] = useState(true);

  useEffect(() => {
    const userInfo = sessionStorage.getItem('userInfo');
    if (!userInfo) {
      navigate('/login');
      return;
    }

    const { exerciseType, role } = JSON.parse(userInfo);
    generateScenarioAndQuestions(exerciseType, role)
      .then(({ scenario, questions }) => {
        setScenario(scenario);
        setQuestions(questions);
        setTimeLeft(questions.length * TIME_PER_QUESTION);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to generate scenario:', error);
        navigate('/login');
      });
  }, [navigate]);

  useEffect(() => {
    let timer: number;
    if (isRunning && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      // Store results and navigate to report
      storeResults();
      navigate('/report');
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, navigate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const storeResults = () => {
    sessionStorage.setItem('quizResults', JSON.stringify({
      score,
      amount,
      answeredQuestions,
      timeSpent: questions.length * TIME_PER_QUESTION - timeLeft,
      scenario
    }));
  };

  const handleAnswer = (optionIndex: number) => {
    if (answeredQuestions[currentQuestion] !== undefined) return;

    const newAnsweredQuestions = {
      ...answeredQuestions,
      [currentQuestion]: optionIndex
    };
    setAnsweredQuestions(newAnsweredQuestions);

    const isCorrect = optionIndex === questions[currentQuestion].correctAnswer;
    if (isCorrect) {
      setScore(prev => prev + CORRECT_SCORE);
      setAmount(prev => prev - REWARD_AMOUNT);
    } else {
      setAmount(prev => prev + PENALTY_AMOUNT);
    }
    setShowExplanation(true);

    if (Object.keys(newAnsweredQuestions).length === questions.length) {
      storeResults();
      navigate('/report');
    }
  };

  const startExercise = () => {
    setShowScenario(false);
    setIsRunning(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-cyan-500 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p className="text-xl">Generating scenario and questions...</p>
        </div>
      </div>
    );
  }

  if (showScenario) {
    return (
      <div className="min-h-screen bg-black text-cyan-500 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-4 mb-8">
            <Shield className="w-8 h-8" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
              Cyber Dharshinik
            </h1>
          </div>
          
          <div className="bg-gray-900 rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-4">Incident Scenario</h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-8 whitespace-pre-wrap">
              {scenario}
            </p>
            <button
              onClick={startExercise}
              className="px-8 py-3 bg-cyan-500 text-black font-semibold rounded-lg hover:bg-cyan-600 transition-colors"
            >
              Start Exercise
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-cyan-500 p-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <Shield className="w-8 h-8" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
            Cyber Dharshinik
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-gray-900 px-4 py-2 rounded-lg">
            <span className="font-bold">Score: {score}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-3 bg-gray-900 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Brain className="w-5 h-5 mr-2" /> Question Progress
          </h2>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`p-2 rounded-lg text-center transition-colors ${
                  currentQuestion === index
                    ? 'bg-cyan-500 text-black'
                    : answeredQuestions[index] !== undefined
                    ? 'bg-gray-700'
                    : 'bg-gray-800'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        <div className="col-span-9 space-y-6">
          <div className="bg-gray-900 rounded-xl p-6 flex justify-between items-center">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <Timer className="w-6 h-6" />
                <span className="text-2xl font-mono">{formatTime(timeLeft)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="w-6 h-6" />
                <span className="text-2xl font-mono">
                  ${amount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
              <h2 className="text-2xl font-bold">Question {currentQuestion + 1}</h2>
            </div>
            <div className="space-y-6">
              <p className="text-lg text-gray-300">
                {questions[currentQuestion].question}
              </p>
              <div className="space-y-3">
                {questions[currentQuestion].options.map((option, index) => {
                  const isAnswered = answeredQuestions[currentQuestion] !== undefined;
                  const isSelected = answeredQuestions[currentQuestion] === index;
                  const isCorrect = index === questions[currentQuestion].correctAnswer;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswer(index)}
                      disabled={isAnswered}
                      className={`w-full p-4 rounded-lg text-left transition-colors ${
                        isAnswered
                          ? isCorrect
                            ? 'bg-green-500 text-black'
                            : isSelected
                            ? 'bg-red-500 text-black'
                            : 'bg-gray-800 opacity-50'
                          : 'bg-gray-800 hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center">
                        {isAnswered && isCorrect && <CheckCircle className="w-5 h-5 mr-2" />}
                        {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 mr-2" />}
                        {option}
                      </div>
                    </button>
                  );
                })}
              </div>

              {showExplanation && (
                <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Explanation:</h3>
                  <p className="text-gray-300">{questions[currentQuestion].explanation}</p>
                </div>
              )}

              <div className="flex justify-between mt-6">
                <button
                  onClick={() => {
                    if (currentQuestion > 0) {
                      setCurrentQuestion(prev => prev - 1);
                      setShowExplanation(false);
                    }
                  }}
                  disabled={currentQuestion === 0}
                  className="px-6 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => {
                    if (currentQuestion < questions.length - 1) {
                      setCurrentQuestion(prev => prev + 1);
                      setShowExplanation(false);
                    }
                  }}
                  disabled={currentQuestion === questions.length - 1}
                  className="px-6 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Questions;