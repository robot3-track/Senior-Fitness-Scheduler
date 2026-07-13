'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar as CalendarIcon,
  Timer as TimerIcon,
  Heart,
  Play,
  Pause,
  RotateCcw,
  Plus,
  CheckCircle2,
  BookOpen,
  Volume2,
  VolumeX,
  Accessibility,
  Award,
  Trash2,
  Info,
  ChevronRight,
  LogOut,
  UserCheck,
  Zap,
  Activity
} from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  category: 'aerobic' | 'strength' | 'balance' | 'stretch';
  minutes: number;
  description: string;
  instructions: string[];
  safetyTip: string;
}

interface ScheduledActivity {
  id: string;
  exerciseId: string;
  name: string;
  minutes: number;
  category: 'aerobic' | 'strength' | 'balance' | 'stretch';
  completed: boolean;
  intensity?: 'Light' | 'Moderate' | 'Vigorous';
}

interface CompletedLog {
  id: string;
  dateString: string;
  name: string;
  minutes: number;
  category: 'aerobic' | 'strength' | 'balance' | 'stretch';
  timestamp: string;
  intensity: 'Light' | 'Moderate' | 'Vigorous';
}

interface CompletedLog {
  id: string;
  dateString: string;
  name: string;
  minutes: number;
  category: 'aerobic' | 'strength' | 'balance' | 'stretch';
  timestamp: string;
}

const EXERCISES_DB: Exercise[] = [
  {
    id: 'brisk-walk',
    name: 'Brisk Walking',
    category: 'aerobic',
    minutes: 30,
    description: 'A gentle but active walk. Move at a pace where you can comfortably talk, but not sing.',
    instructions: [
      'Put on comfortable, supportive walking shoes.',
      'Hold your head up high, look forward, and relax your shoulders and neck.',
      'Swing your arms freely with a slight bend in your elbows.',
      'Walk smoothly, letting your foot roll gently from heel to toe.',
      'Keep a steady, moderate pace for the entire duration.'
    ],
    safetyTip: 'Walk on level, well-lit pathways. Bring water along, and slow down if you feel out of breath.'
  },
  {
    id: 'chair-stand',
    name: 'Sit-to-Stand (Chair Stands)',
    category: 'strength',
    minutes: 10,
    description: 'Strengthens your legs, thighs, and hips, making it easier to stand up from chairs, sofas, or cars.',
    instructions: [
      'Find a sturdy, armless chair. Place its back securely against a flat wall.',
      'Sit toward the front of the seat, with your feet flat on the floor, hip-width apart.',
      'Fold your arms across your chest, or hold them straight out parallel to the floor.',
      'Lean forward slightly from your hips, and stand up slowly using only your leg strength.',
      'Pause for one second at the top, then slowly lower yourself back onto the seat.'
    ],
    safetyTip: 'Never use a chair with wheels. Keep your knees aligned over your ankles as you rise.'
  },
  {
    id: 'wall-pushup',
    name: 'Wall Push-Ups',
    category: 'strength',
    minutes: 10,
    description: 'Builds vital upper-body strength in your chest, shoulders, and arms without straining your lower back.',
    instructions: [
      'Stand upright about arm\'s length facing a solid, flat wall.',
      'Place your palms flat against the wall at shoulder height and shoulder-width apart.',
      'Keep your body straight. Slowly bend your elbows and lean your face in toward the wall.',
      'Hold the leaning position for one second, then slowly push yourself back to the starting point.'
    ],
    safetyTip: 'Make sure your shoes have good traction and the floor is dry and clean.'
  },
  {
    id: 'single-leg',
    name: 'Single-Leg Stand',
    category: 'balance',
    minutes: 5,
    description: 'Excellent for boosting balance and foot-ankle stability, reducing the risk of slips or falls.',
    instructions: [
      'Stand beside a sturdy chair, heavy counter, or wall. Place one hand on it for support.',
      'Slowly lift one foot slightly off the floor, balancing entirely on your other leg.',
      'Try to hold this balanced posture for 15 to 30 seconds.',
      'Slowly lower your foot, then repeat the balance on your opposite leg.',
      'As you improve, try holding with just a single finger, or letting go completely for short moments.'
    ],
    safetyTip: 'Always keep your hands within an inch of your support source in case you wobble.'
  },
  {
    id: 'heel-to-toe',
    name: 'Heel-to-Toe Walking',
    category: 'balance',
    minutes: 10,
    description: 'Aligns posture, improves hip coordination, and coordinates stable walking habits.',
    instructions: [
      'Stand upright beside a long, clear wall or hallway for touch-support.',
      'Place the heel of your right foot directly in front of the toes of your left foot.',
      'Your front heel and rear toes should be touching or placed as close together as possible.',
      'Focusing forward, step your left foot ahead, placing its heel directly in front of your right toes.',
      'Take 10 to 15 slow steps in this straight line.'
    ],
    safetyTip: 'Perform this next to a clear wall so you can slide your fingers along it for security.'
  },
  {
    id: 'arm-curl',
    name: 'Sitting Arm Curls',
    category: 'strength',
    minutes: 10,
    description: 'Strengthens your biceps and forearms, making lifting groceries, laundry, or objects much easier.',
    instructions: [
      'Sit tall in a sturdy, stable chair with your feet flat on the ground and back straight.',
      'Hold a very light weight, a small water bottle, or a canned soup in each hand, palms facing forward.',
      'Keep your elbows tucked close to your sides.',
      'Slowly bend your elbows, lifting your hands toward your chest and shoulders.',
      'Hold for one second, then slowly and smoothly lower your hands back down.'
    ],
    safetyTip: 'Move slowly and smoothly. Do not swing your upper body or back to lift the items.'
  },
  {
    id: 'tai-chi',
    name: 'Tai Chi Gentle Flow',
    category: 'balance',
    minutes: 10,
    description: 'Slow, fluid motions designed to improve joint flexibility, leg support, and mental relaxation.',
    instructions: [
      'Stand with your feet shoulder-width apart, knees soft and slightly bent, body fully relaxed.',
      'Slowly shift your body weight onto your right leg, gently freeing up your left foot.',
      'Slowly step your left foot slightly forward and tap the heel, raising your arms like holding a soft balloon.',
      'Take deep, smooth breaths through your nose, exhaling gently as your arms float down.',
      'Flow smoothly from one movement into another, avoiding any quick, sudden, or rigid stops.'
    ],
    safetyTip: 'Keep a sturdy table or chair nearby if your balance is still developing.'
  },
  {
    id: 'stretch-stretch',
    name: 'Neck & Shoulder Relief',
    category: 'stretch',
    minutes: 5,
    description: 'Eases muscular tightness in your neck, neck joints, and shoulders, improving head-turning flexibility.',
    instructions: [
      'Sit comfortably straight in your chair with your feet resting flat on the floor.',
      'Slowly turn your head to the right until you feel a gentle, comfortable stretch in your neck.',
      'Hold for 10 to 15 seconds. Slowly bring your gaze back to center, then repeat to the left.',
      'Raise both shoulders up toward your ears, then roll them backward and down in soft circles.',
      'Repeat the shoulder rolls forward 10 times and backward 10 times.'
    ],
    safetyTip: 'Never roll your neck in full complete circles. Only stretch to a comfortable tightness—never pain!'
  }
];

