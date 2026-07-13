'use client';

import React, { useState, useEffect } from 'react';
import { EXERCISES_DB, MUSCLE_GROUPS, getWeekDates, Exercise } from './exerciseData';

// --- INTERFACES ---
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

interface UserSettings {
  emergencyContactName: string;
  emergencyContactPhone: string;
  highContrastMode: boolean;
}

type ActiveScreen = 'menu' | 'exercises' | 'timer' | 'progress' | 'notes' | 'settings';

export default function FitnessPlanner() {
  // --- CORE STATE ---
  const [userEmail, setUserEmail] = useState('');
  const [authEmailInput, setAuthEmailInput] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<ActiveScreen>('menu');

  // --- DATA STATES ---
  const [calendarDays] = useState(() => getWeekDates());
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = calendarDays.find(d => d.isToday);
    return today ? today.dateString : calendarDays[0].dateString;
  });
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [dailyNotes, setDailyNotes] = useState<DayNote[]>([]);
  const [settings, setSettings] = useState<UserSettings>({
    emergencyContactName: '',
    emergencyContactPhone: '',
    highContrastMode: false
  });

  // --- EXERCISE & TIMER STATES ---
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [timerExercise, setTimerExercise] = useState<Exercise | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [safetyCleared, setSafetyCleared] = useState({ clearSpace: false, hasWater: false, goodShoes: false });

  // --- NOTES STATES ---
  const [currentNoteText, setCurrentNoteText] = useState('');
  const [currentFeltGood, setCurrentFeltGood] = useState(true);
  const [currentDrankWater, setCurrentDrankWater] = useState(false);

  // --- INITIALIZATION (LOAD FROM STORAGE) ---
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

    const storedSettings = localStorage.getItem(`fit_settings_${profileKey}`);
    if (storedSettings) setSettings(JSON.parse(storedSettings));
  }, []);

  // --- AUTO-SAVE (SYNC TO STORAGE) ---
  useEffect(() => {
    if (!isLoggedIn && !isGuestMode) return;
    const profileKey = isLoggedIn ? userEmail : 'guest';
    localStorage.setItem(`fit_logs_${profileKey}`, JSON.stringify(logs));
    localStorage.setItem(`fit_notes_${profileKey}`, JSON.stringify(dailyNotes));
    localStorage.setItem(`fit_settings_${profileKey}`, JSON.stringify(settings));
  }, [logs, dailyNotes, settings, isLoggedIn, isGuestMode, userEmail]);

  // --- SYNC DAILY NOTES ON DATE CHANGE ---
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

  // --- TIMER ENGINE ---
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
        alert(`Excellent work! Your exercise "${timerExercise.name}" has been recorded.`);
        setCurrentScreen('menu');
      }
    }
    return () => clearInterval(timerId);
  }, [timerActive, secondsRemaining, timerExercise, selectedDate]);

  // --- AUTHENTICATION ACTIONS ---
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmailInput.trim()) return;
    const cleanEmail = authEmailInput.trim().toLowerCase();
    localStorage.removeItem('app_guest_session');
    localStorage.setItem('app_user_session', cleanEmail);
    setUserEmail(cleanEmail);
    setIsLoggedIn(true);
    setIsGuestMode(false);
    window.location.reload(); // Force full reload to fetch specific profile data cleanly
  };

  const handleGuest = () => {
    localStorage.setItem('app_guest_session', 'true');
    setIsGuestMode(true);
    window.location.reload();
  };

  const handleLogOut = () => {
    localStorage.removeItem('app_user_session');
    localStorage.removeItem('app_guest_session');
    window.location.reload();
  };

  // --- APP ACTIONS ---
  const startExerciseFlow = (ex: Exercise) => {
    setTimerExercise(ex);
    setSecondsRemaining(ex.minutes * 60);
    setTimerActive(false);
    setSafetyCleared({ clearSpace: false, hasWater: false, goodShoes: false });
    setCurrentScreen('timer');
  };

  const saveNotes = () => {
    setDailyNotes(prev => {
      const filtered = prev.filter(n => n.date !== selectedDate);
      return [...filtered, { date: selectedDate, notesText: currentNoteText, feltGood: currentFeltGood, drankWater: currentDrankWater }];
    });
    alert('Your daily health notes have been saved successfully.');
    setCurrentScreen('menu');
  };

  const downloadMyLogsData = () => {
    if (logs.length === 0) {
      alert("You have no exercises saved yet to download.");
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
    link.setAttribute("download", `My_Health_Report_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sumMinutesByCategory = (category: string) => logs.filter(l => l.category === category).reduce((sum, current) => sum + current.minutes, 0);

  // --- DYNAMIC STYLING (For Settings) ---
  const bgClass = settings.highContrastMode ? 'bg-black text-white' : 'bg-slate-50 text-slate-900';
  const cardClass = settings.highContrastMode ? 'bg-black border-4 border-white' : 'bg-white border-4 border-slate-300';
  const btnClass = settings.highContrastMode ? 'bg-white text-black border-4 border-black hover:bg-gray-300' : 'bg-blue-700 text-white border-4 border-blue-900 hover:bg-blue-800';

  // ==========================================
  // VIEW: AUTHENTICATION / LOGIN
  // ==========================================
  if (!isLoggedIn && !isGuestMode) {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-900 flex items-center justify-center p-6 font-sans">
        <div className="max-w-2xl w-full space-y-8">
          <h1 className="text-5xl font-extrabold text-center text-blue-900 border-b-8 border-blue-900 pb-6">
            Senior Health Station
          </h1>
          
          <div className="bg-white p-10 border-4 border-slate-400 rounded-2xl shadow-xl space-y-8">
            <h2 className="text-3xl font-bold">1. Log In to Your Account</h2>
            <form onSubmit={handleSignIn} className="space-y-6">
              <label className="block text-2xl font-bold text-slate-700">Your Email Address:</label>
              <input 
                type="email" 
                required 
                placeholder="Type your email here..."
                value={authEmailInput}
                onChange={e => setAuthEmailInput(e.target.value)}
                className="w-full px-6 py-6 text-2xl border-4 border-slate-400 rounded-xl"
              />
              <button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-3xl py-6 rounded-xl border-4 border-blue-900">
                Click Here to Log In
              </button>
            </form>
          </div>

          <div className="text-center pt-4">
            <p className="text-2xl font-bold mb-6 text-slate-600">Or use the app without an account:</p>
            <button onClick={handleGuest} className="w-full bg-slate-200 hover:bg-slate-300 text-slate-900 font-extrabold text-3xl py-6 rounded-xl shadow-md border-4 border-slate-500">
              Continue as a Guest User
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: MAIN APPLICATION SHELL
  // ==========================================
  return (
    <div className={`min-h-screen p-4 md:p-8 font-sans text-xl ${bgClass}`}>
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Persistent Header */}
        <header className={`${cardClass} p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-6 shadow-sm`}>
          <div>
            <h1 className="text-4xl font-extrabold">Health Station</h1>
            <p className="text-xl mt-2 font-medium opacity-80">
              {isGuestMode ? "Guest Profile" : `Profile: ${userEmail}`}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            {settings.emergencyContactPhone && (
              <a href={`tel:${settings.emergencyContactPhone}`} className="bg-red-600 text-white font-bold px-6 py-4 rounded-xl text-xl text-center border-4 border-red-900 hover:bg-red-700">
                🚨 Call {settings.emergencyContactName || 'Emergency'}
              </a>
            )}
            {currentScreen !== 'menu' && (
              <button onClick={() => setCurrentScreen('menu')} className="bg-slate-200 text-slate-900 border-4 border-slate-400 font-bold px-8 py-4 rounded-xl text-2xl">
                🔙 Main Menu
              </button>
            )}
          </div>
        </header>

        {/* -------------------------------------- */}
        {/* SCREEN: MAIN MENU (DASHBOARD)          */}
        {/* -------------------------------------- */}
        {currentScreen === 'menu' && (
          <div className="space-y-8">
            {/* Massive Date Picker */}
            <div className={`${cardClass} p-8 rounded-2xl`}>
              <h2 className="text-3xl font-bold mb-6">Step 1: Choose a Date</h2>
              <div className="flex overflow-x-auto gap-4 pb-4">
                {calendarDays.map(day => (
                  <button
                    key={day.dateString}
                    onClick={() => setSelectedDate(day.dateString)}
                    className={`min-w-[140px] p-6 border-4 rounded-2xl flex flex-col items-center justify-center transition-all ${selectedDate === day.dateString ? 'bg-blue-700 border-blue-900 text-white shadow-xl scale-105' : 'bg-slate-100 border-slate-400 text-slate-800'}`}
                  >
                    <span className="text-2xl font-bold">{day.dayName}</span>
                    <span className="text-4xl font-extrabold mt-2">{day.dayOfMonth}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Giant Navigation Tiles */}
            <h2 className="text-3xl font-bold pt-4">Step 2: What would you like to do?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button onClick={() => setCurrentScreen('exercises')} className="bg-blue-100 border-4 border-blue-600 p-10 rounded-2xl text-left hover:bg-blue-200">
                <h3 className="text-4xl font-extrabold text-blue-900 mb-2">🏋️ Exercises</h3>
                <p className="text-2xl text-blue-800">Find safe routines and start a timer.</p>
              </button>
              
              <button onClick={() => setCurrentScreen('progress')} className="bg-green-100 border-4 border-green-600 p-10 rounded-2xl text-left hover:bg-green-200">
                <h3 className="text-4xl font-extrabold text-green-900 mb-2">📊 My Progress</h3>
                <p className="text-2xl text-green-800">Check CDC goals and download logs.</p>
              </button>

              <button onClick={() => setCurrentScreen('notes')} className="bg-yellow-100 border-4 border-yellow-600 p-10 rounded-2xl text-left hover:bg-yellow-200">
                <h3 className="text-4xl font-extrabold text-yellow-900 mb-2">📝 Daily Notes</h3>
                <p className="text-2xl text-yellow-800">Track hydration and how you feel.</p>
              </button>

              <button onClick={() => setCurrentScreen('settings')} className="bg-slate-200 border-4 border-slate-500 p-10 rounded-2xl text-left hover:bg-slate-300">
                <h3 className="text-4xl font-extrabold text-slate-900 mb-2">⚙️ Settings</h3>
                <p className="text-2xl text-slate-700">Emergency contacts & text contrast.</p>
              </button>
            </div>

            <div className="pt-8">
              <button onClick={handleLogOut} className="w-full bg-red-100 border-4 border-red-600 p-8 rounded-2xl text-3xl font-bold text-red-900 hover:bg-red-200">
                🚪 Securely Log Out & Exit
              </button>
            </div>
          </div>
        )}

        {/* -------------------------------------- */}
        {/* SCREEN: EXERCISE FINDER                */}
        {/* -------------------------------------- */}
        {currentScreen === 'exercises' && (
          <div className={`${cardClass} p-8 rounded-2xl space-y-10`}>
            <div>
              <h2 className="text-4xl font-extrabold mb-6">Select Muscle Groups</h2>
              <p className="text-2xl mb-6 opacity-80">Click the areas you want to exercise today:</p>
              <div className="flex flex-wrap gap-4">
                {MUSCLE_GROUPS.map(mName => {
                  const chosen = selectedMuscles.includes(mName);
                  return (
                    <button
                      key={mName}
                      onClick={() => setSelectedMuscles(prev => prev.includes(mName) ? prev.filter(m => m !== mName) : [...prev, mName])}
                      className={`px-8 py-6 text-3xl font-bold border-4 rounded-2xl ${chosen ? 'bg-blue-700 border-blue-900 text-white' : 'bg-slate-100 border-slate-400 text-slate-800'}`}
                    >
                      {chosen ? `✅ ${mName}` : mName}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t-4 border-slate-300 pt-10 space-y-8">
              <h2 className="text-4xl font-extrabold mb-4">Recommended Exercises:</h2>
              {EXERCISES_DB.filter(ex => selectedMuscles.length === 0 || ex.targetMuscles.some(m => selectedMuscles.includes(m))).map(ex => (
                <div key={ex.id} className="bg-slate-100 border-4 border-slate-400 p-8 rounded-2xl text-slate-900">
                  <h3 className="text-4xl font-extrabold text-blue-900 mb-4">{ex.name}</h3>
                  <p className="text-2xl mb-6 font-medium">{ex.description}</p>
                  <p className="text-2xl font-bold mb-8 text-slate-600 bg-white inline-block px-4 py-2 rounded-lg border-2 border-slate-300">
                    Duration: {ex.minutes} Minutes
                  </p>
                  <button onClick={() => startExerciseFlow(ex)} className="w-full bg-blue-700 hover:bg-blue-800 text-white text-3xl font-extrabold py-8 rounded-2xl border-4 border-blue-900">
                    Select This Exercise
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* -------------------------------------- */}
        {/* SCREEN: ACTIVE TIMER & SAFETY CHECK    */}
        {/* -------------------------------------- */}
        {currentScreen === 'timer' && timerExercise && (
          <div className={`${cardClass} p-8 rounded-2xl space-y-10`}>
            <h2 className="text-5xl font-extrabold text-center text-blue-700">{timerExercise.name}</h2>
            
            {/* Mandatory Safety Check */}
            <div className="bg-yellow-100 border-8 border-yellow-500 p-8 rounded-2xl space-y-6 text-slate-900">
              <h3 className="text-4xl font-extrabold text-yellow-900">⚠️ Mandatory Safety Check</h3>
              <p className="text-2xl text-yellow-900 font-bold">You must check all three boxes before the timer will unlock.</p>
              
              <div className="space-y-4 pt-4">
                <label className="flex items-center gap-6 p-6 bg-white border-4 border-yellow-400 rounded-xl cursor-pointer hover:bg-yellow-50">
                  <input type="checkbox" className="w-12 h-12 accent-yellow-600" checked={safetyCleared.clearSpace} onChange={e => setSafetyCleared(p => ({...p, clearSpace: e.target.checked}))} />
                  <span className="text-3xl font-bold">My floor is clear of tripping hazards.</span>
                </label>
                <label className="flex items-center gap-6 p-6 bg-white border-4 border-yellow-400 rounded-xl cursor-pointer hover:bg-yellow-50">
                  <input type="checkbox" className="w-12 h-12 accent-yellow-600" checked={safetyCleared.hasWater} onChange={e => setSafetyCleared(p => ({...p, hasWater: e.target.checked}))} />
                  <span className="text-3xl font-bold">I have a glass of water nearby.</span>
                </label>
                <label className="flex items-center gap-6 p-6 bg-white border-4 border-yellow-400 rounded-xl cursor-pointer hover:bg-yellow-50">
                  <input type="checkbox" className="w-12 h-12 accent-yellow-600" checked={safetyCleared.goodShoes} onChange={e => setSafetyCleared(p => ({...p, goodShoes: e.target.checked}))} />
                  <span className="text-3xl font-bold">I am wearing safe, non-slip shoes.</span>
                </label>
              </div>
            </div>

            {/* Huge Timer Module */}
            <div className="text-center p-10 bg-slate-200 border-4 border-slate-400 rounded-2xl text-slate-900 shadow-inner">
              <div className="text-8xl font-black mb-10 tracking-wider">
                {Math.floor(secondsRemaining / 60).toString().padStart(2, '0')}:{(secondsRemaining % 60).toString().padStart(2, '0')}
              </div>
              <button 
                onClick={() => {
                  if (!safetyCleared.clearSpace || !safetyCleared.hasWater || !safetyCleared.goodShoes) {
                    alert("Please read and check all three yellow safety boxes first.");
                    return;
                  }
                  setTimerActive(!timerActive);
                }}
                className={`w-full py-8 text-4xl font-extrabold rounded-2xl border-8 transition-transform active:scale-95 ${timerActive ? 'bg-amber-500 text-black border-amber-700' : 'bg-green-600 text-white border-green-800'}`}
              >
                {timerActive ? '⏸ Pause Timer' : '▶️ Start Timer Now'}
              </button>
            </div>

            {/* Instruction Steps */}
            <div className="bg-blue-50 border-4 border-blue-300 p-8 rounded-2xl text-slate-900">
              <h3 className="text-3xl font-extrabold text-blue-900 mb-6">Step-by-Step Instructions:</h3>
              <ul className="space-y-6">
                {timerExercise.instructions.map((step, idx) => (
                  <li key={idx} className="flex gap-6 items-start">
                    <span className="bg-blue-900 text-white font-black rounded-full w-12 h-12 flex items-center justify-center shrink-0 text-2xl">{idx + 1}</span>
                    <span className="text-2xl font-medium pt-1">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* -------------------------------------- */}
        {/* SCREEN: PROGRESS & CDC TRACKER         */}
        {/* -------------------------------------- */}
        {currentScreen === 'progress' && (
          <div className={`${cardClass} p-8 rounded-2xl space-y-12`}>
            <div>
              <h2 className="text-4xl font-extrabold mb-8">Official CDC Health Goals</h2>
              
              <div className="space-y-8">
                {/* Aerobic Goal */}
                <div className="bg-slate-100 p-8 border-4 border-slate-300 rounded-2xl text-slate-900">
                  <h3 className="text-3xl font-extrabold mb-4">Aerobic Walking Target</h3>
                  <p className="text-2xl mb-6">Goal: 150 Minutes</p>
                  <p className="text-2xl mb-4 font-bold text-blue-800">You have completed: {sumMinutesByCategory('aerobic')} minutes</p>
                  <div className="w-full bg-slate-300 h-10 rounded-full border-4 border-slate-400 overflow-hidden">
                    <div className="bg-blue-600 h-full" style={{ width: `${Math.min((sumMinutesByCategory('aerobic') / 150) * 100, 100)}%` }}></div>
                  </div>
                </div>

                {/* Strength Goal */}
                <div className="bg-slate-100 p-8 border-4 border-slate-300 rounded-2xl text-slate-900">
                  <h3 className="text-3xl font-extrabold mb-4">Muscle Strength Target</h3>
                  <p className="text-2xl mb-4">Goal: At least 2 days a week</p>
                  <p className="text-2xl font-bold text-green-800">You have logged: {sumMinutesByCategory('strength')} total minutes</p>
                </div>
              </div>
            </div>

            <div className="border-t-4 border-slate-300 pt-10">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                <h2 className="text-4xl font-extrabold">Logs for {selectedDate}</h2>
                <button onClick={downloadMyLogsData} className="bg-slate-800 text-white font-bold text-2xl px-8 py-4 rounded-xl border-4 border-slate-900 hover:bg-slate-700 w-full sm:w-auto">
                  📥 Download Data
                </button>
              </div>

              {logs.filter(l => l.date === selectedDate).length === 0 ? (
                <p className="text-2xl text-slate-600 bg-slate-100 p-10 border-4 border-dashed border-slate-400 rounded-2xl text-center font-bold">
                  No exercises completed on this date yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {logs.filter(l => l.date === selectedDate).map(log => (
                    <div key={log.id} className="p-8 border-4 border-slate-400 rounded-2xl bg-white text-slate-900 flex flex-col sm:flex-row justify-between items-center gap-6">
                      <div className="text-center sm:text-left">
                        <h4 className="text-3xl font-extrabold mb-2">{log.name}</h4>
                        <p className="text-2xl text-slate-600 font-medium">Duration: {log.minutes} Minutes</p>
                      </div>
                      <button onClick={() => setLogs(prev => prev.filter(item => item.id !== log.id))} className="bg-red-100 text-red-900 border-4 border-red-400 font-extrabold text-2xl px-8 py-4 rounded-xl w-full sm:w-auto">
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* -------------------------------------- */}
        {/* SCREEN: DAILY NOTES                    */}
        {/* -------------------------------------- */}
        {currentScreen === 'notes' && (
          <div className={`${cardClass} p-8 rounded-2xl space-y-10`}>
            <h2 className="text-4xl font-extrabold">My Notes for {selectedDate}</h2>
            
            <div className="space-y-6 text-slate-900">
              <label className="flex items-center gap-6 p-8 bg-slate-100 border-4 border-slate-400 rounded-2xl cursor-pointer hover:bg-slate-200">
                <input type="checkbox" className="w-12 h-12 accent-blue-700" checked={currentFeltGood} onChange={e => setCurrentFeltGood(e.target.checked)} />
                <span className="text-3xl font-bold">I felt energetic and well today.</span>
              </label>
              
              <label className="flex items-center gap-6 p-8 bg-slate-100 border-4 border-slate-400 rounded-2xl cursor-pointer hover:bg-slate-200">
                <input type="checkbox" className="w-12 h-12 accent-blue-700" checked={currentDrankWater} onChange={e => setCurrentDrankWater(e.target.checked)} />
                <span className="text-3xl font-bold">I drank plenty of water today.</span>
              </label>
            </div>

            <div className="space-y-6">
              <label className="block text-3xl font-extrabold">Written Diary (Optional):</label>
              <textarea
                rows={5}
                value={currentNoteText}
                onChange={e => setCurrentNoteText(e.target.value)}
                className="w-full p-6 text-2xl border-4 border-slate-400 rounded-2xl text-slate-900 font-medium"
                placeholder="Type any feelings, aches, or proud moments here..."
              />
            </div>

            <button onClick={saveNotes} className="w-full bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-4xl py-8 rounded-2xl border-4 border-blue-900 shadow-lg">
              Save My Notes
            </button>
          </div>
        )}

        {/* -------------------------------------- */}
        {/* SCREEN: SETTINGS & EMERGENCY PREP      */}
        {/* -------------------------------------- */}
        {currentScreen === 'settings' && (
          <div className={`${cardClass} p-8 rounded-2xl space-y-10`}>
            <h2 className="text-4xl font-extrabold border-b-4 pb-6">App Settings</h2>
            
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-red-600">🚨 Emergency Contact Setup</h3>
              <p className="text-2xl opacity-80 mb-4">This puts a quick-call button at the top of every screen.</p>
              
              <div className="space-y-4 text-slate-900">
                <div>
                  <label className="block text-2xl font-bold mb-2 text-inherit">Contact Name (e.g. Daughter, Doctor):</label>
                  <input 
                    type="text" 
                    value={settings.emergencyContactName}
                    onChange={e => setSettings(p => ({...p, emergencyContactName: e.target.value}))}
                    className="w-full p-4 text-2xl border-4 border-slate-400 rounded-xl"
                    placeholder="Jane Doe"
                  />
                </div>
                <div>
                  <label className="block text-2xl font-bold mb-2 text-inherit">Phone Number:</label>
                  <input 
                    type="tel" 
                    value={settings.emergencyContactPhone}
                    onChange={e => setSettings(p => ({...p, emergencyContactPhone: e.target.value}))}
                    className="w-full p-4 text-2xl border-4 border-slate-400 rounded-xl"
                    placeholder="1-800-555-0199"
                  />
                </div>
              </div>
            </div>

            <div className="border-t-4 pt-10 space-y-6 text-slate-900">
              <h3 className="text-3xl font-bold text-inherit">Visual Settings</h3>
              <label className="flex items-center gap-6 p-8 bg-slate-100 border-4 border-slate-400 rounded-2xl cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-12 h-12"
                  checked={settings.highContrastMode}
                  onChange={e => setSettings(p => ({...p, highContrastMode: e.target.checked}))}
                />
                <span className="text-3xl font-bold">Enable High Contrast Mode</span>
              </label>
            </div>

            <button onClick={() => setCurrentScreen('menu')} className={`w-full ${btnClass} font-extrabold text-4xl py-8 rounded-2xl shadow-lg mt-8`}>
              Save Settings & Return
            </button>
          </div>
        )}

      </div>
    </div>
  );
}