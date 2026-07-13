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

interface DayNote {
  date: string;
  notesText: string;
  feltGood: boolean;
  drankWater: boolean;
}

export default function FitnessPlanner() {
  // --- STATE MANAGEMENT ---
  const [userEmail, setUserEmail] = useState('');
  const [authEmailInput, setAuthEmailInput] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [largeTextMode, setLargeTextMode] = useState(false);
  
  // Date and Calendar States
  const [calendarDays] = useState(() => getWeekDates());
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = calendarDays.find(d => d.isToday);
    return today ? today.dateString : calendarDays[0].dateString;
  });

  // Main Exercise & Tracking Logs
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [dailyNotes, setDailyNotes] = useState<DayNote[]>([]);
  
  // Custom Dynamic Search Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>('all');
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [generatedRoutine, setGeneratedRoutine] = useState<Exercise[]>([]);
  
  // Live Clock Countdown States
  const [timerExercise, setTimerExercise] = useState<Exercise | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  // Safety Self-Checklist states
  const [safetyCleared, setSafetyCleared] = useState({
    clearSpace: false,
    hasWater: false,
    goodShoes: false
  });

  // Custom Day Note Form Inputs
  const [currentNoteText, setCurrentNoteText] = useState('');
  const [currentFeltGood, setCurrentFeltGood] = useState(true);
  const [currentDrankWater, setCurrentDrankWater] = useState(false);

  // --- INITIAL DATA SYNC (LOCALSTORAGE) ---
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const activeUser = localStorage.getItem('app_user_session');
    const activeGuest = localStorage.getItem('app_guest_session');

    let profileKey = 'guest';
    if (activeUser) {
      setUserEmail(activeUser);
      setIsLoggedIn(true);
      profileKey = activeUser;
    } else if (activeGuest === 'true') {
      setIsGuestMode(true);
    }

    const storedLogs = localStorage.getItem(`fit_logs_${profileKey}`);
    if (storedLogs) setLogs(JSON.parse(storedLogs));

    const storedNotes = localStorage.getItem(`fit_notes_${profileKey}`);
    if (storedNotes) setDailyNotes(JSON.parse(storedNotes));

    setLargeTextMode(localStorage.getItem('app_text_scale') === 'large');
  }, []);

  // --- AUTOMATIC SAVE BACKUPS ---
  useEffect(() => {
    if (!isLoggedIn && !isGuestMode) return;
    const profileKey = isLoggedIn ? userEmail : 'guest';
    
    localStorage.setItem(`fit_logs_${profileKey}`, JSON.stringify(logs));
    localStorage.setItem(`fit_notes_${profileKey}`, JSON.stringify(dailyNotes));
  }, [logs, dailyNotes, isLoggedIn, isGuestMode, userEmail]);

  // --- SYNC DAY NOTE INPUTS WHEN CURRENT DATE CHANGES ---
  useEffect(() => {
    const match = dailyNotes.find(n => n.date === selectedDate);
    if (match) {
      setCurrentNoteText(match.notesText);
      setCurrentFeltGood(match.feltGood);
      setCurrentDrankWater(match.drankWater);
    } else {
      setCurrentNoteText('');
      setCurrentFeltGood(true);
      setCurrentDrankWater(false);
    }
  }, [selectedDate, dailyNotes]);

  // --- COUNTDOWN LIVE WATCH TIMER ---
  useEffect(() => {
    let timerId: NodeJS.Timeout;
    if (timerActive && secondsRemaining > 0) {
      timerId = setInterval(() => setSecondsRemaining(p => p - 1), 1000);
    } else if (secondsRemaining === 0 && timerActive) {
      setTimerActive(false);
      if (timerExercise) {
        const uniqueId = `log_${Date.now()}`;
        setLogs(prev => [{
          id: uniqueId,
          date: selectedDate,
          name: timerExercise.name,
          minutes: timerExercise.minutes,
          category: timerExercise.category
        }, ...prev]);
        alert(`Good job! Your completed session for "${timerExercise.name}" has been logged successfully.`);
      }
    }
    return () => clearInterval(timerId);
  }, [timerActive, secondsRemaining, timerExercise, selectedDate]);

  // --- ACTIONS & UTILITIES ---
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmailInput.trim()) return;
    const cleanEmail = authEmailInput.trim().toLowerCase();
    
    localStorage.removeItem('app_guest_session');
    localStorage.setItem('app_user_session', cleanEmail);
    
    setUserEmail(cleanEmail);
    setIsLoggedIn(true);
    setIsGuestMode(false);
    
    const storedLogs = localStorage.getItem(`fit_logs_${cleanEmail}`);
    setLogs(storedLogs ? JSON.parse(storedLogs) : []);
    const storedNotes = localStorage.getItem(`fit_notes_${cleanEmail}`);
    setDailyNotes(storedNotes ? JSON.parse(storedNotes) : []);
  };

  const handleExploreAsGuest = () => {
    localStorage.removeItem('app_user_session');
    localStorage.setItem('app_guest_session', 'true');
    
    setUserEmail('');
    setIsLoggedIn(false);
    setIsGuestMode(true);
    
    const storedLogs = localStorage.getItem('fit_logs_guest');
    setLogs(storedLogs ? JSON.parse(storedLogs) : []);
    const storedNotes = localStorage.getItem('fit_notes_guest');
    setDailyNotes(storedNotes ? JSON.parse(storedNotes) : []);
  };

  const toggleMuscleTag = (muscleName: string) => {
    setSelectedMuscles(prev => 
      prev.includes(muscleName) ? prev.filter(m => m !== muscleName) : [...prev, muscleName]
    );
  };

  const handleBuildExerciseList = () => {
    if (selectedMuscles.length === 0) {
      setGeneratedRoutine([]);
      return;
    }
    const filtered = EXERCISES_DB.filter(ex => 
      ex.targetMuscles.some(m => selectedMuscles.includes(m))
    );
    setGeneratedRoutine(filtered);
  };

  const saveDailyNotesHandler = (e: React.FormEvent) => {
    e.preventDefault();
    setDailyNotes(prev => {
      const filtered = prev.filter(n => n.date !== selectedDate);
      return [...filtered, {
        date: selectedDate,
        notesText: currentNoteText,
        feltGood: currentFeltGood,
        drankWater: currentDrankWater
      }];
    });
    alert('Your health notes for this day have been saved.');
  };

  const startClock = (ex: Exercise) => {
    setTimerExercise(ex);
    setSecondsRemaining(ex.minutes * 60);
    setTimerActive(true);
    // Reset safety checklist triggers for the new task
    setSafetyCleared({ clearSpace: false, hasWater: false, goodShoes: false });
  };

  const removeLoggedItem = (id: string) => {
    setLogs(prev => prev.filter(item => item.id !== id));
  };

  const sumMinutesByCategory = (category: string) => {
    return logs
      .filter(l => l.category === category)
      .reduce((sum, current) => sum + current.minutes, 0);
  };

  // Generate plain-text CSV format file summary data for manual download offline backup
  const downloadMyLogsData = () => {
    if (logs.length === 0) {
      alert("You don't have any logged exercises to download yet.");
      return;
    }
    let csvContent = "Date,Exercise Name,Category,Duration Minutes\n";
    logs.forEach(item => {
      csvContent += `${item.date},"${item.name.replace(/"/g, '""')}",${item.category},${item.minutes}\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `senior_fitness_report_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExitApp = () => {
    localStorage.removeItem('app_user_session');
    localStorage.removeItem('app_guest_session');
    setIsLoggedIn(false);
    setIsGuestMode(false);
    setUserEmail('');
    setLogs([]);
    setDailyNotes([]);
  };

  // Filter main collection view list based on search bar inputs + category layout tabs
  const filteredExercisesCatalog = EXERCISES_DB.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ex.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeCategoryTab === 'all' || ex.category === activeCategoryTab;
    return matchesSearch && matchesTab;
  });


  // --- WELCOME & AUTHORIZATION SCREEN ---
  if (!isLoggedIn && !isGuestMode) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-slate-200 p-8 rounded-lg shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-slate-800">Senior Fitness & Health Planner</h1>
            <p className="text-sm text-slate-500 mt-2">Track daily workouts, check off CDC health standards, and read step-by-step physical safety directions.</p>
          </div>
          
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Sign In With Email</label>
              <input 
                type="email" 
                required 
                placeholder="grandpa@email.com"
                value={authEmailInput}
                onChange={e => setAuthEmailInput(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2 rounded transition-colors">
              Log In to My Profile
            </button>
          </form>

          <div className="relative my-5 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
            <span className="relative bg-white px-3 text-xs text-slate-400 font-medium">OR</span>
          </div>

          <button 
            onClick={handleExploreAsGuest}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm py-2 rounded transition-colors border border-slate-300"
          >
            Continue as Guest (No Profile Created)
          </button>
        </div>
      </div>
    );
  }


  // --- MAIN CENTRAL WORKSPACE VIEW ---
  return (
    <div className={`min-h-screen bg-slate-50 text-slate-800 p-4 font-sans ${largeTextMode ? 'text-lg' : 'text-sm'}`}>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Navigation Control Bar */}
        <header className="bg-white border border-slate-200 p-4 rounded-md flex flex-wrap justify-between items-center gap-4 shadow-xs">
          <div>
            <h1 className="font-bold text-xl text-slate-900">Senior Daily Health Station</h1>
            <p className="text-xs text-slate-500">
              {isGuestMode ? "Running in Guest Mode (Temporary Dashboard Saved)" : `Account Profile: ${userEmail}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={downloadMyLogsData}
              className="px-3 py-1.5 border border-slate-300 text-xs font-medium rounded bg-white hover:bg-slate-100 transition-colors text-slate-700"
            >
              Download Progress Report (CSV)
            </button>
            <button 
              onClick={() => {
                const updatedToggle = !largeTextMode;
                setLargeTextMode(updatedToggle);
                localStorage.setItem('app_text_scale', updatedToggle ? 'large' : 'normal');
              }}
              className="px-3 py-1.5 border border-slate-300 text-xs font-medium rounded bg-white hover:bg-slate-100 transition-colors"
            >
              {largeTextMode ? 'Standard Text Size' : 'Larger Text Size'}
            </button>
            <button 
              onClick={handleExitApp}
              className="px-3 py-1.5 border border-slate-300 text-xs font-medium rounded bg-white hover:bg-slate-100 text-red-600 transition-colors"
            >
              Sign Out / Leave Portal
            </button>
          </div>
        </header>

        {/* Calendar Day Picker Timeline */}
        <section className="bg-white border border-slate-200 p-4 rounded-md shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Choose a Day to Manage Workspace:</p>
          <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
            {calendarDays.map((day) => {
              const matched = selectedDate === day.dateString;
              return (
                <button
                  key={day.dateString}
                  onClick={() => setSelectedDate(day.dateString)}
                  className={`p-3 border rounded text-left flex flex-col justify-between transition-colors ${matched ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wide opacity-80">{day.dayName}</span>
                  <span className="text-base font-bold mt-1">{day.dayOfMonth} {day.monthLabel}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Master Multi-Column Content Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT INTERACTIVE COLUMN BLOCK */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Custom Targeted Muscle Search Matrix */}
            <div className="bg-white border border-slate-200 p-5 rounded-md shadow-xs space-y-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">1. Muscle Focus Finder</h3>
                <p className="text-xs text-slate-500 mt-0.5">Click target muscles to find custom routines designed for older adults.</p>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2">Target Areas</label>
                <div className="flex flex-wrap gap-1.5">
                  {MUSCLE_GROUPS.map(mName => {
                    const chosen = selectedMuscles.includes(mName);
                    return (
                      <button
                        key={mName}
                        type="button"
                        onClick={() => toggleMuscleTag(mName)}
                        className={`text-xs px-2.5 py-1 border rounded transition-colors ${chosen ? 'bg-blue-50 border-blue-400 text-blue-700 font-medium' : 'bg-white border-slate-200 hover:bg-slate-100'}`}
                      >
                        {chosen ? `✓ ${mName}` : `+ ${mName}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleBuildExerciseList}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 rounded transition-colors"
              >
                Search Safe Exercises
              </button>

              {generatedRoutine.length > 0 && (
                <div className="pt-3 space-y-2 border-t border-slate-100">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Available Match Options</p>
                  <div className="space-y-2">
                    {generatedRoutine.map(exItem => (
                      <div key={exItem.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded flex justify-between items-center text-xs">
                        <div>
                          <p className="font-semibold text-slate-800">{exItem.name}</p>
                          <p className="text-[10px] text-slate-400">Focuses on: {exItem.targetMuscles.join(', ')}</p>
                        </div>
                        <button 
                          onClick={() => startClock(exItem)}
                          className="bg-white border border-slate-300 hover:bg-slate-100 px-2.5 py-1 rounded text-xs font-medium text-slate-700"
                        >
                          Start
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* CDC Fitness Guidelines Monitoring Module */}
            <div className="bg-white border border-slate-200 p-5 rounded-md shadow-xs space-y-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">2. Official CDC Goals Tracker</h3>
                <p className="text-xs text-slate-500 mt-0.5">Check your current logged totals against the official guidelines for safe aging.</p>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs flex justify-between items-center">
                  <div>
                    <span className="font-bold block text-slate-700">Aerobic Walking Target</span>
                    <span className="text-slate-400 text-[11px]">CDC recommends 150 minutes weekly</span>
                  </div>
                  <span className="text-sm font-mono font-bold text-slate-800">{sumMinutesByCategory('aerobic')} / 150 min</span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs flex justify-between items-center">
                  <div>
                    <span className="font-bold block text-slate-700">Muscle Strength Target</span>
                    <span className="text-slate-400 text-[11px]">CDC recommends at least 2 days a week</span>
                  </div>
                  <span className="text-sm font-mono font-bold text-slate-800">{sumMinutesByCategory('strength')} min total</span>
                </div>
              </div>
            </div>

            {/* Interactive Daily Note Log & Hydration Checklist */}
            <div className="bg-white border border-slate-200 p-5 rounded-md shadow-xs">
              <h3 className="font-bold text-base text-slate-900 mb-1">3. Daily Health Notes</h3>
              <p className="text-xs text-slate-500 mb-3">Write down personal reminders or health checkups for {selectedDate}.</p>
              
              <form onSubmit={saveDailyNotesHandler} className="space-y-3 text-xs">
                <div>
                  <label className="flex items-center gap-2 text-slate-700 font-medium cursor-pointer mb-1.5">
                    <input 
                      type="checkbox"
                      checked={currentFeltGood}
                      onChange={e => setCurrentFeltGood(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-0"
                    />
                    I felt good and full of energy today
                  </label>
                  
                  <label className="flex items-center gap-2 text-slate-700 font-medium cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={currentDrankWater}
                      onChange={e => setCurrentDrankWater(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-0"
                    />
                    I drank enough water today (Hydration check)
                  </label>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Personal Diary Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Example: Legs felt a bit stiff in the morning, felt much better after the chair stands..."
                    value={currentNoteText}
                    onChange={e => setCurrentNoteText(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white py-1.5 text-xs font-medium rounded transition-colors"
                >
                  Save Daily Notes
                </button>
              </form>
            </div>

          </div>

          {/* RIGHT OPERATIONAL COLUMN BLOCK */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Expanded Active Countdown Exercise Station */}
            {timerExercise && (
              <div className="bg-slate-900 text-white p-5 rounded-md shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider">Exercise Station</span>
                    <h3 className="font-bold text-lg text-white mt-0.5">{timerExercise.name}</h3>
                  </div>
                  
                  {/* Lock timer play toggle until pre-workout guidelines are checked */}
                  <button 
                    onClick={() => {
                      if (!safetyCleared.clearSpace || !safetyCleared.hasWater || !safetyCleared.goodShoes) {
                        alert("Please read and check off the pre-workout safety list below before starting the exercise countdown timer!");
                        return;
                      }
                      setTimerActive(!timerActive);
                    }}
                    className={`text-xs px-3 py-1.5 rounded font-medium transition-colors ${timerActive ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' : 'bg-white text-slate-950 hover:bg-slate-100'}`}
                  >
                    {timerActive ? 'Pause Exercise' : 'Start Exercise'}
                  </button>
                </div>

                {/* Pre-Workout Essential Safety Checklist */}
                <div className="bg-slate-800 p-3 rounded border border-slate-700 text-xs space-y-2">
                  <p className="font-bold text-amber-400 uppercase tracking-wide text-[10px]">Pre-Workout Check (Tap to Confirm):</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-300">
                    <label className="flex items-center gap-2 cursor-pointer bg-slate-900 p-2 rounded border border-slate-700">
                      <input 
                        type="checkbox"
                        checked={safetyCleared.clearSpace}
                        onChange={e => setSafetyCleared(p => ({...p, clearSpace: e.target.checked}))}
                        className="rounded text-amber-500"
                      />
                      Floor is clear
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer bg-slate-900 p-2 rounded border border-slate-700">
                      <input 
                        type="checkbox"
                        checked={safetyCleared.hasWater}
                        onChange={e => setSafetyCleared(p => ({...p, hasWater: e.target.checked}))}
                        className="rounded text-amber-500"
                      />
                      Water is nearby
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer bg-slate-900 p-2 rounded border border-slate-700">
                      <input 
                        type="checkbox"
                        checked={safetyCleared.goodShoes}
                        onChange={e => setSafetyCleared(p => ({...p, goodShoes: e.target.checked}))}
                        className="rounded text-amber-500"
                      />
                      Safe shoes on
                    </label>
                  </div>
                </div>

                <div className="text-center py-2">
                  <div className="text-5xl font-mono text-white font-bold inline-block bg-slate-800 px-5 py-2 rounded border border-slate-700">
                    {Math.floor(secondsRemaining / 60).toString().padStart(2, '0')}:{(secondsRemaining % 60).toString().padStart(2, '0')}
                  </div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-2">Minutes & Seconds Remaining</p>
                </div>

                <div className="text-xs text-slate-300 space-y-2 bg-slate-800 p-3 rounded border border-slate-700">
                  <p className="font-bold text-white">How to perform step-by-step:</p>
                  <ol className="list-decimal pl-4 space-y-1 text-slate-300">
                    {timerExercise.instructions.map((stepMessage, idx) => (
                      <li key={idx}>{stepMessage}</li>
                    ))}
                  </ol>
                  <div className="mt-2 pt-2 border-t border-slate-700">
                    <p className="text-amber-400 text-[11px]"><strong>Senior Safety Guard:</strong> {timerExercise.safetyTip}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Comprehensive Search Catalog Browser */}
            <div className="bg-white border border-slate-200 p-5 rounded-md shadow-xs space-y-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">4. Complete Exercise Catalog</h3>
                <p className="text-xs text-slate-500 mt-0.5">Browse through any safe training option directly and view instructions.</p>
              </div>

              {/* Filtering Utilities */}
              <div className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="text"
                  placeholder="🔍 Search exercises (e.g. walk, chair, stand)..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500"
                />
                
                <div className="flex gap-1 bg-slate-100 p-1 rounded border border-slate-200 overflow-x-auto">
                  {['all', 'aerobic', 'strength', 'balance', 'stretch'].map(tabName => (
                    <button
                      key={tabName}
                      onClick={() => setActiveCategoryTab(tabName)}
                      className={`text-[11px] font-medium px-2.5 py-1 rounded capitalize transition-all ${activeCategoryTab === tabName ? 'bg-white shadow-xs font-bold text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      {tabName}
                    </button>
                  ))}
                </div>
              </div>

              {/* Catalog Dynamic Grid Results */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredExercisesCatalog.length === 0 ? (
                  <div className="col-span-2 text-center py-4 text-xs text-slate-400 bg-slate-50 rounded border border-dashed border-slate-200">
                    No exercises fit your criteria. Try adjustments to your keywords.
                  </div>
                ) : (
                  filteredExercisesCatalog.map(ex => (
                    <div key={ex.id} className="p-3 border border-slate-200 rounded bg-slate-50 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-xs text-slate-900">{ex.name}</h4>
                          <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 capitalize">
                            {ex.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{ex.description}</p>
                      </div>
                      
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                        <span className="text-[10px] font-medium text-slate-400">Time: {ex.minutes} Mins</span>
                        <button
                          onClick={() => startClock(ex)}
                          className="bg-white border border-slate-300 hover:bg-slate-100 text-blue-600 px-2 py-0.5 rounded text-[11px] font-semibold"
                        >
                          Select Track
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Daily History Log Book */}
            <div className="bg-white border border-slate-200 p-5 rounded-md shadow-xs space-y-4">
              <h3 className="font-bold text-base text-slate-900">5. Your Activity Log Book</h3>
              
              {logs.filter(l => l.date === selectedDate).length === 0 ? (
                <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded text-xs text-slate-400">
                  No activities recorded yet for {selectedDate}. Complete a guide sequence from the explorer to record progress points.
                </div>
              ) : (
                <div className="space-y-2">
                  {logs.filter(l => l.date === selectedDate).map(logItem => (
                    <div key={logItem.id} className="p-3 border border-slate-200 rounded flex justify-between items-center bg-white text-xs">
                      <div>
                        <p className="font-semibold text-slate-800">{logItem.name}</p>
                        <p className="text-[10px] text-slate-500 capitalize">Category: {logItem.category} • Duration: {logItem.minutes} Minutes</p>
                      </div>
                      <button 
                        onClick={() => removeLoggedItem(logItem.id)}
                        className="text-red-500 hover:text-red-700 font-medium"
                      >
                        Remove
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