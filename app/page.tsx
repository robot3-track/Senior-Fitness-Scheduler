'use client';

import React, { useState, useEffect } from 'react';
import { EXERCISES_DB, MUSCLE_GROUPS, getWeekDates, Exercise } from './exerciseData';

// --- INTERFACES ---
interface LogItem {
  id: string;
  date: string;
  name: string;
  minutes: number;
  category: 'aerobic' | 'strength' | 'balance';
  intensity: 'moderate' | 'vigorous'; // CDC calculates 1 min vigorous = 2 mins moderate credit
  rpeScore: number; // UN Decade of Healthy Ageing exertion tracking (Borg Scale 1-10)
}

interface DayNote {
  date: string;
  notesText: string;
  feltGood: boolean;
  drankWater: boolean;
  balanceConfidenceScore: number; // Fall risk indicator rating (1-5) for UN SDG 3.4
}

interface UserSettings {
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContact2Name: string;
  emergencyContact2Phone: string;
  emergencyWebUrl: string; // Optional Telehealth / Medical Web link
  medicalNotes: string; // Local Medical ID (allergies, blood type, conditions)
  highContrastMode: boolean;
  fontSize: 'normal' | 'large';
  audioPrompts: boolean;
  restTimerSeconds: number;
  hapticFeedback: boolean; // Gentle vibrations for timers & exercise prompts
}