function getWeekDates() {
  const today = new Date();
  const currentDay = today.getDay();
  const diffToMonday = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
  const monday = new Date(today);
  monday.setDate(diffToMonday);
  
  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const dates = [];
  const todayStr = today.toISOString().split('T')[0];
  
  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(monday);
    dayDate.setDate(monday.getDate() + i);
    const dateStr = dayDate.toISOString().split('T')[0];
    
    dates.push({
      dateString: dateStr,
      dayName: dayNames[i],
      dayOfMonth: dayDate.getDate(),
      monthLabel: dayDate.toLocaleDateString('en-US', { month: 'short' }),
      isToday: todayStr === dateStr
    });
  }
  return dates;
}

const DEFAULT_SCHEDULE_BY_DAY_NAME: { [key: string]: string[] } = {
  "Monday": ["brisk-walk", "single-leg"],
  "Tuesday": ["chair-stand", "arm-curl"],
  "Wednesday": ["brisk-walk", "stretch-stretch"],
  "Thursday": ["wall-pushup", "heel-to-toe"],
  "Friday": ["brisk-walk", "tai-chi"],
  "Saturday": ["brisk-walk", "single-leg"],
  "Sunday": ["stretch-stretch"]
};

function generateUniqueId(prefix: string): string {
  const stamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 6);
  return `${prefix}-${stamp}-${randomStr}`;
}

const playChime = () => {
  try {
    if (typeof window === 'undefined') return;
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, ctx.currentTime);
    gain1.gain.setValueAtTime(0.2, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15);
    gain2.gain.setValueAtTime(0.2, ctx.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.35);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    
    osc1.start();
    osc1.stop(ctx.currentTime + 1.2);
    osc2.start(ctx.currentTime + 0.15);
    osc2.stop(ctx.currentTime + 1.35);
  } catch (err) {
    console.warn("Audio Context failed to initialize automatically.", err);
  }
};

