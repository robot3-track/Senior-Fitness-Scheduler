'use client';

import React, { useState, useEffect } from 'react';
import { EXERCISES_DB, MUSCLE_GROUPS, getWeekDates, Exercise } from './exerciseData';

interface LogItem {
  id: string;
  date: string;
  name: string;
  minutes: number;
  category: string;
}

export default function FitnessPlanner() {
  // Session & UI States
  const [userEmail, setUserEmail] = useState('');
  const [authEmailInput, setAuthEmailInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [largeTextMode, setLargeTextMode] = useState(false);
  
  // Date & Calendar States
  const [calendarDays] = useState(() => getWeekDates());
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = calendarDays.find(d => d.isToday);
    return today ? today.dateString : calendarDays[0].dateString;
  });

  // Workout Tracker & Custom Routine States
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [generatedRoutine, setGeneratedRoutine] = useState<Exercise[]>([]);
  
  // Workout Timer States
  const [timerExercise, setTimerExercise] = useState<Exercise | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  // Load saved session on startup
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const activeUser = localStorage.getItem('app_user_session');
    if (activeUser) {
      setUserEmail(activeUser);
      setIsAuthenticated(true);
      const storedLogs = localStorage.getItem(`fit_logs_${activeUser}`);
      if (storedLogs) setLogs(JSON.parse(storedLogs));
    }
    setLargeTextMode(localStorage.getItem('app_text_scale') === 'large');
  }, []);

  // Save logs whenever they change
  useEffect(() => {
    if (!isAuthenticated || !userEmail) return;
    localStorage.setItem(`fit_logs_${userEmail}`, JSON.stringify(logs));
  }, [logs, isAuthenticated, userEmail]);

  // Handle the active countdown timer
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (timerActive && secondsRemaining > 0) {
      intervalId = setInterval(() => setSecondsRemaining(prev => prev - 1), 1000);
    } else if (secondsRemaining === 0 && timerActive) {
      setTimerActive(false);
      if (timerExercise) {
        const newLogId = `log_${Date.now()}`;
        setLogs(prev => [{
          id: newLogId,
          date: selectedDate,
          name: timerExercise.name,
          minutes: timerExercise.minutes,
          category: timerExercise.category
        }, ...prev]);
        alert(`Awesome job! ${timerExercise.name} has been added to your log for today.`);
      }
    }
    return () => clearInterval(intervalId);
  }, [timerActive, secondsRemaining, timerExercise, selectedDate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmailInput.trim()) return;
    const cleanEmail = authEmailInput.trim().toLowerCase();
    localStorage.setItem('app_user_session', cleanEmail);
    setUserEmail(cleanEmail);
    setIsAuthenticated(true);
    const storedLogs = localStorage.getItem(`fit_logs_${cleanEmail}`);
    setLogs(storedLogs ? JSON.parse(storedLogs) : []);
  };

  const toggleMuscleSelection = (muscle: string) => {
    setSelectedMuscles(prev => 
      prev.includes(muscle) ? prev.filter(m => m !== muscle) : [...prev, muscle]
    );
  };

  const handleMakeRoutine = () => {
    if (selectedMuscles.length === 0) {
      setGeneratedRoutine([]);
      return;
    }
    const matches = EXERCISES_DB.filter(ex => 
      ex.targetMuscles.some(m => selectedMuscles.includes(m))
    );
    setGeneratedRoutine(matches);
  };

  const startExercise = (ex: Exercise) => {
    setTimerExercise(ex);
    setSecondsRemaining(ex.minutes * 60);
    setTimerActive(true);
  };

  const deleteLogItem = (id: string) => {
    setLogs(prev => prev.filter(item => item.id !== id));
  };

  const getTotalMinutes = (category: string) => {
    return logs
      .filter(l => l.category === category)
      .reduce((sum, item) => sum + item.minutes, 0);
  };

  // Login View
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-slate-200 p-8 rounded-md shadow-sm">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">My Fitness Planner</h1>
            <p className="text-sm text-slate-500 mt-1">Please log in with your email to view your daily workout schedule.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Email Address</label>
              <input 
                type="email" 
                required 
                placeholder="student@school.edu"
                value={authEmailInput}
                onChange={e => setAuthEmailInput(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-sm text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2 rounded-sm transition-colors">
              Log In
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Main Dashboard View
  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 p-4 font-sans ${largeTextMode ? 'text-lg' : 'text-sm'}`}>
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Top Navbar */}
        <header className="bg-white border border-slate-200 p-4 rounded-md flex flex-wrap justify-between items-center gap-4 shadow-sm">
          <div>
            <h1 className="font-bold text-xl text-slate-900">My Daily Fitness Hub</h1>
            <p className="text-xs text-slate-500">Logged in as: <span className="font-medium text-slate-700">{userEmail}</span></p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                const nextState = !largeTextMode;
                setLargeTextMode(nextState);
                localStorage.setItem('app_text_scale', nextState ? 'large' : 'normal');
              }}
              className="px-3 py-1.5 border border-slate-300 text-xs font-medium rounded-sm bg-white hover:bg-slate-50 transition-colors"
            >
              {largeTextMode ? 'Standard Text' : 'Larger Text'}
            </button>
            <button 
              onClick={() => {
                localStorage.removeItem('app_user_session');
                setIsAuthenticated(false);
              }}
              className="px-3 py-1.5 border border-slate-300 text-xs font-medium rounded-sm bg-white hover:bg-slate-50 text-red-600 transition-colors"
            >
              Log Out
            </button>
          </div>
        </header>

        {/* Week Calendar */}
        <section className="bg-white border border-slate-200 p-4 rounded-md shadow-sm">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Select a Day</h2>
          <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
            {calendarDays.map((day) => {
              const isSelected = selectedDate === day.dateString;
              return (
                <button
                  key={day.dateString}
                  onClick={() => setSelectedDate(day.dateString)}
                  className={`p-3 border rounded-sm text-left flex flex-col justify-between transition-colors ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{day.dayName.substring(0, 3)}</span>
                  <span className="text-base font-bold mt-1">{day.dayOfMonth} {day.monthLabel}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Dashboard Grid Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Build Routine & Look at Progress */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Custom Routine Builder */}
            <div className="bg-white border border-slate-200 p-5 rounded-md shadow-sm space-y-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">Custom Routine Finder</h3>
                <p className="text-xs text-slate-500 mt-0.5">Pick the muscle groups you want to work on today.</p>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2">Muscles to Target</label>
                <div className="flex flex-wrap gap-1.5">
                  {MUSCLE_GROUPS.map(muscle => {
                    const isPicked = selectedMuscles.includes(muscle);
                    return (
                      <button
                        key={muscle}
                        type="button"
                        onClick={() => toggleMuscleSelection(muscle)}
                        className={`text-xs px-2.5 py-1 border rounded-sm transition-colors ${isPicked ? 'bg-blue-100 border-blue-400 text-blue-800 font-medium' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                      >
                        {isPicked ? `✓ ${muscle}` : `+ ${muscle}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleMakeRoutine}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 rounded-sm transition-colors"
              >
                Find Matching Exercises
              </button>

              {generatedRoutine.length > 0 && (
                <div className="pt-3 space-y-2 border-t border-slate-100">
                  <label className="block text-[10px] font-bold uppercase text-slate-400">Your Custom Workout List</label>
                  <div className="space-y-2">
                    {generatedRoutine.map(ex => (
                      <div key={ex.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-sm flex justify-between items-center text-xs">
                        <div>
                          <p className="font-semibold text-slate-800">{ex.name}</p>
                          <p className="text-[10px] text-slate-500">Targets: {ex.targetMuscles.join(', ')}</p>
                        </div>
                        <button 
                          onClick={() => startExercise(ex)}
                          className="bg-white border border-slate-300 hover:bg-slate-100 px-2.5 py-1 rounded-sm text-xs font-medium"
                        >
                          Start
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Total Goal / Analytics Box */}
            <div className="bg-white border border-slate-200 p-5 rounded-md shadow-sm space-y-4">
              <h3 className="font-bold text-base text-slate-900">Weekly Progress Tracker</h3>
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-sm text-xs flex justify-between items-center">
                  <div>
                    <span className="font-bold block text-slate-700">Aerobic Workouts</span>
                    <span className="text-slate-500">Goal: 150 minutes per week</span>
                  </div>
                  <span className="text-sm font-bold text-slate-800">{getTotalMinutes('aerobic')} / 150 min</span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-sm text-xs flex justify-between items-center">
                  <div>
                    <span className="font-bold block text-slate-700">Strength Training</span>
                    <span className="text-slate-500">Total time spent building muscle</span>
                  </div>
                  <span className="text-sm font-bold text-slate-800">{getTotalMinutes('strength')} min</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Workout Timer & Current Logs */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Active Countdown Timer */}
            {timerExercise && (
              <div className="bg-slate-900 text-white p-5 rounded-md shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Current Exercise</span>
                    <h3 className="font-bold text-lg text-white mt-0.5">{timerExercise.name}</h3>
                  </div>
                  <button 
                    onClick={() => setTimerActive(!timerActive)}
                    className={`text-xs px-3 py-1.5 rounded-sm font-medium ${timerActive ? 'bg-amber-500 text-slate-950' : 'bg-white text-slate-950'}`}
                  >
                    {timerActive ? 'Pause Timer' : 'Resume Timer'}
                  </button>
                </div>

                <div className="text-center py-2">
                  <div className="text-5xl font-mono tracking-tight text-white font-bold inline-block bg-slate-800 px-6 py-2 rounded-sm border border-slate-700">
                    {Math.floor(secondsRemaining / 60).toString().padStart(2, '0')}:{(secondsRemaining % 60).toString().padStart(2, '0')}
                  </div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-2">Time Left (Minutes : Seconds)</p>
                </div>

                <div className="text-xs text-slate-300 space-y-2 bg-slate-800 p-3 rounded-sm border border-slate-700">
                  <p className="font-semibold text-white">How to do it:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    {timerExercise.instructions.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                  {timerExercise.safetyTip && (
                    <p className="text-[11px] text-amber-400 pt-1"><strong>Safety Tip:</strong> {timerExercise.safetyTip}</p>
                  )}
                </div>
              </div>
            )}

            {/* Log History */}
            <div className="bg-white border border-slate-200 p-5 rounded-md shadow-sm space-y-4">
              <h3 className="font-bold text-base text-slate-900">Completed Workouts for Today</h3>
              
              {logs.filter(l => l.date === selectedDate).length === 0 ? (
                <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-sm text-xs text-slate-400">
                  You haven't logged any exercises for {selectedDate} yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {logs.filter(l => l.date === selectedDate).map(item => (
                    <div key={item.id} className="p-3 border border-slate-200 rounded-sm flex justify-between items-center bg-white text-xs">
                      <div>
                        <p className="font-semibold text-slate-800">{item.name}</p>
                        <p className="text-[10px] text-slate-500 capitalize">Type: {item.category} • Duration: {item.minutes} Minutes</p>
                      </div>
                      <button 
                        onClick={() => deleteLogItem(item.id)}
                        className="text-red-500 hover:text-red-700 font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}