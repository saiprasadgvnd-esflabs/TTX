import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, LogIn, User, Briefcase, FileWarning } from 'lucide-react';

const ROLES = [
  'Board Member',
  'CEO',
  'CISO',
  'CIO',
  'Chief Legal Officer',
  'HR',
  'CFO',
  'GRC',
  'CTO',
  'IT Head',
  'Plant Head',
  'IR Team',
  'IT Team',
  'SOC Team',
  'PR and Communication'
];

const EXERCISE_TYPES = [
  'Ransomware',
  'Phishing Attack',
  'Data Breach'
];

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  const [exerciseType, setExerciseType] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Store user info in sessionStorage
    sessionStorage.setItem('userInfo', JSON.stringify({
      username,
      role,
      exerciseType,
      startTime: new Date().toISOString()
    }));

    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
      navigate('/questions');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-cyan-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/10 mb-4">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
            Cyber Dharshinik
          </h1>
          <p className="text-gray-400 mt-2">Cybersecurity Exercise Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-8 shadow-xl border border-gray-700">
          <div className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-2 flex items-center">
                <User className="w-4 h-4 mr-2" />
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors text-white placeholder-gray-500"
                placeholder="Enter your username"
                required
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium mb-2 flex items-center">
                <Briefcase className="w-4 h-4 mr-2" />
                Role
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors text-white"
                required
              >
                <option value="">Select your role</option>
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="exerciseType" className="block text-sm font-medium mb-2 flex items-center">
                <FileWarning className="w-4 h-4 mr-2" />
                Exercise Type
              </label>
              <select
                id="exerciseType"
                value={exerciseType}
                onChange={(e) => setExerciseType(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors text-white"
                required
              >
                <option value="">Select exercise type</option>
                {EXERCISE_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-600 focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Start Exercise
                </>
              )}
            </button>
          </div>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Cybersecurity Training and Assessment Platform
        </p>
      </div>
    </div>
  );
}

export default Login;