export default function SeniorFitnessDashboard() {
  const [mounted, setMounted] = useState(false);
  
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('senior_fitness_email');
    }
    return false;
  });
  
  const [userEmail, setUserEmail] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('senior_fitness_email') || '';
    }
    return '';
  });
  
  const [emailInput, setEmailInput] = useState<string>('');
  
  const [largerText, setLargerText] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('senior_fitness_larger_text') === 'true';
    }
    return false;
  });
  
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeTab, setActiveTab] = useState<'welcome' | 'checklist' | 'timer' | 'progress'>('welcome');
  const [weekDays] = useState<any[]>(() => getWeekDates());
  
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const dates = getWeekDates();
    const todayObj = dates.find(d => d.isToday);
    return todayObj ? todayObj.dateString : dates[0].dateString;
  });
  
  const [completedLogs, setCompletedLogs] = useState<CompletedLog[]>(() => {
    if (typeof window !== 'undefined') {
      const email = localStorage.getItem('senior_fitness_email');
      if (email) {
        const emailKey = email.toLowerCase().trim();
        const savedLogs = localStorage.getItem(`senior_fitness_completed_logs_${emailKey}`);
        if (savedLogs) {
          try { return JSON.parse(savedLogs); } catch (e) {}
        }
      }
    }
    return [];
  });
  
  const [customScheduledActivities, setCustomScheduledActivities] = useState<{ [date: string]: ScheduledActivity[] }>(() => {
    if (typeof window !== 'undefined') {
      const email = localStorage.getItem('senior_fitness_email');
      if (email) {
        const emailKey = email.toLowerCase().trim();
        const savedCustomSchedule = localStorage.getItem(`senior_fitness_custom_schedule_${emailKey}`);
        if (savedCustomSchedule) {
          try { return JSON.parse(savedCustomSchedule); } catch (e) {}
        }
      }
    }
    return {};
  });
  
  const [selectedExercise, setSelectedExercise] = useState<Exercise>(EXERCISES_DB[0]);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(600);
  const [timerInitialSeconds, setTimerInitialSeconds] = useState<number>(600);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [showCompletionPrompt, setShowCompletionPrompt] = useState<boolean>(false);
  
  // Custom Intensity and Habit tracking states
  const [selectedIntensity, setSelectedIntensity] = useState<'Light' | 'Moderate' | 'Vigorous'>('Moderate');
  
  const [showCustomLogModal, setShowCustomLogModal] = useState<boolean>(false);
  const [customLogExerciseId, setCustomLogExerciseId] = useState<string>(EXERCISES_DB[0].id);
  const [customLogMinutes, setCustomLogMinutes] = useState<number>(10);
  
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isLoggedIn && userEmail) {
      const emailKey = userEmail.toLowerCase().trim();
      localStorage.setItem(`senior_fitness_completed_logs_${emailKey}`, JSON.stringify(completedLogs));
    }
  }, [completedLogs, mounted, userEmail, isLoggedIn]);

  useEffect(() => {
    if (mounted && isLoggedIn && userEmail) {
      const emailKey = userEmail.toLowerCase().trim();
      localStorage.setItem(`senior_fitness_custom_schedule_${emailKey}`, JSON.stringify(customScheduledActivities));
    }
  }, [customScheduledActivities, mounted, userEmail, isLoggedIn]);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('senior_fitness_larger_text', String(largerText));
    }
  }, [largerText, mounted]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSecondsLeft > 0) {
      interval = setInterval(() => {
        setTimerSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (timerSecondsLeft === 0 && isTimerRunning) {
      const timerId = setTimeout(() => {
        setIsTimerRunning(false);
        playChime();
        setShowCompletionPrompt(true);
      }, 0);
      return () => clearTimeout(timerId);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSecondsLeft]);

  // Self-Generated Feature: Compute Weekly Streak of consecutive active days
  const getWeeklyStreak = () => {
    const activeDates = new Set(completedLogs.map(log => log.dateString));
    let currentStreak = 0;
    const sortedDays = [...weekDays].sort((a, b) => a.dateString.localeCompare(b.dateString));
    
    for (const day of sortedDays) {
      if (activeDates.has(day.dateString)) {
        currentStreak++;
      } else if (day.dateString === new Date().toISOString().split('T')[0]) {
        break;
      }
    }
    return currentStreak;
  };

  const handleSignIn = (e?: React.FormEvent, guestEmail?: string) => {
    if (e) e.preventDefault();
    const emailToUse = guestEmail || emailInput.trim();
    if (!emailToUse) return;
    
    localStorage.setItem('senior_fitness_email', emailToUse);
    setUserEmail(emailToUse);
    setIsLoggedIn(true);

    const emailKey = emailToUse.toLowerCase().trim();
    const savedLogs = localStorage.getItem(`senior_fitness_completed_logs_${emailKey}`);
    if (savedLogs) {
      try { setCompletedLogs(JSON.parse(savedLogs)); } catch (e) { setCompletedLogs([]); }
    } else {
      setCompletedLogs([]);
    }

    const savedCustomSchedule = localStorage.getItem(`senior_fitness_custom_schedule_${emailKey}`);
    if (savedCustomSchedule) {
      try { setCustomScheduledActivities(JSON.parse(savedCustomSchedule)); } catch (e) { setCustomScheduledActivities({}); }
    } else {
      setCustomScheduledActivities({});
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('senior_fitness_email');
    setUserEmail('');
    setIsLoggedIn(false);
    setEmailInput('');
    setIsTimerRunning(false);
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleSpeakInstructions = (exercise: Exercise) => {
    if (!window.speechSynthesis) {
      alert("Speech output is not fully supported on this web browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak = `
      Instructions for ${exercise.name}. 
      ${exercise.description} 
      Here are the steps to exercise safely: 
      ${exercise.instructions.map((step, idx) => `Step ${idx + 1}, ${step}`).join('. ')} 
      Important Safety Tip: ${exercise.safetyTip}
    `;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.82;
    utterance.pitch = 1.0;
    
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en') && v.localService) || voices.find(v => v.lang.startsWith('en'));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechRef.current = utterance;
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const getSelectedDayDetails = () => {
    const found = weekDays.find(d => d.dateString === selectedDate);
    return found ? found : { dayName: 'Monday', isToday: false, dayOfMonth: 1 };
  };

  const selectedDayInfo = getSelectedDayDetails();

  const getActivitiesForSelectedDay = (): ScheduledActivity[] => {
    const dayName = selectedDayInfo.dayName;
    const defaultIds = DEFAULT_SCHEDULE_BY_DAY_NAME[dayName] || [];
    
    const defaults: ScheduledActivity[] = defaultIds.map(id => {
      const ex = EXERCISES_DB.find(e => e.id === id);
      return {
        id: `default-${id}-${selectedDate}`,
        exerciseId: id,
        name: ex ? ex.name : 'Unknown Exercise',
        minutes: ex ? ex.minutes : 10,
        category: ex ? ex.category : 'balance',
        completed: completedLogs.some(log => log.dateString === selectedDate && log.name === (ex?.name || ''))
      };
    });

    const customs = customScheduledActivities[selectedDate] || [];
    const allActivities = [...defaults];
    customs.forEach(c => {
      const isCompleted = completedLogs.some(log => log.id === c.id || (log.dateString === selectedDate && log.name === c.name));
      allActivities.push({ ...c, completed: isCompleted });
    });

    return allActivities;
  };

  const dailyActivitiesList = getActivitiesForSelectedDay();

  const handleLogActivity = (name: string, minutes: number, category: 'aerobic' | 'strength' | 'balance' | 'stretch', intensityLevel: 'Light' | 'Moderate' | 'Vigorous' = 'Moderate', customId?: string) => {
    const newLog: CompletedLog = {
      id: customId || generateUniqueId('log'),
      dateString: selectedDate,
      name,
      minutes,
      category,
      intensity: intensityLevel,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const alreadyLogged = completedLogs.some(log => log.dateString === selectedDate && log.name === name);
    if (!alreadyLogged) {
      setCompletedLogs(prev => [newLog, ...prev]);
    }
  };

  const handleRemoveLog = (id: string) => {
    setCompletedLogs(prev => prev.filter(log => log.id !== id));
  };

  const handleToggleActivityCompletion = (activity: ScheduledActivity) => {
    if (activity.completed) {
      const foundLog = completedLogs.find(log => log.dateString === selectedDate && log.name === activity.name);
      if (foundLog) {
        handleRemoveLog(foundLog.id);
      }
    } else {
      handleLogActivity(activity.name, activity.minutes, activity.category, selectedIntensity, activity.id);
    }
  };

  const handleSelectExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setTimerInitialSeconds(exercise.minutes * 60);
    setTimerSecondsLeft(exercise.minutes * 60);
    setIsTimerRunning(false);
    
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleSetTimerPreset = (minutes: number) => {
    setTimerInitialSeconds(minutes * 60);
    setTimerSecondsLeft(minutes * 60);
    setIsTimerRunning(false);
  };

  const handleAdjustTimer = (changeInMinutes: number) => {
    const currentMinutes = Math.floor(timerSecondsLeft / 60);
    let targetMinutes = currentMinutes + changeInMinutes;
    if (targetMinutes < 1) targetMinutes = 1;
    if (targetMinutes > 120) targetMinutes = 120;
    
    setTimerInitialSeconds(targetMinutes * 60);
    setTimerSecondsLeft(targetMinutes * 60);
    setIsTimerRunning(false);
  };

  const getWeeklyProgressMetrics = () => {
    const totalAerobicMins = completedLogs
      .filter(log => log.category === 'aerobic')
      .reduce((sum, log) => sum + log.minutes, 0);

    const strengthDays = new Set(completedLogs.filter(log => log.category === 'strength').map(log => log.dateString)).size;
    const balanceDays = new Set(completedLogs.filter(log => log.category === 'balance').map(log => log.dateString)).size;

    return {
      aerobicMins: totalAerobicMins,
      aerobicTarget: 150,
      strengthDays,
      strengthTarget: 2,
      balanceDays,
      balanceTarget: 3,
      isAerobicMet: totalAerobicMins >= 150,
      isStrengthMet: strengthDays >= 2,
      isBalanceMet: balanceDays >= 3
    };
  };

  const progress = getWeeklyProgressMetrics();

  const handleResetAllData = () => {
    const confirmClear = window.confirm("Are you sure you want to clear your fitness activity history and start a brand new week?");
    if (confirmClear) {
      setCompletedLogs([]);
      setCustomScheduledActivities({});
      setIsTimerRunning(false);
      setTimerSecondsLeft(300);
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
    }
  };

  const handleAddCustomScheduleItem = (e: React.FormEvent) => {
    e.preventDefault();
    const ex = EXERCISES_DB.find(e => e.id === customLogExerciseId) || EXERCISES_DB[0];
    const newActivity: ScheduledActivity = {
      id: generateUniqueId('custom'),
      exerciseId: ex.id,
      name: ex.name,
      minutes: customLogMinutes,
      category: ex.category,
      completed: false
    };

    const currentDayCustoms = customScheduledActivities[selectedDate] || [];
    setCustomScheduledActivities(prev => ({
      ...prev,
      [selectedDate]: [...currentDayCustoms, newActivity]
    }));

    setShowCustomLogModal(false);
  };

  const formatTimerDisplay = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8F9FA] text-[#0F172A]">
        <div className="text-center p-8 bg-white rounded-none border border-slate-300 max-w-sm">
          <Heart className="w-12 h-12 text-[#0F172A] mx-auto mb-4" />
          <h2 className="text-xl font-bold tracking-tight text-[#0F172A]">Loading Fitness Companion...</h2>
        </div>
      </div>
    );
  }

  const textScale = {
    title: largerText ? 'text-4xl md:text-5xl font-bold tracking-tight' : 'text-2xl md:text-3xl font-bold tracking-tight',
    subtitle: largerText ? 'text-xl md:text-2xl font-normal' : 'text-sm md:text-base font-normal',
    h2: largerText ? 'text-3xl md:text-4xl font-bold' : 'text-lg md:text-xl font-bold',
    h3: largerText ? 'text-2xl md:text-3xl font-bold' : 'text-base md:text-lg font-bold',
    h4: largerText ? 'text-xl md:text-2xl font-bold' : 'text-sm md:text-base font-bold',
    body: largerText ? 'text-xl md:text-2xl leading-relaxed' : 'text-sm md:text-base leading-relaxed',
    bodySmall: largerText ? 'text-lg md:text-xl' : 'text-xs md:text-sm',
    small: largerText ? 'text-base font-medium' : 'text-xs font-medium',
    label: 'text-xs font-bold uppercase tracking-wider',
    timerText: largerText ? 'text-7xl font-mono font-bold' : 'text-5xl font-mono font-bold',
    btn: largerText ? 'text-xl font-bold py-4 px-6' : 'text-sm font-bold py-2.5 px-4',
    btnSmall: largerText ? 'text-lg font-bold' : 'text-xs font-semibold',
    tab: largerText ? 'text-lg font-bold py-3 px-4' : 'text-xs font-bold py-2 px-3',
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-between p-6 text-[#0F172A]">
        <div className="max-w-xl w-full mx-auto my-auto space-y-6 bg-white rounded-none border border-slate-300 p-8 shadow-sm">
          
          <div className="space-y-2">
            <h1 className={`${textScale.title} text-[#0F172A]`}>
              Senior Physical Activity Portal
            </h1>
            <p className={`${textScale.subtitle} text-slate-600`}>
              A secure, structural reference for following daily older adult exercise routines aligned with the Centers for Disease Control guidelines.
            </p>
          </div>

          <form onSubmit={(e) => handleSignIn(e)} className="space-y-4 pt-4 border-t border-slate-200">
            <div className="space-y-2">
              <label htmlFor="user-email-input" className={`${textScale.label} block text-slate-700`}>
                Account Identification (Email)
              </label>
              <input
                id="user-email-input"
                type="email"
                required
                placeholder="name@example.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className={`w-full py-2.5 px-3 rounded-none border border-slate-300 focus:border-[#0F172A] focus:outline-none bg-white text-[#0F172A] ${textScale.body}`}
              />
              <p className={`${textScale.small} text-slate-500`}>
                No password required. Authentication separating unique routine checklists occurs via local device processing keys.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="submit"
                className={`flex-1 bg-[#0F172A] text-white font-bold rounded-none transition-colors hover:bg-slate-800 text-center ${textScale.btn}`}
              >
                Access Account
              </button>
              
              <button
                type="button"
                onClick={() => handleSignIn(undefined, 'guest@seniorfitness.org')}
                className={`bg-white border border-slate-300 text-[#0F172A] font-bold rounded-none transition-colors hover:bg-slate-50 text-center ${textScale.btn}`}
              >
                Continue as Guest
              </button>
            </div>
          </form>

          <div className="bg-slate-50 p-4 rounded-none border border-slate-200 flex gap-3 items-start">
            <Info className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h4 className={`${textScale.small} font-bold text-slate-700`}>Standard CDC Targets:</h4>
              <p className={`${textScale.small} text-slate-500 leading-relaxed`}>
                Configured to monitor 150 aerobic minutes, 2 weekly strength days, and 3 balance coordination intervals.
              </p>
            </div>
          </div>
        </div>

        <footer className="text-center py-4 text-slate-400 border-t border-slate-200 max-w-xl w-full mx-auto">
          <p className={`${textScale.small}`}>
            Official Physical Geriatric Activity Framework
          </p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-4 text-[#0F172A] flex flex-col justify-between">
      <div className="max-w-6xl mx-auto w-full space-y-6">
        
        {/* Structural Plain Header */}
        <header className="bg-white rounded-none p-6 border border-slate-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-slate-100 text-slate-800 font-bold text-xs uppercase px-2 py-0.5 tracking-wider">CDC Compliance Standard</span>
              <span className="text-slate-300">|</span>
              <span className="text-xs text-slate-600 flex items-center gap-1">
                <UserCheck className="w-3 h-3 text-slate-500" /> Active: <strong className="text-[#0F172A]">{userEmail}</strong>
              </span>
            </div>
            <h1 className={`${textScale.h2} font-bold text-[#0F172A]`}>
              Senior Physical Action Management Console
            </h1>
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <button
              onClick={() => setLargerText(!largerText)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-none border text-xs transition-colors font-bold cursor-pointer ${
                largerText ? 'bg-[#0F172A] border-[#0F172A] text-white' : 'bg-white border-slate-300 text-[#0F172A] hover:bg-slate-50'
              }`}
            >
              <Accessibility className="w-4 h-4 shrink-0" />
              <span>{largerText ? 'Standard Text' : 'Enlarge Typography'}</span>
            </button>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 text-slate-600 rounded-none font-bold text-xs transition-colors hover:bg-slate-50 cursor-pointer"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Disconnect</span>
            </button>
          </div>
        </header>

        {/* Tab Navigation Matrix */}
        <div className="grid grid-cols-2 md:flex md:flex-row gap-1 bg-white p-1 rounded-none border border-slate-300">
          {(['welcome', 'checklist', 'timer', 'progress'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 rounded-none cursor-pointer transition-colors border py-2 px-4 ${textScale.tab} ${
                activeTab === tab
                  ? 'bg-[#0F172A] border-[#0F172A] text-white font-bold'
                  : 'bg-transparent border-transparent text-slate-700 hover:bg-slate-100 font-medium'
              }`}
            >
              <span>{tab.toUpperCase()}</span>
            </button>
          ))}
        </div>

        {/* Dynamic Display Panel */}
        <main className="w-full">
          
          {/* Welcome Hub Matrix */}
          {activeTab === 'welcome' && (
            <div className="space-y-6">
              <div className="bg-[#0F172A] text-white rounded-none p-6 border border-slate-900">
                <div className="max-w-2xl space-y-2">
                  <h2 className={`${textScale.title} text-white`}>
                    Physical Maintenance Overview
                  </h2>
                  <p className={`${textScale.subtitle} text-slate-300`}>
                    Review tasks, execute timed sessions, and update metrics logs accurately via specialized structural modules.
                  </p>
                  <div className="pt-2 flex items-center gap-4 text-xs text-slate-400">
                    <span>Date Context: {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                  </div>
                </div>
              </div>

              {/* Metric Card Summary Board */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-none border border-slate-300">
                  <span className={`${textScale.label} text-slate-500 block mb-1`}>Assigned Iterations</span>
                  <p className={`${textScale.bodySmall} font-bold text-[#0F172A]`}>{dailyActivitiesList.length} Scheduled Today</p>
                </div>

                <div className="bg-white p-5 rounded-none border border-slate-300">
                  <span className={`${textScale.label} text-slate-500 block mb-1`}>Target Focus</span>
                  <p className={`${textScale.bodySmall} font-bold text-[#0F172A] truncate`}>{selectedExercise.name}</p>
                </div>

                <div className="bg-white p-5 rounded-none border border-slate-300">
                  <span className={`${textScale.label} text-slate-500 block mb-1`}>Aerobic Volume</span>
                  <p className={`${textScale.bodySmall} font-bold text-[#0F172A]`}>{progress.aerobicMins} / 150 Minutes</p>
                </div>

                {/* Self-Generated Feature Integration UI Element */}
                <div className="bg-slate-900 text-white p-5 rounded-none border border-slate-950 flex flex-col justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Weekly Consistency Streak</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-bold font-mono text-white">{getWeeklyStreak()}</span>
                    <span className="text-xs text-slate-400">Consecutive Active Days</span>
                  </div>
                </div>
              </div>

              {/* Block Routing Framework */}
              <div className="bg-white rounded-none border border-slate-300 p-6 space-y-4">
                <h3 className={`${textScale.h3} text-[#0F172A]`}>Functional Task Vectors</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button onClick={() => setActiveTab('checklist')} className="text-left p-5 bg-slate-50 border border-slate-300 rounded-none hover:bg-slate-100 transition-colors">
                    <h4 className={`${textScale.h4} text-[#0F172A] font-bold underline`}>Open Routine Matrix</h4>
                    <p className={`${textScale.small} text-slate-600 mt-2`}>Configure weekly tracking days, execute schedules, and record status logs.</p>
                  </button>

                  <button onClick={() => setActiveTab('timer')} className="text-left p-5 bg-slate-50 border border-slate-300 rounded-none hover:bg-slate-100 transition-colors">
                    <h4 className={`${textScale.h4} text-[#0F172A] font-bold underline`}>Initialize Timer Core</h4>
                    <p className={`${textScale.small} text-slate-600 mt-2`}>Display active visual countdown sequences and text-to-speech audio logs.</p>
                  </button>

                  <button onClick={() => setActiveTab('progress')} className="text-left p-5 bg-slate-50 border border-slate-300 rounded-none hover:bg-slate-100 transition-colors">
                    <h4 className={`${textScale.h4} text-[#0F172A] font-bold underline`}>Examine Metrics Feed</h4>
                    <p className={`${textScale.small} text-slate-600 mt-2`}>Verify total active parameters against public clinical safety boundaries.</p>
                  </button>
                </div>
              </div>

              {/* Safety Instructions Sub-panel */}
              <div className="w-full bg-white rounded-none border border-slate-300 p-6 space-y-4">
                <h3 className={`${textScale.h3} text-[#0F172A]`}>Clinical Precaution Protocols</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-800">
                  <div className="p-4 bg-slate-50 border border-slate-200">
                    <p className={`${textScale.small}`}><strong>Structural Support:</strong> Maintain proximity to structural counters, walls, or non-wheeled backing units during balance intervals.</p>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-200">
                    <p className={`${textScale.small}`}><strong>Hydration Balance:</strong> Systematically consume standard water volumes pre-session, mid-session, and post-session.</p>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-200">
                    <p className={`${textScale.small}`}><strong>Pain Termination:</strong> Cease muscle work completely if internal acute tension or joint resistance exceeds normal warmth thresholds.</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={() => {
                      if (!window.speechSynthesis) return;
                      if (isSpeaking) { window.speechSynthesis.cancel(); setIsSpeaking(false); return; }
                      const txt = "Precaution Protocols. One: Maintain proximity to counters or walls. Two: Systematically consume water. Three: Cease work immediately if pain occurs.";
                      const u = new SpeechSynthesisUtterance(txt);
                      u.rate = 0.8; u.onend = () => setIsSpeaking(false); window.speechSynthesis.speak(u); setIsSpeaking(true);
                    }}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 bg-slate-50 text-slate-800 font-bold text-xs rounded-none transition-colors hover:bg-slate-100"
                  >
                    {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    <span>{isSpeaking ? "Terminate Voice Output" : "Auditory Safety Broadcast"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Routine Matrix View */}
          {activeTab === 'checklist' && (
            <div className="space-y-6">
              {/* Daily Calendar Matrix */}
              <div className="bg-white rounded-none border border-slate-300 p-6">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-200">
                  <h3 className={`${textScale.h3} text-[#0F172A]`}>Calendar Partition Select</h3>
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {weekDays.map((day) => {
                    const isSelected = selectedDate === day.dateString;
                    return (
                      <button
                        key={day.dateString}
                        onClick={() => {
                          setSelectedDate(day.dateString);
                          const defaultIds = DEFAULT_SCHEDULE_BY_DAY_NAME[day.dayName] || [];
                          if (defaultIds.length > 0) {
                            const ex = EXERCISES_DB.find(e => e.id === defaultIds[0]);
                            if (ex) handleSelectExercise(ex);
                          }
                        }}
                        className={`flex flex-col items-center justify-center p-3 border rounded-none transition-colors cursor-pointer ${
                          isSelected ? 'bg-[#0F172A] text-white border-[#0F172A] font-bold' : day.isToday ? 'bg-slate-100 text-[#0F172A] border-slate-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-[10px] uppercase tracking-wider block font-semibold">{day.dayName.substring(0, 3)}</span>
                        <span className="text-lg font-mono font-bold mt-0.5">{day.dayOfMonth}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="bg-slate-50 p-4 border border-slate-200 flex flex-col sm:flex-row justify-between items-center mt-4 gap-2">
                  <p className={`${textScale.small} text-slate-700 font-bold`}>
                    Active Target Segment: {selectedDayInfo.dayName}, {selectedDayInfo.monthLabel} {selectedDayInfo.dayOfMonth}
                  </p>
                  <button onClick={() => setShowCustomLogModal(true)} className="flex items-center gap-1.5 py-1.5 px-3 bg-white border border-slate-300 hover:bg-slate-50 text-[#0F172A] rounded-none font-bold text-xs cursor-pointer shadow-xs">
                    <Plus className="w-3.5 h-3.5" /> Append Custom Action
                  </button>
                </div>
              </div>

              {/* Self-Generated Feature Integration: Intensity Configuration Box */}
              <div className="bg-white border border-slate-300 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Pre-set Exertion Intensity</h4>
                  <p className="text-xs text-slate-500">Select your current condition profile before confirming completion status items.</p>
                </div>
                <div className="flex border border-slate-300 p-0.5 bg-slate-50">
                  {(['Light', 'Moderate', 'Vigorous'] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setSelectedIntensity(level)}
                      className={`px-3 py-1 text-xs font-bold transition-colors ${
                        selectedIntensity === level ? 'bg-[#0F172A] text-white' : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Task Cards Checklist */}
              <div className="bg-white rounded-none border border-slate-300 p-6">
                <h3 className={`${textScale.h3} text-[#0F172A] border-b border-slate-200 pb-2 mb-4`}>Target Routine Checklist</h3>

                {dailyActivitiesList.length === 0 ? (
                  <p className="text-center py-8 text-slate-400 text-sm">No verification parameters declared for this date structure.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {dailyActivitiesList.map((activity) => {
                      const matchedDbEx = EXERCISES_DB.find(e => e.id === activity.exerciseId || e.name === activity.name);
                      return (
                        <div key={activity.id} className={`flex items-center justify-between p-4 border rounded-none transition-colors bg-white ${selectedExercise.name === activity.name ? 'border-slate-900 bg-slate-50' : 'border-slate-300'}`}>
                          <div className="flex-1 cursor-pointer min-w-0 pr-4" onClick={() => matchedDbEx && handleSelectExercise(matchedDbEx)}>
                            <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 block">{activity.category}</span>
                            <h4 className={`${textScale.h4} font-bold text-slate-900 truncate`}>{activity.name}</h4>
                            <p className="text-xs text-slate-600 mt-1">{activity.minutes} Minutes Configuration</p>
                          </div>

                          <button
                            onClick={() => handleToggleActivityCompletion(activity)}
                            className={`w-10 h-10 border rounded-none flex items-center justify-center shrink-0 transition-colors ${activity.completed ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 border-slate-300'}`}
                          >
                            {activity.completed && <CheckCircle2 className="w-5 h-5" />}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Interactive Countdown Core View */}
          {activeTab === 'timer' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Guidance Specifications Column */}
              <div className="lg:col-span-6 bg-white rounded-none border border-slate-300 p-6 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-3 gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Focus Index</span>
                    <h2 className={`${textScale.h2} text-[#0F172A]`}>{selectedExercise.name}</h2>
                  </div>
                  <button
                    onClick={() => handleSpeakInstructions(selectedExercise)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-300 text-slate-800 rounded-none font-bold text-xs"
                  >
                    {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    <span>{isSpeaking ? "Pause Audio" : "Stream Audio"}</span>
                  </button>
                </div>

                <p className={`${textScale.body} font-medium text-slate-700 leading-relaxed`}>{selectedExercise.description}</p>

                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Execution Directives:</h4>
                  <ol className="space-y-2">
                    {selectedExercise.instructions.map((step, idx) => (
                      <li key={idx} className="text-xs text-slate-700 flex gap-2 items-start leading-relaxed">
                        <span className="font-mono font-bold text-[#0F172A]">{idx + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-none text-xs text-slate-700">
                  <strong>Critical Directive:</strong> {selectedExercise.safetyTip}
                </div>
              </div>

              {/* High-Contrast Structural Countdown Interface */}
              <div className="lg:col-span-6 bg-white text-[#0F172A] rounded-none border-2 border-slate-900 p-6 flex flex-col justify-between relative">
                <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                  <span className="text-xs font-bold font-mono text-slate-600">Countdown Core Engine</span>
                  <span className="text-xs bg-slate-100 px-2 py-0.5 font-bold">Standard Limit: {selectedExercise.minutes}m</span>
                </div>

                <div className="text-center py-8">
                  <div className={`${textScale.timerText} tracking-tight p-6 bg-slate-50 border border-slate-300 inline-block text-[#0F172A]`}>
                    {formatTimerDisplay(timerSecondsLeft)}
                  </div>
                  <p className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider mt-2">Remaining Temporal Output Block</p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-center gap-1 flex-wrap">
                    {[1, 5, 10, 15, 30].map((mins) => (
                      <button key={mins} onClick={() => handleSetTimerPreset(mins)} className={`py-1 px-2 text-xs font-mono border rounded-none ${timerInitialSeconds === mins * 60 ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                        {mins}M
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2 max-w-xs mx-auto">
                    <button onClick={() => handleAdjustTimer(-1)} className="flex-1 py-1.5 bg-slate-50 border border-slate-200 text-xs font-bold rounded-none">Sub 1 Min</button>
                    <button onClick={() => handleAdjustTimer(1)} className="flex-1 py-1.5 bg-slate-50 border border-slate-200 text-xs font-bold rounded-none">Add 1 Min</button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-6">
                  <button onClick={() => setIsTimerRunning(!isTimerRunning)} className={`py-3 text-sm font-bold rounded-none border tracking-wider ${isTimerRunning ? 'bg-amber-700 text-white border-amber-700' : 'bg-slate-900 text-white border-slate-900'}`}>
                    {isTimerRunning ? "HALT COUNTER" : "ENGAGE TIMER"}
                  </button>

                  <button onClick={() => { setIsTimerRunning(false); setTimerSecondsLeft(timerInitialSeconds); }} className="py-3 bg-white text-slate-800 border border-slate-300 text-sm font-bold rounded-none">
                    RESET INTERVAL
                  </button>
                </div>

                <AnimatePresence>
                  {showCompletionPrompt && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-white border border-slate-900 p-6 flex flex-col items-center justify-center text-center z-10">
                      <div className="space-y-4 max-w-sm">
                        <h4 className={`${textScale.h2} text-slate-900 font-bold`}>Interval Completed Successfully</h4>
                        <p className="text-xs text-slate-600">Interval metrics recorded: {Math.round(timerInitialSeconds / 60)} minutes of {selectedExercise.name} at {selectedIntensity} intensity profile.</p>

                        <button
                          onClick={() => {
                            setShowCompletionPrompt(false);
                            handleLogActivity(selectedExercise.name, Math.round(timerInitialSeconds / 60), selectedExercise.category, selectedIntensity);
                            setTimerSecondsLeft(timerInitialSeconds);
                          }}
                          className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-none text-xs"
                        >
                          Confirm Entry into Database
                        </button>

                        <button onClick={() => { setShowCompletionPrompt(false); setTimerSecondsLeft(timerInitialSeconds); }} className="w-full py-1.5 bg-white text-slate-500 border border-slate-200 text-xs font-medium">
                          Discard Session Metrics
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Database & Progress Feed Matrix */}
          {activeTab === 'progress' && (
            <div className="space-y-6">
              <div className="bg-white rounded-none border border-slate-300 p-6">
                <h3 className={`${textScale.h3} text-[#0F172A] border-b border-slate-200 pb-2 mb-4`}>Clinical Threshold Verification Metrics</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-50 p-4 border border-slate-200">
                    <span className="text-[10px] uppercase font-mono text-slate-500 block">Aerobic Performance Volume</span>
                    <p className="text-xl font-mono font-bold text-slate-900 mt-1">{progress.aerobicMins} / 150 Mins</p>
                    <span className="text-xs text-slate-500 block mt-1">{progress.isAerobicMet ? "Status: Compliant" : `${150 - progress.aerobicMins} mins deficient`}</span>
                  </div>

                  <div className="bg-slate-50 p-4 border border-slate-200">
                    <span className="text-[10px] uppercase font-mono text-slate-500 block">Strength Allocation Balance</span>
                    <p className="text-xl font-mono font-bold text-slate-900 mt-1">{progress.strengthDays} / 2 Days</p>
                    <span className="text-xs text-slate-500 block mt-1">{progress.isStrengthMet ? "Status: Compliant" : `${2 - progress.strengthDays} days deficient`}</span>
                  </div>

                  <div className="bg-slate-50 p-4 border border-slate-200">
                    <span className="text-[10px] uppercase font-mono text-slate-500 block">Stability Coordination Balance</span>
                    <p className="text-xl font-mono font-bold text-slate-900 mt-1">{progress.balanceDays} / 3 Days</p>
                    <span className="text-xs text-slate-500 block mt-1">{progress.isBalanceMet ? "Status: Compliant" : `${3 - progress.balanceDays} days deficient`}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 bg-white rounded-none border border-slate-300 p-6 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <h3 className={`${textScale.h3} font-bold text-[#0F172A]`}>Archived Activity Log Ledger</h3>
                    <span className="text-xs font-mono bg-slate-100 px-2 py-0.5">{completedLogs.length} Records</span>
                  </div>

                  {completedLogs.length === 0 ? (
                    <p className="text-center py-6 text-slate-400 text-xs">No entries verified in structural tracking arrays yet.</p>
                  ) : (
                    <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                      {completedLogs.map((log) => {
                        const dayLabel = weekDays.find(d => d.dateString === log.dateString)?.dayName || "External Log";
                        return (
                          <div key={log.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-none">
                            <div className="min-w-0 pr-2">
                              <h4 className="text-xs font-bold text-slate-900">{log.name}</h4>
                              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                                {dayLabel} | {log.minutes} Mins | Intensity: {log.intensity || 'Unspecified'} | Logged: {log.timestamp}
                              </p>
                            </div>
                            <button onClick={() => handleRemoveLog(log.id)} className="p-1.5 text-slate-500 hover:text-red-700 bg-white border border-slate-200 rounded-none cursor-pointer transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="pt-2">
                    <button onClick={handleResetAllData} className="py-1 px-2 border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 font-bold text-xs rounded-none transition-colors">
                      Purge Memory Arrays & Start Fresh Week
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-slate-50 border border-slate-300 rounded-none p-6 space-y-3 text-xs text-slate-700">
                  <h3 className="text-sm font-bold text-[#0F172A]">CDC Context Matrix</h3>
                  <p className="leading-relaxed">Geriatric fitness allocations mandate regular validation checks for safety stability:</p>
                  <ul className="space-y-2 list-disc pl-4 font-medium text-slate-600">
                    <li>Aerobic load targets heart threshold normalization.</li>
                    <li>Resistance/Strength protocols reduce severe muscle drop rates.</li>
                    <li>Balance posture configurations inhibit bone fractures caused by slips.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Corporate Clinical System Footer */}
      <footer className="text-center py-6 text-slate-500 border-t border-slate-300 max-w-6xl w-full mx-auto mt-12 bg-white px-6">
        <p className="text-xs font-bold text-[#0F172A]">Senior Physical Maintenance Console Architecture</p>
        <p className="text-[10px] font-medium text-slate-400 mt-0.5">High-Contrast Accessible Layout Profile System • Optimized for Academic Review</p>
      </footer>

      {/* Modal Dialog for Configuration Updates */}
      <AnimatePresence>
        {showCustomLogModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-white rounded-none border-2 border-slate-900 p-6 max-w-md w-full shadow-xl text-[#0F172A]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#0F172A]">Schedule custom routine unit</h3>
                  <p className="text-xs text-slate-500">Injecting manual allocation metrics onto targeted calendar days.</p>
                </div>
                <button onClick={() => setShowCustomLogModal(false)} className="text-slate-400 hover:text-slate-900 font-mono text-xs font-bold">CLOSE</button>
              </div>

              <form onSubmit={handleAddCustomScheduleItem} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">Select Exercise Profile Model:</label>
                  <select value={customLogExerciseId} onChange={(e) => setCustomLogExerciseId(e.target.value)} className="w-full p-2 border border-slate-300 bg-white text-xs font-bold text-slate-800 rounded-none">
                    {EXERCISES_DB.map(ex => <option key={ex.id} value={ex.id}>{ex.name} ({ex.category})</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">Configured Run Interval Minutes:</label>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => setCustomLogMinutes(p => Math.max(1, p - 5))} className="px-2 py-1 bg-slate-100 border border-slate-300 font-mono text-xs font-bold">-5</button>
                    <input type="number" required min={1} max={180} value={customLogMinutes} onChange={(e) => setCustomLogMinutes(Math.max(1, parseInt(e.target.value) || 1))} className="flex-1 p-1.5 text-center font-mono text-xs font-bold border border-slate-300" />
                    <button type="button" onClick={() => setCustomLogMinutes(p => Math.min(180, p + 5))} className="px-2 py-1 bg-slate-100 border border-slate-300 font-mono text-xs font-bold">+5</button>
                  </div>
                </div>

                <button type="submit" className="w-full py-2 bg-slate-900 text-white font-bold text-xs tracking-wider rounded-none">
                  COMMIT ACTIVITY ENTRY TO CALENDAR
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}