type ActiveScreen = 'menu' | 'exercises' | 'timer' | 'progress' | 'notes' | 'settings' | 'sdgInfo';

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
  
  // --- USER SETTINGS WITH NO-SIGNUP LOCAL MEDICAL ID DEFAULT ---
  const [settings, setSettings] = useState<UserSettings>({
    emergencyContactName: 'Personal Caregiver / Doctor',
    emergencyContactPhone: '',
    emergencyContact2Name: 'Family Member / Alternate Contact',
    emergencyContact2Phone: '',
    emergencyWebUrl: '',
    medicalNotes: 'No known allergies. Condition: N/A Blood Type: N/A',
    highContrastMode: false,
    fontSize: 'normal',
    audioPrompts: true,
    restTimerSeconds: 60,
    hapticFeedback: true
  });

  // --- EXERCISE, TIMER & EMERGENCY MODAL STATES ---
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [timerExercise, setTimerExercise] = useState<Exercise | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [safetyCleared, setSafetyCleared] = useState({ clearSpace: false, hasWater: false, goodShoes: false });
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showMedicalCardModal, setShowMedicalCardModal] = useState(false);
  
  // --- WORKOUT INTENSITY & SAFETY FLOW STATES ---
  const [currentIntensity, setCurrentIntensity] = useState<'moderate' | 'vigorous'>('moderate');
  const [currentRpe, setCurrentRpe] = useState<number>(5);
  const [timerPhase, setTimerPhase] = useState<'warmup' | 'active' | 'cooldown'>('warmup');

  // --- NOTES STATES ---
  const [currentNoteText, setCurrentNoteText] = useState('');
  const [currentFeltGood, setCurrentFeltGood] = useState(true);
  const [currentDrankWater, setCurrentDrankWater] = useState(false);
  const [currentBalanceConfidence, setCurrentBalanceConfidence] = useState(4);

  // --- AUTO SCROLL TO TOP ON PAGE/SCREEN NAVIGATION ---
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentScreen]);

  // --- INITIALIZATION ---
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
    if (storedSettings) {
      const parsed = JSON.parse(storedSettings);
      setSettings(prev => ({ ...prev, ...parsed }));
    }
  }, []);

  // --- AUTO-SAVE ---
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
      setCurrentBalanceConfidence(match.balanceConfidenceScore ?? 4);
    } else {
      setCurrentNoteText('');
      setCurrentFeltGood(true);
      setCurrentDrankWater(false);
      setCurrentBalanceConfidence(4);
    }
  }, [selectedDate, dailyNotes]);

  // --- VOICE FEEDBACK & HAPTIC ASSISTANT ---
  const triggerHaptic = (duration: number | number[] = 200) => {
    if (
      settings.hapticFeedback &&
      typeof window !== 'undefined' &&
      'vibrate' in window.navigator
    ) {
      try {
        window.navigator.vibrate(duration as VibratePattern);
      } catch (e) {
        // Fallback for restricted environments
      }
    }
  };

  const speakText = (text: string) => {
    if (!settings.audioPrompts || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  // --- TIMER ENGINE WITH SAFE WARMUP & COOLDOWN PHASES ---
  useEffect(() => {
    let timerId: NodeJS.Timeout;
    if (timerActive && secondsRemaining > 0) {
      timerId = setInterval(() => {
        setSecondsRemaining(p => {
          if (p === 30 && settings.audioPrompts) speakText("30 seconds remaining.");
          if (p === 10 && settings.audioPrompts) speakText("10 seconds left. Almost done!");
          return p - 1;
        });
      }, 1000);
    } else if (secondsRemaining === 0 && timerActive) {
      if (timerPhase === 'warmup') {
        triggerHaptic(400);
        setTimerPhase('active');
        if (timerExercise) setSecondsRemaining(timerExercise.minutes * 60);
        speakText("Warm up complete. Starting main exercise now.");
      } else if (timerPhase === 'active') {
        triggerHaptic(400);
        setTimerPhase('cooldown');
        setSecondsRemaining(120);
        speakText("Exercise portion completed. Let us cool down safely.");
      } else if (timerPhase === 'cooldown') {
        setTimerActive(false);
        triggerHaptic([200, 100, 200]);
        if (timerExercise) {
          const uniqueId = `log_${Date.now()}`;
          const newCategory = (timerExercise.category as 'aerobic' | 'strength' | 'balance') || 'aerobic';
          setLogs(prev => [{ 
            id: uniqueId, 
            date: selectedDate, 
            name: timerExercise.name, 
            minutes: timerExercise.minutes, 
            category: newCategory,
            intensity: currentIntensity,
            rpeScore: currentRpe
          }, ...prev]);
          
          speakText("Great job! Workout complete.");
          alert(`Excellent work! Your exercise "${timerExercise.name}" has been recorded towards your CDC and UN Health goals.`);
          setCurrentScreen('menu');
        }
      }
    }
    return () => clearInterval(timerId);
  }, [timerActive, secondsRemaining, timerExercise, selectedDate, settings.audioPrompts, timerPhase, currentIntensity, currentRpe]);

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
    window.location.reload();
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
    setTimerPhase('warmup');
    setSecondsRemaining(120);
    setTimerActive(false);
    setSafetyCleared({ clearSpace: false, hasWater: false, goodShoes: false });
    setCurrentIntensity('moderate');
    setCurrentRpe(5);
    setCurrentScreen('timer');
  };

  const saveNotes = () => {
    setDailyNotes(prev => {
      const filtered = prev.filter(n => n.date !== selectedDate);
      return [...filtered, { 
        date: selectedDate, 
        notesText: currentNoteText, 
        feltGood: currentFeltGood, 
        drankWater: currentDrankWater,
        balanceConfidenceScore: currentBalanceConfidence
      }];
    });
    alert('Your daily health notes have been saved successfully.');
    setCurrentScreen('menu');
  };

  const downloadMyLogsData = () => {
    if (logs.length === 0) {
      alert("You have no exercises saved yet to download.");
      return;
    }
    let csvContent = "Date,Exercise Name,Category,Duration Minutes,Intensity Level,Perceived Exertion (RPE 1-10),CDC Compliant\n";
    logs.forEach(item => {
      csvContent += `${item.date},"${item.name.replace(/"/g, '""')}",${item.category},${item.minutes},${item.intensity || 'moderate'},${item.rpeScore || 5},Yes\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Senior_Health_CDC_UN_Report_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printDoctorSummary = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  // --- CDC PROGRESS CALCULATORS ---
  const calculateCdcAerobicCredit = () => {
    return logs.filter(l => l.category === 'aerobic').reduce((sum, current) => {
      const multiplier = current.intensity === 'vigorous' ? 2 : 1;
      return sum + (current.minutes * multiplier);
    }, 0);
  };

  const countDaysByCategory = (category: string) => {
    const dates = logs.filter(l => l.category === category).map(l => l.date);
    return new Set(dates).size;
  };

  // --- DYNAMIC FONT SCALE & STYLING CLASSES ---
  const isLarge = settings.fontSize === 'large';
  const fontSizeClass = isLarge ? 'text-2xl' : 'text-lg';
  const headingClass = isLarge ? 'text-5xl font-extrabold' : 'text-3xl font-bold';
  const subHeadingClass = isLarge ? 'text-3xl font-bold' : 'text-2xl font-semibold';
  const bodyTextClass = isLarge ? 'text-2xl' : 'text-xl';
  
  const isDark = settings.highContrastMode;
  const bgClass = isDark ? 'bg-black text-yellow-300' : 'bg-slate-50 text-slate-900';
  const cardClass = isDark ? 'bg-zinc-950 border-4 border-yellow-400 text-yellow-300' : 'bg-white border-4 border-slate-300 text-slate-900';
  const subCardClass = isDark ? 'bg-zinc-900 border-2 border-yellow-500 text-white' : 'bg-slate-100 border-2 border-slate-300 text-slate-900';
  const btnClass = isDark ? 'bg-yellow-400 text-black border-4 border-yellow-200 hover:bg-yellow-300' : 'bg-blue-700 text-white border-4 border-blue-900 hover:bg-blue-800';
  const inputClass = isDark ? 'bg-zinc-900 text-yellow-300 border-4 border-yellow-400' : 'bg-white text-slate-900 border-4 border-slate-400';

  // --- VIEW: LOGIN ---
  if (!isLoggedIn && !isGuestMode) {
    return (
      <div className={`min-h-screen ${bgClass} flex flex-col items-center justify-between p-6 font-sans`}>
        <div className="max-w-2xl w-full space-y-8 my-auto">
          <h1 className={`${headingClass} text-center border-b-8 border-current pb-6`}>
            Senior Health Station
          </h1>
          
          <div className={`${cardClass} p-10 rounded-2xl shadow-xl space-y-8`}>
            <h2 className={subHeadingClass}>1. Log In to Your Account</h2>
            <form onSubmit={handleSignIn} className="space-y-6">
              <label className={`block ${subHeadingClass}`}>Your Email Address:</label>
              <input 
                type="email" 
                required 
                placeholder="Type your email here..."
                value={authEmailInput}
                onChange={e => setAuthEmailInput(e.target.value)}
                className={`w-full px-6 py-6 ${bodyTextClass} rounded-xl ${inputClass}`}
              />
              <button type="submit" className={`w-full font-extrabold ${subHeadingClass} py-6 rounded-xl ${btnClass}`}>
                Click Here to Log In
              </button>
            </form>
          </div>

          <div className="text-center pt-4">
            <p className={`${subHeadingClass} mb-6 opacity-80`}>Or use the app without an account:</p>
            <button onClick={handleGuest} className={`w-full font-extrabold ${subHeadingClass} py-6 rounded-xl shadow-md ${subCardClass}`}>
              Continue as a Guest User
            </button>
          </div>
        </div>

        {/* FOOTER APK DOWNLOAD LINK */}
        <footer className="pt-8 pb-2 text-center opacity-75 print:hidden">
          <a 
            href="https://github.com/robot3-track/Senior-Fitness-Scheduler/actions/runs/30170630494/artifacts/89711032673" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm md:text-base underline hover:opacity-100 transition-opacity"
          >
            Install Android Application of Senior Fitness App
          </a>
        </footer>
      </div>
    );
  }

  // --- VIEW: MAIN SHELL ---
  return (
    <div className={`min-h-screen p-4 md:p-8 font-sans ${fontSizeClass} ${bgClass} flex flex-col justify-between`}>
      <div className="max-w-4xl mx-auto w-full space-y-8">
        
        {/* Header with Standardized Emergency Button across ALL screens */}
        <header className={`${cardClass} p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-6 shadow-sm print:hidden`}>
          <div>
            <h1 className={headingClass}>Health Station</h1>
            <p className={`${bodyTextClass} mt-2 font-medium opacity-90`}>
              {isGuestMode ? "Guest Profile" : `Profile: ${userEmail}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 w-full sm:w-auto justify-end">
            {/* STANDARDIZED EMERGENCY BUTTON */}
            <button 
              onClick={() => setShowEmergencyModal(true)} 
              className="bg-red-700 text-white font-extrabold px-6 py-4 rounded-xl border-4 border-red-950 hover:bg-red-800 flex items-center gap-2 shadow-lg"
            >
              🚨 Emergency Contacts
            </button>

            {currentScreen !== 'menu' && (
              <button onClick={() => setCurrentScreen('menu')} className={`font-bold px-6 py-4 rounded-xl ${bodyTextClass} ${subCardClass}`}>
                🔙 Menu
              </button>
            )}
          </div>
        </header>

        {/* REUSABLE EMERGENCY MODAL */}
        {showEmergencyModal && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className={`max-w-2xl w-full p-8 rounded-2xl border-8 border-red-600 ${isDark ? 'bg-zinc-950 text-white' : 'bg-white text-slate-900'} space-y-6 max-h-[90vh] overflow-y-auto`}>
              <div className="flex justify-between items-center border-b-4 border-red-600 pb-4">
                <h3 className={`${headingClass} text-red-600`}>🚨 Emergency Quick Actions</h3>
                <button onClick={() => setShowEmergencyModal(false)} className="text-3xl font-bold px-4 py-2 bg-slate-200 text-black rounded-lg">✕</button>
              </div>

              <p className={bodyTextClass}>
                If you feel dizzy, short of breath, or experienced a fall, stop immediately:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a 
                  href="tel:911" 
                  className={`block text-center bg-red-700 text-white font-extrabold ${subHeadingClass} py-6 rounded-2xl border-4 border-red-950 hover:bg-red-800`}
                >
                  📞 Call 911 Directly
                </a>

                <a 
                  href="sms:911" 
                  className={`block text-center bg-zinc-800 text-white font-extrabold ${subHeadingClass} py-6 rounded-2xl border-4 border-black hover:bg-zinc-900`}
                >
                  💬 Text 911 (SMS)
                </a>
              </div>

              {/* PERSONAL CONTACT 1 */}
              {settings.emergencyContactPhone ? (
                <a 
                  href={`tel:${settings.emergencyContactPhone}`} 
                  className={`block w-full text-center bg-amber-600 text-white font-extrabold ${subHeadingClass} py-6 rounded-2xl border-4 border-amber-900 hover:bg-amber-700`}
                >
                  📞 Call Personal Contact: {settings.emergencyContactName || 'Caregiver'} ({settings.emergencyContactPhone})
                </a>
              ) : (
                <div className={`p-4 rounded-xl border-4 border-amber-500 bg-amber-50 text-amber-900 text-center space-y-3`}>
                  <p className={`${bodyTextClass} font-bold`}>No Primary Personal Contact Set Up Yet</p>
                  <button 
                    onClick={() => { setShowEmergencyModal(false); setCurrentScreen('settings'); }} 
                    className="bg-amber-600 text-white font-extrabold px-6 py-3 rounded-xl hover:bg-amber-700"
                  >
                    ➕ Add Your Caregiver / Personal Number Now
                  </button>
                </div>
              )}

              {/* PERSONAL CONTACT 2 */}
              {settings.emergencyContact2Phone && (
                <a 
                  href={`tel:${settings.emergencyContact2Phone}`} 
                  className={`block w-full text-center bg-teal-700 text-white font-extrabold ${subHeadingClass} py-6 rounded-2xl border-4 border-teal-950 hover:bg-teal-800`}
                >
                  📞 Call 2nd Contact: {settings.emergencyContact2Name || 'Alternate'} ({settings.emergencyContact2Phone})
                </a>
              )}

              {/* EMERGENCY MEDICAL ID CARD BUTTON */}
              <button 
                onClick={() => { setShowEmergencyModal(false); setShowMedicalCardModal(true); }}
                className={`block w-full text-center bg-blue-700 text-white font-extrabold ${subHeadingClass} py-5 rounded-2xl border-4 border-blue-900 hover:bg-blue-800`}
              >
                🪪 View On-Screen Medical ID (No Signup Needed)
              </button>

              {settings.emergencyWebUrl && (
                <a 
                  href={settings.emergencyWebUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`block w-full text-center bg-slate-700 text-white font-bold ${bodyTextClass} py-4 rounded-2xl border-4 border-slate-900 hover:bg-slate-800`}
                >
                  🌐 External Healthcare Web Portal ↗
                </a>
              )}

              <button onClick={() => setShowEmergencyModal(false)} className={`w-full bg-slate-800 text-white font-bold ${bodyTextClass} py-4 rounded-xl`}>
                Dismiss Emergency Notice
              </button>
            </div>
          </div>
        )}

        {/* EMERGENCY MEDICAL ID CARD MODAL */}
        {showMedicalCardModal && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className={`max-w-2xl w-full p-8 rounded-2xl border-8 border-blue-600 ${isDark ? 'bg-zinc-950 text-white' : 'bg-white text-slate-900'} space-y-6 max-h-[90vh] overflow-y-auto`}>
              <div className="flex justify-between items-center border-b-4 border-blue-600 pb-4">
                <h3 className={`${headingClass} text-blue-600`}>🪪 Emergency Medical Profile</h3>
                <button onClick={() => setShowMedicalCardModal(false)} className="text-3xl font-bold px-4 py-2 bg-slate-200 text-black rounded-lg">✕</button>
              </div>

              <div className={`${subCardClass} p-6 rounded-xl space-y-4`}>
                <p className={bodyTextClass}><strong>User Profile:</strong> {isGuestMode ? 'Guest User' : userEmail}</p>
                <p className={bodyTextClass}><strong>Primary Contact:</strong> {settings.emergencyContactName || 'None listed'} {settings.emergencyContactPhone ? `(${settings.emergencyContactPhone})` : ''}</p>
                {settings.emergencyContact2Phone && (
                  <p className={bodyTextClass}><strong>Secondary Contact:</strong> {settings.emergencyContact2Name || 'None listed'} ({settings.emergencyContact2Phone})</p>
                )}
                <div className="border-t-2 border-current pt-4">
                  <p className={`${subHeadingClass} mb-2`}>Medical Notes & Conditions:</p>
                  <p className={bodyTextClass}>{settings.medicalNotes || 'No local medical notes saved.'}</p>
                </div>
              </div>

              <p className="text-sm opacity-80 text-center">
                ℹ️ This information is stored privately on your device. Show this screen to first responders if necessary. No external accounts or online registrations are required.
              </p>

              <div className="flex gap-4">
                <button onClick={() => { setShowMedicalCardModal(false); setCurrentScreen('settings'); }} className={`flex-1 bg-amber-600 text-white font-bold ${bodyTextClass} py-4 rounded-xl`}>
                  ✏️ Edit Profile & Contacts
                </button>
                <button onClick={() => setShowMedicalCardModal(false)} className={`flex-1 bg-slate-800 text-white font-bold ${bodyTextClass} py-4 rounded-xl`}>
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SCREEN: MENU */}
        {currentScreen === 'menu' && (
          <div className="space-y-8">
            <div className={`${cardClass} p-8 rounded-2xl`}>
              <h2 className={`${subHeadingClass} mb-6`}>Step 1: Choose a Date</h2>
              <div className="flex overflow-x-auto gap-4 pb-4">
                {calendarDays.map(day => (
                  <button
                    key={day.dateString}
                    onClick={() => setSelectedDate(day.dateString)}
                    className={`min-w-[140px] p-6 border-4 rounded-2xl flex flex-col items-center justify-center transition-all ${
                      selectedDate === day.dateString 
                        ? (isDark ? 'bg-yellow-400 text-black border-yellow-100 font-bold' : 'bg-blue-700 text-white border-blue-900 scale-105') 
                        : subCardClass
                    }`}
                  >
                    <span className={`${bodyTextClass} font-bold`}>{day.dayName}</span>
                    <span className={`${subHeadingClass} mt-2`}>{day.dayOfMonth}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* UN & CDC Quick Banner */}
            <button onClick={() => setCurrentScreen('sdgInfo')} className={`w-full p-6 rounded-2xl border-4 text-left flex justify-between items-center ${isDark ? 'border-yellow-400 bg-zinc-900' : 'border-blue-600 bg-blue-50'}`}>
              <div>
                <span className="text-sm uppercase tracking-wider font-extrabold text-blue-600 dark:text-yellow-400">CDC & UN SDG 3 Alignment</span>
                <h3 className={`${subHeadingClass} mt-1`}>Healthy Aging & Fall Prevention Standards</h3>
              </div>
              <span className={subHeadingClass}> UN SDG Goals / CDC Guidelines ➔</span>
            </button>

            <h2 className={`${subHeadingClass} pt-2`}>Step 2: What would you like to do?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button onClick={() => setCurrentScreen('exercises')} className={`p-10 rounded-2xl text-left border-4 ${isDark ? 'border-yellow-400 bg-zinc-900' : 'bg-blue-50 border-blue-600 hover:bg-blue-100'}`}>
                <h3 className={`${subHeadingClass} mb-2`}>🏋️ Exercises</h3>
                <p className={`${bodyTextClass} opacity-90`}>CDC-guided routines & active timers.</p>
              </button>
              
              <button onClick={() => setCurrentScreen('progress')} className={`p-10 rounded-2xl text-left border-4 ${isDark ? 'border-yellow-400 bg-zinc-900' : 'bg-green-50 border-green-600 hover:bg-green-100'}`}>
                <h3 className={`${subHeadingClass} mb-2`}>📊 My Progress</h3>
                <p className={`${bodyTextClass} opacity-90`}>Track CDC targets & UN SDG 3 status.</p>
              </button>

              <button onClick={() => setCurrentScreen('notes')} className={`p-10 rounded-2xl text-left border-4 ${isDark ? 'border-yellow-400 bg-zinc-900' : 'bg-yellow-50 border-yellow-600 hover:bg-yellow-100'}`}>
                <h3 className={`${subHeadingClass} mb-2`}>📝 Daily Notes</h3>
                <p className={`${bodyTextClass} opacity-90`}>Track hydration & wellness state.</p>
              </button>

              <button onClick={() => setCurrentScreen('settings')} className={`p-10 rounded-2xl text-left border-4 ${subCardClass}`}>
                <h3 className={`${subHeadingClass} mb-2`}>⚙️ Settings</h3>
                <p className={`${bodyTextClass} opacity-90`}>Text size, voice prompts & emergency contacts.</p>
              </button>
            </div>

            <div className="pt-6">
              <button onClick={handleLogOut} className={`w-full bg-red-700 text-white border-4 border-red-900 p-8 rounded-2xl ${subHeadingClass} hover:bg-red-800`}>
                🚪 Securely Log Out & Exit
              </button>
            </div>
          </div>
        )}

        {/* SCREEN: EXERCISES */}
        {currentScreen === 'exercises' && (
          <div className={`${cardClass} p-8 rounded-2xl space-y-10`}>
            <div>
              <h2 className={`${headingClass} mb-6`}>Select Muscle Groups</h2>
              <p className={`${bodyTextClass} mb-6 opacity-80`}>Click target areas for today's session:</p>
              <div className="flex flex-wrap gap-4">
                {MUSCLE_GROUPS.map(mName => {
                  const chosen = selectedMuscles.includes(mName);
                  return (
                    <button
                      key={mName}
                      onClick={() => setSelectedMuscles(prev => prev.includes(mName) ? prev.filter(m => m !== mName) : [...prev, mName])}
                      className={`px-8 py-6 ${subHeadingClass} border-4 rounded-2xl ${chosen ? btnClass : subCardClass}`}
                    >
                      {chosen ? `✅ ${mName}` : mName}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t-4 border-current pt-10 space-y-8">
              <h2 className={`${headingClass} mb-4`}>Recommended Exercises:</h2>
              {EXERCISES_DB.filter(ex => selectedMuscles.length === 0 || ex.targetMuscles.some(m => selectedMuscles.includes(m))).map(ex => (
                <div key={ex.id} className={`${subCardClass} p-8 rounded-2xl`}>
                  <div className="flex justify-between items-start">
                    <h3 className={`${subHeadingClass} mb-4`}>{ex.name}</h3>
                    <span className="text-xl font-bold px-4 py-2 border-2 border-current rounded-lg uppercase">
                      {ex.category || 'General'}
                    </span>
                  </div>
                  <p className={`${bodyTextClass} mb-6 font-medium`}>{ex.description}</p>
                  <p className={`${bodyTextClass} font-bold mb-8 opacity-90`}>
                    Target Time: {ex.minutes} Minutes
                  </p>
                  <button onClick={() => startExerciseFlow(ex)} className={`w-full ${btnClass} ${subHeadingClass} py-8 rounded-2xl`}>
                    Select This Exercise
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SCREEN: TIMER WITH IN-SESSION FLOATING SAFETY BUTTON */}
        {currentScreen === 'timer' && timerExercise && (
          <div className={`${cardClass} p-8 rounded-2xl space-y-10 relative`}>
            {/* FLOATING EMERGENCY ASSISTANCE BUTTON */}
            <div className="sticky top-4 z-40 flex justify-end">
              <button 
                onClick={() => setShowEmergencyModal(true)} 
                className={`bg-red-600 text-white font-extrabold px-8 py-4 rounded-full ${bodyTextClass} border-4 border-red-950 shadow-2xl hover:bg-red-700 transition-transform active:scale-95 animate-pulse`}
              >
                🚨 Emergency Assistance
              </button>
            </div>

            <h2 className={`${headingClass} text-center`}>{timerExercise.name}</h2>

            {/* PHASE INDICATOR */}
            <div className="flex justify-center gap-4 text-center">
              <span className={`px-6 py-3 rounded-xl border-4 font-extrabold ${bodyTextClass} ${timerPhase === 'warmup' ? 'bg-yellow-400 text-black border-yellow-600' : 'opacity-40 border-current'}`}>
                1. Dynamic Warm-Up (2 min)
              </span>
              <span className={`px-6 py-3 rounded-xl border-4 font-extrabold ${bodyTextClass} ${timerPhase === 'active' ? 'bg-blue-600 text-white border-blue-900' : 'opacity-40 border-current'}`}>
                2. Main Routine
              </span>
              <span className={`px-6 py-3 rounded-xl border-4 font-extrabold ${bodyTextClass} ${timerPhase === 'cooldown' ? 'bg-green-600 text-white border-green-900' : 'opacity-40 border-current'}`}>
                3. Cool Down (2 min)
              </span>
            </div>
            
            <div className={`p-8 rounded-2xl space-y-6 border-8 ${isDark ? 'border-yellow-400 bg-zinc-900' : 'border-yellow-500 bg-yellow-50'}`}>
              <h3 className={headingClass}>⚠️ Mandatory Safety Check</h3>
              <p className={`${bodyTextClass} font-bold`}>Confirm all safety items to unlock the timer:</p>
              
              <div className="space-y-4 pt-4">
                <label className={`flex items-center gap-6 p-6 rounded-xl border-4 cursor-pointer ${subCardClass}`}>
                  <input type="checkbox" className="w-12 h-12 accent-yellow-500" checked={safetyCleared.clearSpace} onChange={e => setSafetyCleared(p => ({...p, clearSpace: e.target.checked}))} />
                  <span className={`${bodyTextClass} font-bold`}>Floor is clear of tripping hazards.</span>
                </label>
                <label className={`flex items-center gap-6 p-6 rounded-xl border-4 cursor-pointer ${subCardClass}`}>
                  <input type="checkbox" className="w-12 h-12 accent-yellow-500" checked={safetyCleared.hasWater} onChange={e => setSafetyCleared(p => ({...p, hasWater: e.target.checked}))} />
                  <span className={`${bodyTextClass} font-bold`}>A glass of water is within reach.</span>
                </label>
                <label className={`flex items-center gap-6 p-6 rounded-xl border-4 cursor-pointer ${subCardClass}`}>
                  <input type="checkbox" className="w-12 h-12 accent-yellow-500" checked={safetyCleared.goodShoes} onChange={e => setSafetyCleared(p => ({...p, goodShoes: e.target.checked}))} />
                  <span className={`${bodyTextClass} font-bold`}>Wearing supportive, non-slip footwear.</span>
                </label>
              </div>
            </div>

            {/* CDC INTENSITY & UN RPE EXERTION CONFIGURATION */}
            <div className={`p-8 rounded-2xl border-4 space-y-6 ${subCardClass}`}>
              <h3 className={subHeadingClass}>CDC Intensity & Effort Level</h3>
              
              <div>
                <label className={`block ${bodyTextClass} font-bold mb-3`}>CDC Intensity Selection:</label>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setCurrentIntensity('moderate')} 
                    className={`flex-1 py-4 ${bodyTextClass} font-bold rounded-xl border-4 ${currentIntensity === 'moderate' ? btnClass : 'bg-transparent border-current'}`}
                  >
                    🚶 Moderate (1x CDC Credit)
                  </button>
                  <button 
                    onClick={() => setCurrentIntensity('vigorous')} 
                    className={`flex-1 py-4 ${bodyTextClass} font-bold rounded-xl border-4 ${currentIntensity === 'vigorous' ? btnClass : 'bg-transparent border-current'}`}
                  >
                    🏃 Vigorous (2x CDC Credit)
                  </button>
                </div>
              </div>

              <div>
                <label className={`block ${bodyTextClass} font-bold mb-2`}>UN Effort Level (RPE Scale 1 to 10): {currentRpe}</label>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={currentRpe} 
                  onChange={e => setCurrentRpe(Number(e.target.value))}
                  className="w-full h-8 bg-slate-300 rounded-lg cursor-pointer"
                />
                <p className={`${bodyTextClass} opacity-80 mt-1`}>1 = Very Easy, 5 = Moderate Effort, 10 = Maximum Exertion</p>
              </div>
            </div>

            <div className={`text-center p-10 rounded-2xl border-4 ${subCardClass}`}>
              <div className="text-8xl font-black mb-10 tracking-wider">
                {Math.floor(secondsRemaining / 60).toString().padStart(2, '0')}:{(secondsRemaining % 60).toString().padStart(2, '0')}
              </div>
              <button 
                onClick={() => {
                  if (!safetyCleared.clearSpace || !safetyCleared.hasWater || !safetyCleared.goodShoes) {
                    alert("Please verify all three safety precautions first.");
                    return;
                  }
                  if (!timerActive && settings.audioPrompts) speakText(`Starting ${timerPhase} for ${timerExercise.name}`);
                  setTimerActive(!timerActive);
                }}
                className={`w-full py-8 ${headingClass} rounded-2xl border-8 ${
                  timerActive 
                    ? 'bg-amber-500 text-black border-amber-700' 
                    : 'bg-green-600 text-white border-green-800'
                }`}
              >
                {timerActive ? '⏸ Pause Timer' : `▶️ Start ${timerPhase.toUpperCase()} Timer`}
              </button>
            </div>

            <div className={`p-8 rounded-2xl border-4 ${subCardClass}`}>
              <h3 className={`${subHeadingClass} mb-6`}>Instructions:</h3>
              <ul className="space-y-6">
                {timerExercise.instructions.map((step, idx) => (
                  <li key={idx} className="flex gap-6 items-start">
                    <span className={`bg-current text-zinc-900 dark:text-black font-black rounded-full w-12 h-12 flex items-center justify-center shrink-0 ${bodyTextClass}`}>{idx + 1}</span>
                    <span className={`${bodyTextClass} font-medium pt-1`}>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* SCREEN: PROGRESS */}
        {currentScreen === 'progress' && (
          <div className={`${cardClass} p-8 rounded-2xl space-y-12 print:border-none print:shadow-none`}>
            <div>
              <h2 className={`${headingClass} mb-4`}>CDC & UN Goal Dashboard</h2>
              <p className={`${bodyTextClass} opacity-80 mb-8`}>Aligned with CDC guidelines for Adults 65+ and UN SDG Target 3.4 for Healthy Aging.</p>
              
              <div className="space-y-8">
                <div className={`${subCardClass} p-8 rounded-2xl`}>
                  <h3 className={`${subHeadingClass} mb-2`}>1. Aerobic Activity (CDC Target)</h3>
                  <p className={`${bodyTextClass} mb-4`}>Goal: At least 150 Moderate Minutes / week (Vigorous minutes count double)</p>
                  <p className={`${bodyTextClass} mb-4 font-bold`}>Weighted CDC Credit Logged: {calculateCdcAerobicCredit()} / 150 minutes</p>
                  <div className="w-full bg-zinc-300 dark:bg-zinc-700 h-10 rounded-full border-4 border-current overflow-hidden">
                    <div className="bg-blue-600 h-full transition-all" style={{ width: `${Math.min((calculateCdcAerobicCredit() / 150) * 100, 100)}%` }}></div>
                  </div>
                </div>

                <div className={`${subCardClass} p-8 rounded-2xl`}>
                  <h3 className={`${subHeadingClass} mb-2`}>2. Muscle Strengthening (CDC Target)</h3>
                  <p className={`${bodyTextClass} mb-2`}>Goal: At least 2 days / week</p>
                  <p className={`${bodyTextClass} font-bold`}>Logged: {countDaysByCategory('strength')} unique days active</p>
                </div>

                <div className={`${subCardClass} p-8 rounded-2xl`}>
                  <h3 className={`${subHeadingClass} mb-2`}>3. Balance Training (CDC & UN SDG 3)</h3>
                  <p className={`${bodyTextClass} mb-2`}>Goal: 3 days / week to reduce fall risks</p>
                  <p className={`${bodyTextClass} font-bold`}>Logged: {countDaysByCategory('balance')} unique days completed</p>
                </div>
              </div>
            </div>

            <div className="border-t-4 border-current pt-10">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 print:hidden">
                <h2 className={headingClass}>Logs for {selectedDate}</h2>
                <div className="flex gap-4 w-full sm:w-auto">
                  <button onClick={printDoctorSummary} className={`font-bold ${bodyTextClass} px-6 py-4 rounded-xl border-4 ${subCardClass} flex-1 sm:flex-none`}>
                    🖨️ Print Doctor Report
                  </button>
                  <button onClick={downloadMyLogsData} className={`font-bold ${bodyTextClass} px-8 py-4 rounded-xl border-4 ${btnClass} flex-1 sm:flex-none`}>
                    📥 Download CSV
                  </button>
                </div>
              </div>

              {logs.filter(l => l.date === selectedDate).length === 0 ? (
                <p className={`${subCardClass} p-10 border-dashed rounded-2xl text-center font-bold ${bodyTextClass}`}>
                  No activities logged for this date.
                </p>
              ) : (
                <div className="space-y-4">
                  {logs.filter(l => l.date === selectedDate).map(log => (
                    <div key={log.id} className={`${subCardClass} p-8 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-6`}>
                      <div className="text-center sm:text-left">
                        <h4 className={`${subHeadingClass} mb-2`}>{log.name}</h4>
                        <p className={`${bodyTextClass} opacity-90`}>
                          Duration: {log.minutes} Minutes ({log.category})
                        </p>
                        <p className={`${bodyTextClass} font-bold mt-1 text-blue-600 dark:text-yellow-400`}>
                          Intensity: {log.intensity || 'moderate'} | Effort (RPE): {log.rpeScore || 5}/10
                        </p>
                      </div>
                      <button onClick={() => setLogs(prev => prev.filter(item => item.id !== log.id))} className={`bg-red-700 text-white border-4 border-red-900 font-extrabold ${bodyTextClass} px-8 py-4 rounded-xl w-full sm:w-auto print:hidden`}>
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SCREEN: NOTES */}
        {currentScreen === 'notes' && (
          <div className={`${cardClass} p-8 rounded-2xl space-y-10`}>
            <h2 className={headingClass}>Daily Health Notes: {selectedDate}</h2>
            
            <div className="space-y-6">
              <label className={`flex items-center gap-6 p-8 rounded-2xl border-4 cursor-pointer ${subCardClass}`}>
                <input type="checkbox" className="w-12 h-12 accent-blue-600" checked={currentFeltGood} onChange={e => setCurrentFeltGood(e.target.checked)} />
                <span className={`${subHeadingClass}`}>I felt energetic and active today.</span>
              </label>
              
              <label className={`flex items-center gap-6 p-8 rounded-2xl border-4 cursor-pointer ${subCardClass}`}>
                <input type="checkbox" className="w-12 h-12 accent-blue-600" checked={currentDrankWater} onChange={e => setCurrentDrankWater(e.target.checked)} />
                <span className={`${subHeadingClass}`}>I maintained adequate hydration.</span>
              </label>
            </div>

            <div className={`p-8 rounded-2xl border-4 space-y-4 ${subCardClass}`}>
              <h3 className={subHeadingClass}>UN SDG 3 Fall Risk & Balance Assessment</h3>
              <label className={`block ${bodyTextClass} font-bold`}>How confident did you feel in your balance today? ({currentBalanceConfidence} / 5)</label>
              <input 
                type="range" 
                min="1" 
                max="5" 
                value={currentBalanceConfidence} 
                onChange={e => setCurrentBalanceConfidence(Number(e.target.value))}
                className="w-full h-8 bg-slate-300 rounded-lg cursor-pointer"
              />
              <div className={`flex justify-between ${bodyTextClass} font-bold opacity-80`}>
                <span>1 = Unsteady / High Risk</span>
                <span>5 = Very Confident / Steady</span>
              </div>
            </div>

            <div className="space-y-6">
              <label className={`block ${subHeadingClass}`}>Journal / Observations:</label>
              <textarea
                rows={5}
                value={currentNoteText}
                onChange={e => setCurrentNoteText(e.target.value)}
                className={`w-full p-6 ${bodyTextClass} rounded-2xl ${inputClass}`}
                placeholder="Log physical sensations, joint comfort, or personal wins..."
              />
            </div>

            <button onClick={saveNotes} className={`w-full ${btnClass} font-extrabold ${subHeadingClass} py-8 rounded-2xl shadow-lg`}>
              Save Daily Notes
            </button>
          </div>
        )}

        {/* SCREEN: UN SDG INFO */}
        {currentScreen === 'sdgInfo' && (
          <div className={`${cardClass} p-8 rounded-2xl space-y-8`}>
            <h2 className={headingClass}>United Nations SDG 3 & CDC Standards</h2>
            <div className={`${subCardClass} p-6 rounded-xl space-y-4`}>
              <h3 className={subHeadingClass}>🇺🇳 UN Sustainable Development Goal 3</h3>
              <p className={bodyTextClass}>
                <strong>Target 3.4:</strong> By 2030, reduce non-communicable diseases and promote mental health and well-being. Physical mobility maintenance in older adults directly advances SDG 3 global health indicators.
              </p>
            </div>
            <div className={`${subCardClass} p-6 rounded-xl space-y-4`}>
              <h3 className={subHeadingClass}>🏥 CDC Physical Activity Guidelines</h3>
              <ul className={`list-disc pl-8 ${bodyTextClass} space-y-2`}>
                <li>150+ minutes per week of moderate-intensity aerobic activity (or 75 minutes of vigorous exercise).</li>
                <li>At least 2 days per week of strength building for major muscle groups.</li>
                <li>At least 3 days per week of multi-component balance exercises.</li>
              </ul>
            </div>
          </div>
        )}

        {/* SCREEN: SETTINGS */}
        {currentScreen === 'settings' && (
          <div className={`${cardClass} p-8 rounded-2xl space-y-10`}>
            <h2 className={`${headingClass} border-b-4 border-current pb-6`}>Emergency & App Settings</h2>
            
            {/* Automatic Emergency Contacts */}
            <div className="space-y-6">
              <h3 className={`${subHeadingClass} text-red-600 dark:text-red-400`}>🚨 Emergency Contact Setup</h3>
              
              <div className="p-6 rounded-2xl border-4 border-red-500 bg-red-50 text-red-950 font-bold space-y-2">
                <p className={bodyTextClass}>✅ Default System Emergency Contact: <strong>911 (US/National Dispatch)</strong></p>
                <p className={`${bodyTextClass} opacity-90`}>Tapping "Call 911" or "Text 911" automatically opens the native Phone or SMS application on mobile devices.</p>
              </div>

              <div className="space-y-6">
                <div className="p-6 rounded-xl border-4 border-amber-500 space-y-4">
                  <h4 className={`${subHeadingClass}`}>Primary Personal Contact</h4>
                  <div>
                    <label className={`block ${bodyTextClass} font-bold mb-2`}>Caregiver / Doctor Name:</label>
                    <input 
                      type="text" 
                      value={settings.emergencyContactName}
                      onChange={e => setSettings(p => ({...p, emergencyContactName: e.target.value}))}
                      className={`w-full p-4 ${bodyTextClass} rounded-xl ${inputClass}`}
                      placeholder="e.g. Dr. Smith / Daughter Jane"
                    />
                  </div>
                  <div>
                    <label className={`block ${bodyTextClass} font-bold mb-2`}>Phone Number:</label>
                    <input 
                      type="tel" 
                      value={settings.emergencyContactPhone}
                      onChange={e => setSettings(p => ({...p, emergencyContactPhone: e.target.value}))}
                      className={`w-full p-4 ${bodyTextClass} rounded-xl ${inputClass}`}
                      placeholder="1-800-555-0199"
                    />
                  </div>
                </div>

                <div className="p-6 rounded-xl border-4 border-teal-500 space-y-4">
                  <h4 className={`${subHeadingClass}`}>Secondary Personal Contact (Optional)</h4>
                  <div>
                    <label className={`block ${bodyTextClass} font-bold mb-2`}>Family Member / Alternate Contact Name:</label>
                    <input 
                      type="text" 
                      value={settings.emergencyContact2Name}
                      onChange={e => setSettings(p => ({...p, emergencyContact2Name: e.target.value}))}
                      className={`w-full p-4 ${bodyTextClass} rounded-xl ${inputClass}`}
                      placeholder="e.g. Son Mark"
                    />
                  </div>
                  <div>
                    <label className={`block ${bodyTextClass} font-bold mb-2`}>Phone Number:</label>
                    <input 
                      type="tel" 
                      value={settings.emergencyContact2Phone}
                      onChange={e => setSettings(p => ({...p, emergencyContact2Phone: e.target.value}))}
                      className={`w-full p-4 ${bodyTextClass} rounded-xl ${inputClass}`}
                      placeholder="1-800-555-0200"
                    />
                  </div>
                </div>

                <div>
                  <label className={`block ${bodyTextClass} font-bold mb-2`}>Local Emergency Medical ID / Notes (No Signup):</label>
                  <textarea 
                    rows={3}
                    value={settings.medicalNotes}
                    onChange={e => setSettings(p => ({...p, medicalNotes: e.target.value}))}
                    className={`w-full p-4 ${bodyTextClass} rounded-xl ${inputClass}`}
                    placeholder="List blood type, allergies, or emergency medical history..."
                  />
                  <p className="text-lg opacity-80 mt-1">Stored locally on your device. Can be presented immediately to first responders without signing up for external websites.</p>
                </div>
                <div>
                  <label className={`block ${bodyTextClass} font-bold mb-2`}>Optional Telehealth / Medical Website URL:</label>
                  <input 
                    type="url" 
                    value={settings.emergencyWebUrl}
                    onChange={e => setSettings(p => ({...p, emergencyWebUrl: e.target.value}))}
                    className={`w-full p-4 ${bodyTextClass} rounded-xl ${inputClass}`}
                    placeholder="https://myportal.health.org"
                  />
                </div>
              </div>
            </div>

            {/* Visual & Accessibility */}
            <div className="border-t-4 border-current pt-10 space-y-6">
              <h3 className={subHeadingClass}>Display & Accessibility Settings</h3>
              
              <div className={`p-8 rounded-2xl border-4 space-y-4 ${subCardClass}`}>
                <label className={`block ${subHeadingClass}`}>Font Scale (App-wide Text Control):</label>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setSettings(p => ({...p, fontSize: 'normal'}))}
                    className={`flex-1 py-4 ${bodyTextClass} font-bold rounded-xl border-4 ${settings.fontSize === 'normal' ? btnClass : subCardClass}`}
                  >
                    Standard Size
                  </button>
                  <button 
                    onClick={() => setSettings(p => ({...p, fontSize: 'large'}))}
                    className={`flex-1 py-4 ${bodyTextClass} font-bold rounded-xl border-4 ${settings.fontSize === 'large' ? btnClass : subCardClass}`}
                  >
                    Large Print
                  </button>
                </div>
              </div>

              <label className={`flex items-center gap-6 p-8 rounded-2xl border-4 cursor-pointer ${subCardClass}`}>
                <input 
                  type="checkbox" 
                  className="w-12 h-12 accent-yellow-400"
                  checked={settings.highContrastMode}
                  onChange={e => setSettings(p => ({...p, highContrastMode: e.target.checked}))}
                />
                <span className={subHeadingClass}>Enable High-Contrast Dark Mode</span>
              </label>

              <label className={`flex items-center gap-6 p-8 rounded-2xl border-4 cursor-pointer ${subCardClass}`}>
                <input 
                  type="checkbox" 
                  className="w-12 h-12 accent-yellow-400"
                  checked={settings.audioPrompts}
                  onChange={e => setSettings(p => ({...p, audioPrompts: e.target.checked}))}
                />
                <span className={subHeadingClass}>Voice Assistance & Audio Cues</span>
              </label>

              <label className={`flex items-center gap-6 p-8 rounded-2xl border-4 cursor-pointer ${subCardClass}`}>
                <input 
                  type="checkbox" 
                  className="w-12 h-12 accent-yellow-400"
                  checked={settings.hapticFeedback}
                  onChange={e => setSettings(p => ({...p, hapticFeedback: e.target.checked}))}
                />
                <span className={subHeadingClass}>Haptic Device Vibrations</span>
              </label>
            </div>

            <button onClick={() => setCurrentScreen('menu')} className={`w-full ${btnClass} font-extrabold ${headingClass} py-8 rounded-2xl shadow-lg mt-8`}>
              Save Settings & Return
            </button>
          </div>
        )}

      </div>

      {/* FOOTER APK DOWNLOAD LINK (MAIN APPLICATION SHELL) */}
      <footer className="pt-8 pb-2 text-center opacity-75 print:hidden">
        <a 
          href="https://github.com/robot3-track/Senior-Fitness-Scheduler/actions/runs/30170630494/artifacts/89711032673" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm md:text-base underline hover:opacity-100 transition-opacity"
        >
          Install Android Application of Senior Fitness App
        </a>
      </footer>
    </div>
  );
}