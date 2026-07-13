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

// Define structures for this app
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
}

interface CompletedLog {
  id: string;
  dateString: string;
  name: string;
  minutes: number;
  category: 'aerobic' | 'strength' | 'balance' | 'stretch';
  timestamp: string;
}

// 1. Static exercise database aligned with official CDC older adults physical activity guidelines
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
    if (typeof window !== 'undefined') return !!localStorage.getItem('senior_fitness_email');
    return false;
  });
  
  const [userEmail, setUserEmail] = useState<string>(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('senior_fitness_email') || '';
    return '';
  });
  
  const [emailInput, setEmailInput] = useState<string>('');
  const [largerText, setLargerText] = useState<boolean>(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('senior_fitness_larger_text') === 'true';
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

  // RESTORED: Explicit exercise categorization selector category view state
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'all' | 'aerobic' | 'strength' | 'balance' | 'stretch'>('all');
  
  // RESTORED: Custom standalone logger form wizard states
  const [manualWorkoutName, setManualWorkoutName] = useState('');
  const [manualWorkoutDuration, setManualWorkoutDuration] = useState<number>(15);
  const [manualWorkoutCategory, setManualWorkoutCategory] = useState<'aerobic' | 'strength' | 'balance' | 'stretch'>('aerobic');

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
      alert("I am sorry, speech output is not fully supported on this web browser.");
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
    if (englishVoice) utterance.voice = englishVoice;

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

    // RESTORED: Filter by selection profile category
    if (selectedCategoryFilter !== 'all') {
      return allActivities.filter(a => a.category === selectedCategoryFilter);
    }

    return allActivities;
  };

  const dailyActivitiesList = getActivitiesForSelectedDay();

  const handleLogActivity = (name: string, minutes: number, category: 'aerobic' | 'strength' | 'balance' | 'stretch', customId?: string) => {
    const newLog: CompletedLog = {
      id: customId || generateUniqueId('log'),
      dateString: selectedDate,
      name,
      minutes,
      category,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const alreadyLogged = completedLogs.some(log => log.dateString === selectedDate && log.name === name);
    if (!alreadyLogged) {
      setCompletedLogs(prev => [newLog, ...prev]);
    }
  };

  // RESTORED: Handle submission of arbitrary manual workflow log entries
  const handleManualQuickLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualWorkoutName.trim()) return;
    
    handleLogActivity(
      manualWorkoutName.trim(),
      manualWorkoutDuration,
      manualWorkoutCategory
    );
    
    setManualWorkoutName('');
    alert("Workout successfully saved directly to your history log!");
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
      handleLogActivity(activity.name, activity.minutes, activity.category, activity.id);
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

    const strengthLogs = completedLogs.filter(log => log.category === 'strength');
    const strengthDays = new Set(strengthLogs.map(log => log.dateString)).size;

    const balanceLogs = completedLogs.filter(log => log.category === 'balance');
    const balanceDays = new Set(balanceLogs.map(log => log.dateString)).size;

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
      <div className="flex items-center justify-center min-h-screen bg-[#FCFAF6] text-[#2C2925]">
        <div className="text-center p-8 bg-white rounded-[32px] border-2 border-[#D3CEBE] max-w-sm shadow-[6px_6px_0px_0px_rgba(90,90,64,0.15)]">
          <Heart className="w-16 h-16 text-[#1E3A8A] animate-pulse mx-auto mb-4" />
          <h2 className="text-2xl font-serif font-bold text-[#1E3A8A]">Opening your Fitness Companion...</h2>
          <p className="text-[#5A5A40] mt-2 font-medium">Loading calendar, guidelines, and large buttons.</p>
        </div>
      </div>
    );
  }

  const textScale = {
    title: largerText ? 'text-5xl md:text-6xl font-serif font-bold' : 'text-3xl md:text-4xl font-serif font-bold',
    subtitle: largerText ? 'text-2xl md:text-3xl font-medium' : 'text-base md:text-lg font-medium',
    h2: largerText ? 'text-4xl md:text-5xl font-serif font-bold' : 'text-xl md:text-2xl font-serif font-bold',
    h3: largerText ? 'text-3xl md:text-4xl font-serif font-bold' : 'text-lg md:text-xl font-serif font-bold',
    h4: largerText ? 'text-2xl md:text-3xl font-bold' : 'text-base md:text-lg font-bold',
    body: largerText ? 'text-2xl md:text-3xl leading-relaxed' : 'text-base md:text-lg leading-relaxed',
    bodySmall: largerText ? 'text-xl md:text-2xl' : 'text-sm md:text-base',
    small: largerText ? 'text-lg md:text-xl font-medium' : 'text-xs md:text-sm font-medium',
    label: largerText ? 'text-xl font-bold uppercase tracking-wider' : 'text-xs font-bold uppercase tracking-wider',
    timerText: largerText ? 'text-8xl sm:text-10xl font-serif font-bold' : 'text-6xl sm:text-8xl font-serif font-medium',
    btn: largerText ? 'text-2xl font-bold py-6 px-8' : 'text-base font-bold py-3.5 px-5',
    btnSmall: largerText ? 'text-xl font-bold' : 'text-xs md:text-sm font-semibold',
    tab: largerText ? 'text-xl font-bold py-4 px-5' : 'text-sm font-bold py-2.5 px-3.5',
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#FCFAF6] flex flex-col justify-between p-4 md:p-8 text-[#2D2D2D]" id="login-screen-root">
        <div className="max-w-2xl w-full mx-auto my-auto space-y-8 bg-white rounded-[32px] border-2 border-[#D3CEBE] p-6 md:p-10 shadow-[8px_8px_0px_0px_rgba(90,90,64,0.15)]">
          <div className="text-center space-y-4">
            <div className="inline-flex p-3.5 bg-[#1E3A8A]/10 text-[#1E3A8A] rounded-full">
              <Heart className="w-10 h-10 fill-current" />
            </div>
            <h1 className={`${textScale.title} text-[#1E3A8A] leading-tight`}>Senior Fitness Scheduler</h1>
            <p className={`${textScale.subtitle} text-[#5A5A40] max-w-lg mx-auto`}>
              A friendly, easy-to-use tool designed for older adults to follow daily physical routines, use simple timers, and stay active safely.
            </p>
          </div>

          <form onSubmit={(e) => handleSignIn(e)} className="space-y-6 bg-[#FCFAF6] p-6 rounded-2xl border-2 border-[#E6E2D3] max-w-md mx-auto" id="email-signin-form">
            <div className="space-y-2">
              <label htmlFor="user-email-input" className={`${textScale.label} block text-[#5A5A40]`}>Enter your Email to sign in:</label>
              <input
                id="user-email-input"
                type="email"
                required
                placeholder="example@email.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className={`w-full py-3.5 px-4 rounded-xl border-2 border-[#D3CEBE] focus:border-[#1E3A8A] focus:outline-none bg-white text-[#2D2D2D] font-medium ${textScale.body}`}
              />
              <p className={`${textScale.small} text-[#7A7667] leading-relaxed`}>
                No password required! We use your email to safely separate your exercise checklist and history so multiple family members can use this device.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button type="submit" className={`flex-1 bg-[#1E3A8A] hover:bg-[#1A3073] text-white font-bold rounded-xl shadow-sm cursor-pointer transition-all active:scale-95 text-center ${textScale.btn}`} style={{ minHeight: '52px' }}>Sign In</button>
              <button type="button" onClick={() => handleSignIn(undefined, 'guest@seniorfitness.org')} className={`bg-white border-2 border-[#D3CEBE] hover:bg-[#F5F2EB] text-[#2D2D2D] font-bold rounded-xl cursor-pointer transition-all active:scale-95 text-center ${textScale.btn}`} style={{ minHeight: '52px' }}>Enter as Guest</button>
            </div>
          </form>

          <div className="bg-[#FAF7EE] p-5 rounded-2xl border border-[#E6E2D3] flex gap-4 items-start max-w-md mx-auto">
            <Info className="w-5 h-5 text-[#5A5A40] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className={`${textScale.small} font-bold text-[#5A5A40]`}>Official Healthy Aging Target:</h4>
              <p className={`${textScale.small} text-[#7A7667] leading-relaxed`}>Aligns with the US Centers for Disease Control (CDC) recommendation of 150 aerobic minutes, 2 strength days, and 3 balance days per week.</p>
            </div>
          </div>
        </div>
        <footer className="text-center py-6 text-[#7A7667] border-t border-[#E6E2D3] max-w-2xl w-full mx-auto mt-6">
          <p className={`${textScale.small} font-medium`}>Authorized Senior Physical Activity Guidelines Portal</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFAF6] p-3 md:p-6 text-[#2D2D2D] flex flex-col justify-between" id="app-root-container">
      <div className="max-w-7xl mx-auto w-full space-y-6">
        
        {/* Header section */}
        <header className="bg-white rounded-[24px] p-4 md:p-6 border-2 border-[#D3CEBE] shadow-[4px_4px_0px_0px_rgba(90,90,64,0.15)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4" id="app-main-header">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-[#1E3A8A]/10 text-[#1E3A8A] font-bold text-xs uppercase px-2.5 py-1 rounded-full">CDC Standard Exercises</span>
              <span className="text-[#7A7667]">•</span>
              <span className="text-xs text-[#7A7667] font-semibold flex items-center gap-1">
                <UserCheck className="w-3 h-3 text-[#5A5A40]" /> Profile: <strong className="text-[#1E3A8A]">{userEmail}</strong>
              </span>
            </div>
            <h1 className={`${textScale.h2} font-serif text-[#1E3A8A]`} id="main-title">Senior Fitness Scheduler</h1>
          </div>

          <div className="flex flex-wrap gap-2.5 w-full md:w-auto" id="header-controls">
            <button
              onClick={() => setLargerText(!largerText)}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 transition-all font-bold cursor-pointer ${largerText ? 'bg-[#1E3A8A] border-[#1E3A8A] text-white hover:bg-[#1A3073]' : 'bg-[#F9F8F4] border-[#D3CEBE] text-[#2D2D2D] hover:bg-[#F5F2EB]'}`}
              style={{ minHeight: '48px' }}
              id="text-size-toggle-btn"
            >
              <Accessibility className="w-5 h-5 shrink-0" />
              <span className={textScale.btnSmall}>{largerText ? '🔠 Regular Text' : '🔠 Make Text BIGGER'}</span>
            </button>

            <button onClick={handleSignOut} className="flex items-center gap-2 px-4 py-3 bg-white hover:bg-[#F9F8F4] text-[#7A7667] border-2 border-[#D3CEBE] rounded-xl font-bold transition-all cursor-pointer" style={{ minHeight: '48px' }}>
              <LogOut className="w-4 h-4 shrink-0" />
              <span className={textScale.btnSmall}>Switch User</span>
            </button>
          </div>
        </header>

        {/* NAVIGATION TABS */}
        <div className="grid grid-cols-2 md:flex md:flex-row gap-2.5 w-full bg-white p-2.5 rounded-[24px] border-2 border-[#D3CEBE] shadow-[4px_4px_0px_0px_rgba(90,90,64,0.15)]" id="navigation-tabs-bar">
          {(['welcome', 'checklist', 'timer', 'progress'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center justify-center gap-2 rounded-xl cursor-pointer transition-all border-2 py-2.5 px-3.5 ${textScale.tab} ${activeTab === tab ? 'bg-[#1E3A8A] border-[#1E3A8A] text-white shadow-xs font-bold' : 'bg-transparent border-transparent text-[#1E3A8A] hover:bg-[#FCFAF6] hover:border-[#E6E2D3] font-medium'}`}
            >
              {tab === 'welcome' && <Heart className="w-4 h-4 shrink-0" />}
              {tab === 'checklist' && <CalendarIcon className="w-4 h-4 shrink-0" />}
              {tab === 'timer' && <TimerIcon className="w-4 h-4 shrink-0" />}
              {tab === 'progress' && <Award className="w-4 h-4 shrink-0" />}
              <span className="capitalize">{tab === 'welcome' ? 'Welcome Hub' : tab === 'timer' ? 'Active Timer' : tab === 'progress' ? 'CDC Progress' : 'Checklist'}</span>
            </button>
          ))}
        </div>

        {/* MAIN BODY AREA */}
        <main className="w-full" id="active-tab-content">
          
          {/* TAB 0: WELCOME HUB */}
          {activeTab === 'welcome' && (
            <div className="space-y-6 animate-fadeIn" id="welcome-tab-view">
              <div className="bg-gradient-to-r from-[#1E3A8A] to-[#1E40AF] text-white rounded-[32px] p-6 md:p-8 border-2 border-[#1E3A8A] shadow-[6px_6px_0px_0px_rgba(30,58,138,0.2)]">
                <div className="max-w-3xl space-y-3">
                  <h2 className={`${textScale.title} font-serif text-white`}>Welcome back! Let&apos;s Stay Active & Balanced.</h2>
                  <div className="pt-2 flex flex-wrap items-center gap-4">
                    <span className={`${textScale.small} text-blue-100 font-semibold bg-white/10 px-3 py-1 rounded-md`}>👤 Profile: <strong>{userEmail}</strong></span>
                    <span className={`${textScale.small} text-blue-100 font-semibold bg-white/10 px-3 py-1 rounded-md`}>📅 {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                  </div>
                </div>
              </div>

              {/* Quick Summary Widgets */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white p-5 rounded-2xl border-2 border-[#D3CEBE] space-y-2">
                  <span className={`${textScale.small} text-[#7A7667] font-bold uppercase`}>Today&apos;s Workout</span>
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 text-[#1E3A8A] rounded-xl border border-blue-100"><CalendarIcon className="w-5 h-5" /></div>
                    <div>
                      <p className={`${textScale.bodySmall} font-bold text-[#2D2D2D]`}>{dailyActivitiesList.length} scheduled</p>
                      <p className="text-xs text-[#7A7667]">{dailyActivitiesList.filter(a => a.completed).length} completed today</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border-2 border-[#D3CEBE] space-y-2">
                  <span className={`${textScale.small} text-[#7A7667] font-bold uppercase`}>My Active Timer</span>
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl border border-amber-100"><TimerIcon className="w-5 h-5" /></div>
                    <div>
                      <p className={`${textScale.bodySmall} font-bold text-[#2D2D2D]`}>{selectedExercise.name}</p>
                      <p className="text-xs text-[#7A7667]">Ready to start ({selectedExercise.minutes} mins)</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border-2 border-[#D3CEBE] space-y-2">
                  <span className={`${textScale.small} text-[#7A7667] font-bold uppercase`}>Weekly Goal Progress</span>
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100"><Award className="w-5 h-5" /></div>
                    <div>
                      <p className={`${textScale.bodySmall} font-bold text-[#2D2D2D]`}>{progress.aerobicMins} / 150m Aerobic</p>
                      <p className="text-xs text-[#7A7667]">{progress.strengthDays}/2 Strength • {progress.balanceDays}/3 Balance</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Cards */}
              <div className="bg-white rounded-[28px] border-2 border-[#D3CEBE] p-6 space-y-5 shadow-sm">
                <h3 className={`${textScale.h3} text-[#1E3A8A] font-serif`}>Where would you like to go today?</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button onClick={() => setActiveTab('checklist')} className="group text-left p-5 bg-[#FAF7EE] hover:bg-[#F2EDE0] border-2 border-[#D3CEBE] rounded-2xl cursor-pointer transition-all flex flex-col justify-between space-y-4" style={{ minHeight: '160px' }}>
                    <div className="p-3 bg-white border border-[#D3CEBE] rounded-xl text-[#1E3A8A] inline-block"><CalendarIcon className="w-6 h-6" /></div>
                    <div>
                      <h4 className={`${textScale.h4} text-[#1E3A8A] font-serif group-hover:underline`}>My Checklist &rarr;</h4>
                      <p className={`${textScale.small} text-[#5A5A40] mt-1`}>Select a day, view exercises, and tick off items.</p>
                    </div>
                  </button>

                  <button onClick={() => setActiveTab('timer')} className="group text-left p-5 bg-[#FCFAF6] hover:bg-[#F2EDE0] border-2 border-[#D3CEBE] rounded-2xl cursor-pointer transition-all flex flex-col justify-between space-y-4" style={{ minHeight: '160px' }}>
                    <div className="p-3 bg-white border border-[#D3CEBE] rounded-xl text-[#1E3A8A] inline-block"><TimerIcon className="w-6 h-6" /></div>
                    <div>
                      <h4 className={`${textScale.h4} text-[#1E3A8A] font-serif group-hover:underline`}>Active Timer &rarr;</h4>
                      <p className={`${textScale.small} text-[#5A5A40] mt-1`}>Follow exercises with big, visible countdown clocks.</p>
                    </div>
                  </button>

                  <button onClick={() => setActiveTab('progress')} className="group text-left p-5 bg-[#FAF7EE] hover:bg-[#F2EDE0] border-2 border-[#D3CEBE] rounded-2xl cursor-pointer transition-all flex flex-col justify-between space-y-4" style={{ minHeight: '160px' }}>
                    <div className="p-3 bg-white border border-[#D3CEBE] rounded-xl text-[#1E3A8A] inline-block"><Award className="w-6 h-6" /></div>
                    <div>
                      <h4 className={`${textScale.h4} text-[#1E3A8A] font-serif group-hover:underline`}>CDC Progress &rarr;</h4>
                      <p className={`${textScale.small} text-[#5A5A40] mt-1`}>Track your weekly targets against official healthy guidelines.</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Safety guidelines banner */}
              <div className="w-full bg-white rounded-[28px] border-2 border-[#D3CEBE] p-5 space-y-4 shadow-sm flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="text-[#1E3A8A] font-bold text-xs uppercase tracking-wider bg-blue-50 py-1 px-2.5 rounded-md border border-blue-100 inline-block">🛡️ Safe Exercise Protocols</span>
                  <h3 className={`${textScale.h3} text-[#1E3A8A] font-serif`}>Essential Safe-Aging Principles</h3>
                  <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[#2D2D2D] pt-2">
                    <li className="bg-[#FCFAF6] p-4 rounded-xl border border-[#E6E2D3] flex gap-2.5 items-start">
                      <span className="text-xl shrink-0">🛋️</span>
                      <p className={`${textScale.small} leading-relaxed`}><strong>Stable Support:</strong> Keep a heavy, stable chair or wall nearby for physical support during balance steps.</p>
                    </li>
                    <li className="bg-[#FCFAF6] p-4 rounded-xl border border-[#E6E2D3] flex gap-2.5 items-start">
                      <span className="text-xl shrink-0">💧</span>
                      <p className={`${textScale.small} leading-relaxed`}><strong>Stay Hydrated:</strong> Keep a water glass handy and drink before, during, and after routines.</p>
                    </li>
                    <li className="bg-[#FCFAF6] p-4 rounded-xl border border-[#E6E2D3] flex gap-2.5 items-start">
                      <span className="text-xl shrink-0">🛑</span>
                      <p className={`${textScale.small} leading-relaxed`}><strong>Stop on Pain:</strong> Working out should be comfortable. Stop immediately if anything hurts.</p>
                    </li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-[#E6E2D3] flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={() => {
                      if (!window.speechSynthesis) return;
                      if (isSpeaking) { window.speechSynthesis.cancel(); setIsSpeaking(false); return; }
                      const text = "Essential Safe Aging Principles. One: Stable Support. Keep a heavy chair nearby. Two: Stay Hydrated. Drink water before and after. Three: Stop on Pain. Workouts should never hurt.";
                      const u = new SpeechSynthesisUtterance(text);
                      u.rate = 0.8; u.onend = () => setIsSpeaking(false); u.onerror = () => setIsSpeaking(false);
                      setIsSpeaking(true); window.speechSynthesis.speak(u);
                    }}
                    className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold border-2 transition-all cursor-pointer ${isSpeaking ? 'bg-[#D97706] border-[#D97706] text-white animate-pulse' : 'bg-[#FCFAF6] border-[#D3CEBE] text-[#2D2D2D] hover:bg-[#F5F2EB]'}`}
                    style={{ minHeight: '48px' }}
                  >
                    {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-[#1E3A8A]" />}
                    <span className={textScale.btnSmall}>{isSpeaking ? "Pause Voice Guide" : "🔊 Listen to Safety Guidelines"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: DAILY ROUTINE AND CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-6" id="checklist-tab-view">
              <div className="bg-white rounded-[28px] border-2 border-[#D3CEBE] p-4 md:p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#E6E2D3]">
                  <h3 className={`${textScale.h3} text-[#1E3A8A] font-serif`}>Weekly Calendar Row</h3>
                </div>

                <div className="grid grid-cols-7 gap-2" id="weekly-days-grid">
                  {weekDays.map((day) => {
                    const isSelected = selectedDate === day.dateString;
                    return (
                      <button
                        key={day.dateString}
                        onClick={() => setSelectedDate(day.dateString)}
                        className={`flex flex-col items-center justify-center py-4 rounded-xl transition-all cursor-pointer border-2 ${isSelected ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-md ring-4 ring-[#1E3A8A]/10 font-bold' : day.isToday ? 'bg-[#FAF7EE] text-[#1E3A8A] border-2 border-[#1E3A8A]' : 'bg-[#FCFAF6] hover:bg-[#F5F2EB] border-[#D3CEBE] text-[#5A5A40]'}`}
                        style={{ minHeight: '85px' }}
                      >
                        <span className={`${textScale.small} font-bold uppercase block opacity-85`}>{day.dayName.substring(0, 3)}</span>
                        <span className={`font-serif font-black mt-1 ${largerText ? 'text-3xl md:text-4xl' : 'text-xl md:text-2xl'}`}>{day.dayOfMonth}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="bg-[#FCFAF6] p-4 rounded-xl border border-[#D3CEBE] flex flex-col sm:flex-row justify-between items-center mt-4 gap-3">
                  <div>
                    <span className={`${textScale.small} uppercase font-bold text-[#7A7667]`}>Day selected:</span>
                    <p className={`${textScale.h4} text-[#1E3A8A]`}>{selectedDayInfo.dayName}, {selectedDayInfo.monthLabel} {selectedDayInfo.dayOfMonth}</p>
                  </div>
                  <button onClick={() => setShowCustomLogModal(true)} className="flex items-center gap-1.5 py-3 px-5 bg-white border-2 border-[#D3CEBE] hover:bg-[#F5F2EB] text-[#2D2D2D] rounded-xl font-bold text-xs cursor-pointer shadow-sm">
                    <Plus className="w-4 h-4 text-[#1E3A8A]" /> Add Custom Activity
                  </button>
                </div>
              </div>

              {/* RESTORED: SPLIT VIEW LAYOUT WITH EXERCISE PROFILE FILTER CATEGORIES */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Side Column: Filter categories selector */}
                <div className="lg:col-span-4 bg-white rounded-[28px] border-2 border-[#D3CEBE] p-4 md:p-5 space-y-4 shadow-sm">
                  <h4 className={`${textScale.h4} text-[#1E3A8A] font-serif flex items-center gap-2 border-b border-[#E6E2D3] pb-2`}>
                    <Activity className="w-5 h-5" />
                    <span>Workout Filters</span>
                  </h4>
                  <p className={`${textScale.small} text-[#7A7667]`}>Select a profile target category below to filter down your active task list:</p>
                  
                  <div className="flex flex-col gap-2">
                    {(['all', 'aerobic', 'strength', 'balance', 'stretch'] as const).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategoryFilter(cat)}
                        className={`w-full text-left py-3 px-4 rounded-xl border-2 transition-all font-bold flex items-center justify-between cursor-pointer ${selectedCategoryFilter === cat ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-sm' : 'bg-[#FCFAF6] text-[#2D2D2D] border-[#D3CEBE] hover:bg-[#F5F2EB]'}`}
                      >
                        <span className="capitalize">{cat} Exercises</span>
                        <ChevronRight className="w-4 h-4 opacity-70" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right Side Column: Main checklist cards row */}
                <div className="lg:col-span-8 bg-white rounded-[28px] border-2 border-[#D3CEBE] p-4 md:p-6 shadow-sm">
                  <h3 className={`${textScale.h3} text-[#1E3A8A] flex items-center gap-2 border-b border-[#E6E2D3] pb-3 mb-4`}>
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    <span>Exercise Routine Checklist</span>
                  </h3>

                  {dailyActivitiesList.length === 0 ? (
                    <div className="text-center py-10 text-[#7A7667] bg-[#FCFAF6] rounded-2xl border-2 border-dashed border-[#D3CEBE]">
                      <p className={textScale.body}>No routines match this category selector filter.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="routine-checklist-grid">
                      {dailyActivitiesList.map((activity) => {
                        const matchedDbEx = EXERCISES_DB.find(e => e.id === activity.exerciseId || e.name === activity.name);
                        const isSelected = selectedExercise.name === activity.name;

                        return (
                          <div key={activity.id} className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${isSelected ? 'bg-[#FAF7EE] border-[#1E3A8A] ring-4 ring-[#1E3A8A]/10' : 'bg-white border-[#D3CEBE] hover:bg-[#FCFAF6]'}`}>
                            <div className="flex-1 cursor-pointer pr-4 min-w-0" onClick={() => { if (matchedDbEx) { handleSelectExercise(matchedDbEx); setActiveTab('timer'); } }}>
                              <span className={`${textScale.small} font-bold text-[#7A7667] uppercase`}>{activity.category}</span>
                              <h4 className={`${textScale.h4} text-[#2D2D2D] truncate font-medium`}>{activity.name}</h4>
                              <p className={`${textScale.small} text-[#1E3A8A] font-semibold mt-0.5`}>⏱️ {activity.minutes} mins • Open Timer &rarr;</p>
                            </div>

                            <button
                              onClick={() => handleToggleActivityCompletion(activity)}
                              className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all cursor-pointer ${activity.completed ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-[#FCFAF6] border-[#D3CEBE] text-[#1E3A8A]'}`}
                            >
                              {activity.completed ? <CheckCircle2 className="w-7 h-7" /> : <div className="w-5 h-5 rounded bg-white border-2 border-[#D3CEBE]" />}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: ACTIVE TIMER COMPANION VIEW */}
          {activeTab === 'timer' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="timer-tab-view">
              <div className="lg:col-span-6 bg-white rounded-[28px] border-2 border-[#D3CEBE] p-5 md:p-6 space-y-6 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#E6E2D3] pb-4 gap-4">
                  <div>
                    <span className={`${textScale.small} font-bold text-[#7A7667] uppercase block mb-0.5`}>Active Focus:</span>
                    <h2 className={`${textScale.h2} text-[#1E3A8A]`}>{selectedExercise.name}</h2>
                  </div>

                  <button
                    onClick={() => handleSpeakInstructions(selectedExercise)}
                    className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold border-2 transition-all cursor-pointer ${isSpeaking ? 'bg-[#D97706] border-[#D97706] text-white animate-pulse' : 'bg-[#FCFAF6] border-[#D3CEBE] text-[#2D2D2D] hover:bg-[#F5F2EB]'}`}
                    style={{ minHeight: '48px' }}
                  >
                    {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-[#1E3A8A]" />}
                    <span className={textScale.btnSmall}>{isSpeaking ? "Pause Voice" : "🔊 Hear Guide"}</span>
                  </button>
                </div>

                <div className={`${textScale.body} text-[#2D2D2D] bg-[#FCFAF6] p-5 rounded-2xl border-2 border-[#E6E2D3]`}>
                  <p className="leading-relaxed font-medium">{selectedExercise.description}</p>
                </div>

                <div className="space-y-4">
                  <h3 className={`${textScale.h4} text-[#1E3A8A] flex items-center gap-2 border-b pb-2`}><BookOpen className="w-5 h-5" /><span>How to perform safely:</span></h3>
                  <ol className="space-y-3">
                    {selectedExercise.instructions.map((step, idx) => (
                      <li key={idx} className="flex gap-4 items-start">
                        <span className="w-9 h-9 rounded-full bg-[#1E3A8A]/10 text-[#1E3A8A] font-bold flex items-center justify-center shrink-0 border border-[#1E3A8A]/10">{idx + 1}</span>
                        <p className={`${textScale.bodySmall} text-[#2D2D2D] pt-1 leading-relaxed`}>{step}</p>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="bg-rose-50 border-2 border-rose-200 p-4 rounded-xl flex gap-3 items-start">
                  <Info className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className={`${textScale.small} font-bold text-rose-950`}>Elderly Safety First:</h4>
                    <p className={`${textScale.small} text-rose-900`}>{selectedExercise.safetyTip}</p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 bg-[#1E3A8A] text-white rounded-[28px] border-2 border-[#1E3A8A] p-5 md:p-6 flex flex-col justify-between shadow-[6px_6px_0px_0px_rgba(30,58,138,0.2)] relative">
                <div className="flex justify-between items-center pb-4 border-b border-white/10 mb-6">
                  <div className="flex items-center gap-2">
                    <TimerIcon className="w-5 h-5 text-white/80" />
                    <h3 className={`${textScale.h3} text-white`}>Exercise Companion Timer</h3>
                  </div>
                  <span className={`${textScale.small} bg-white/10 px-3 py-1 rounded-full font-bold text-white`}>Target: {selectedExercise.minutes} min</span>
                </div>

                <div className="text-center py-6">
                  <div className={`${textScale.timerText} tracking-wider py-5 px-6 bg-white/10 rounded-2xl border border-white/20 inline-block text-white`}>
                    {formatTimerDisplay(timerSecondsLeft)}
                  </div>
                  <p className={`${textScale.small} text-white/75 mt-3 font-bold uppercase tracking-wider`}>Minutes : Seconds Remaining</p>
                </div>

                <div className="space-y-4">
                  <p className={`${textScale.small} text-center font-bold text-white/90 uppercase tracking-widest`}>Adjust Time / Presets</p>
                  <div className="flex justify-center gap-2 flex-wrap">
                    {[1, 5, 10, 15, 30].map((mins) => {
                      const isCurrent = (timerInitialSeconds === mins * 60);
                      return (
                        <button key={mins} onClick={() => handleSetTimerPreset(mins)} className={`py-2 px-3.5 rounded-lg border text-sm transition-all font-bold cursor-pointer ${isCurrent ? 'bg-white border-white text-[#1E3A8A] shadow-md' : 'bg-white/15 border-white/10 text-white'}`}>
                          {mins} min
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex gap-2 w-full max-w-xs mx-auto">
                    <button onClick={() => handleAdjustTimer(-1)} className="flex-1 py-3 bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl text-white font-bold text-sm cursor-pointer">➖ 1 Min</button>
                    <button onClick={() => handleAdjustTimer(1)} className="flex-1 py-3 bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl text-white font-bold text-sm cursor-pointer">➕ 1 Min</button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-8">
                  <button onClick={() => setIsTimerRunning(!isTimerRunning)} className={`flex items-center justify-center gap-2.5 py-4.5 px-4 rounded-xl font-bold transition-all cursor-pointer text-lg ${isTimerRunning ? 'bg-[#D97706] text-white' : 'bg-white text-[#1E3A8A]'}`}>
                    {isTimerRunning ? <><Pause className="w-5 h-5 fill-current" /><span>PAUSE</span></> : <><Play className="w-5 h-5 fill-current" /><span>START</span></>}
                  </button>
                  <button onClick={() => { setIsTimerRunning(false); setTimerSecondsLeft(timerInitialSeconds); }} className="flex items-center justify-center gap-2 py-4.5 px-4 bg-transparent hover:bg-white/10 text-white font-bold rounded-xl border-2 border-white transition-all cursor-pointer text-lg">
                    <RotateCcw className="w-5 h-5" /><span>RESET</span>
                  </button>
                </div>

                <AnimatePresence>
                  {showCompletionPrompt && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute inset-0 bg-[#1E3A8A]/98 rounded-[28px] flex flex-col items-center justify-center p-6 text-center text-white z-10">
                      <div className="space-y-4 max-w-sm">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto"><Award className="w-10 h-10" /></div>
                        <div>
                          <h4 className={`${textScale.h2} text-white font-serif`}>Excellent Job! 🌟</h4>
                          <p className={`${textScale.bodySmall} text-white/90 mt-1`}>You completed {Math.round(timerInitialSeconds / 60)} minutes of <strong>{selectedExercise.name}</strong>.</p>
                        </div>
                        <button onClick={() => { setShowCompletionPrompt(false); handleLogActivity(selectedExercise.name, Math.round(timerInitialSeconds / 60), selectedExercise.category); setTimerSecondsLeft(timerInitialSeconds); }} className="w-full py-3.5 bg-emerald-600 text-white font-bold rounded-xl shadow-md cursor-pointer transition-all text-base">✅ Yes, Save to My Log</button>
                        <button onClick={() => { setShowCompletionPrompt(false); setTimerSecondsLeft(timerInitialSeconds); }} className="w-full py-2 text-white border border-white/30 rounded-xl cursor-pointer text-sm">Skip Logging</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* TAB 3: WEEKLY PROGRESS & LOG HISTORY */}
          {activeTab === 'progress' && (
            <div className="space-y-6" id="progress-tab-view">
              <div className="bg-white rounded-[28px] border-2 border-[#D3CEBE] p-5 md:p-6 shadow-sm">
                <div className="space-y-1 pb-3 border-b border-[#E6E2D3] mb-4">
                  <span className={`${textScale.small} bg-[#1E3A8A]/10 text-[#1E3A8A] font-bold text-xs uppercase px-2 py-0.5 rounded-md`}>Official CDC Guidelines</span>
                  <h3 className={`${textScale.h3} text-[#1E3A8A] font-serif`}>My CDC Weekly Target Completion</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-[#FCFAF6] p-4 rounded-xl border-2 border-[#D3CEBE] flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#1E3A8A]/10 text-[#1E3A8A] flex items-center justify-center font-black border border-[#1E3A8A]/20">{Math.min(100, Math.round((progress.aerobicMins / progress.aerobicTarget) * 100))}%</div>
                    <div>
                      <span className={`${textScale.small} block text-[#7A7667] font-bold uppercase`}>Aerobic Minutes</span>
                      <span className={`${textScale.h4} text-[#2D2D2D]`}>{progress.aerobicMins} / 150m</span>
                      {progress.isAerobicMet ? <span className={`block ${textScale.small} text-emerald-700 font-bold mt-0.5`}>🎉 Goal Met!</span> : <span className={`block ${textScale.small} text-[#7A7667] font-semibold mt-0.5`}>{150 - progress.aerobicMins}m left</span>}
                    </div>
                  </div>

                  <div className="bg-[#FCFAF6] p-4 rounded-xl border-2 border-[#D3CEBE] flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#1E3A8A]/10 text-[#1E3A8A] flex items-center justify-center font-black border border-[#1E3A8A]/20">{progress.strengthDays >= 2 ? "100%" : progress.strengthDays === 1 ? "50%" : "0%"}</div>
                    <div>
                      <span className={`${textScale.small} block text-[#7A7667] font-bold uppercase`}>Strength Days</span>
                      <span className={`${textScale.h4} text-[#2D2D2D]`}>{progress.strengthDays} / 2 days</span>
                      {progress.isStrengthMet ? <span className={`block ${textScale.small} text-emerald-700 font-bold mt-0.5`}>🎉 Goal Met!</span> : <span className={`block ${textScale.small} text-[#7A7667] font-semibold mt-0.5`}>{2 - progress.strengthDays} days left</span>}
                    </div>
                  </div>

                  <div className="bg-[#FCFAF6] p-4 rounded-xl border-2 border-[#D3CEBE] flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#1E3A8A]/10 text-[#1E3A8A] flex items-center justify-center font-black border border-[#1E3A8A]/20">{progress.balanceDays >= 3 ? "100%" : Math.round((progress.balanceDays / 3) * 100)}%</div>
                    <div>
                      <span className={`${textScale.small} block text-[#7A7667] font-bold uppercase`}>Balance Days</span>
                      <span className={`${textScale.h4} text-[#2D2D2D]`}>{progress.balanceDays} / 3 days</span>
                      {progress.isBalanceMet ? <span className={`block ${textScale.small} text-emerald-700 font-bold mt-0.5`}>🎉 Goal Met!</span> : <span className={`block ${textScale.small} text-[#7A7667] font-semibold mt-0.5`}>{3 - progress.balanceDays} days left</span>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Completed logs feed row */}
                <div className="lg:col-span-7 bg-white rounded-[28px] border-2 border-[#D3CEBE] p-5 md:p-6 space-y-4 shadow-sm" id="completed-logs-panel">
                  <div className="flex justify-between items-center border-b border-[#E6E2D3] pb-3 mb-2">
                    <h3 className={`${textScale.h3} text-[#1E3A8A] flex items-center gap-2 font-serif`}><Award className="w-5 h-5" /><span>Completed Workouts Feed</span></h3>
                    <span className="bg-[#FCFAF6] border border-[#D3CEBE] text-[#5A5A40] text-xs font-bold py-1 px-3 rounded-full">{completedLogs.length} Workouts</span>
                  </div>

                  {completedLogs.length === 0 ? (
                    <div className="text-center py-12 text-[#7A7667] bg-[#FCFAF6] rounded-2xl border-2 border-dashed border-[#D3CEBE]">
                      <p className={textScale.body}>No workouts logged yet for this week.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1" id="completed-logs-scrollbox">
                      {completedLogs.map((log) => {
                        const dateObj = weekDays.find(d => d.dateString === log.dateString);
                        return (
                          <div key={log.id} className="flex items-center justify-between p-3.5 bg-[#FCFAF6]/70 border-2 border-[#E6E2D3] rounded-xl">
                            <div>
                              <h4 className={`${textScale.bodySmall} font-bold text-[#2D2D2D]`}>{log.name}</h4>
                              <p className={`${textScale.small} text-[#7A7667] font-semibold`}>{dateObj ? dateObj.dayName : "Other"} • {log.minutes} mins • {log.timestamp}</p>
                            </div>
                            <button onClick={() => handleRemoveLog(log.id)} className="p-3 text-[#7A7667] hover:text-rose-700 bg-white border border-[#D3CEBE] rounded-lg cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="pt-2">
                    <button onClick={handleResetAllData} className="py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg border border-rose-200 cursor-pointer text-xs">Clear Log & Start Fresh Week</button>
                  </div>
                </div>

                {/* RESTORED: MANUAL QUICK-LOG WORKOUT FORM WIDGET PANEL */}
                <div className="lg:col-span-5 bg-white border-2 border-[#D3CEBE] rounded-[28px] p-5 md:p-6 space-y-4 shadow-sm">
                  <h4 className={`${textScale.h4} text-[#1E3A8A] font-serif flex items-center gap-2 border-b border-[#E6E2D3] pb-2`}>
                    <Zap className="w-5 h-5" />
                    <span>Manual Quick Logger</span>
                  </h4>
                  <p className={`${textScale.small} text-[#5A5A40]`}>
                    Did an activity outside our system? Log it here manually to credit your metrics immediately:
                  </p>

                  <form onSubmit={handleManualQuickLogSubmit} className="space-y-3 text-[#2D2D2D]">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-[#7A7667] block mb-1">Activity Label / Name:</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g., Gardening, Slow Swimming" 
                        value={manualWorkoutName}
                        onChange={(e) => setManualWorkoutName(e.target.value)}
                        className="w-full border-2 border-[#D3CEBE] p-2.5 rounded-xl text-sm focus:outline-none focus:border-[#1E3A8A]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-[#7A7667] block mb-1">Minutes:</label>
                        <input 
                          type="number" 
                          required 
                          min={1} 
                          value={manualWorkoutDuration}
                          onChange={(e) => setManualWorkoutDuration(Number(e.target.value) || 1)}
                          className="w-full border-2 border-[#D3CEBE] p-2.5 rounded-xl text-sm focus:outline-none focus:border-[#1E3A8A]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-[#7A7667] block mb-1">Category Type:</label>
                        <select 
                          value={manualWorkoutCategory} 
                          onChange={(e) => setManualWorkoutCategory(e.target.value as any)}
                          className="w-full border-2 border-[#D3CEBE] p-2.5 rounded-xl bg-white text-sm focus:outline-none focus:border-[#1E3A8A]"
                        >
                          <option value="aerobic">Aerobic</option>
                          <option value="strength">Strength</option>
                          <option value="balance">Balance</option>
                          <option value="stretch">Stretch</option>
                        </select>
                      </div>
                    </div>

                    <button type="submit" className="w-full text-center py-3 bg-[#1E3A8A] hover:bg-[#1A3073] text-white rounded-xl font-bold text-sm cursor-pointer transition-all">
                      ⚡ Save Workout Directly
                    </button>
                  </form>
                </div>

              </div>
            </div>
          )}

        </main>
      </div>

      {/* FOOTER */}
      <footer className="text-center py-8 text-[#7A7667] border-t-2 border-[#E6E2D3]/60 max-w-7xl w-full mx-auto mt-12 bg-white rounded-t-3xl p-4 border-l-2 border-r-2 border-[#D3CEBE]">
        <p className={`${textScale.bodySmall} font-serif font-semibold text-[#1E3A8A]`}>Senior Fitness Scheduler & Tracker</p>
        <p className="text-[10px] text-[#7A7667]/75 tracking-wider mt-0.5">Designed specifically for older adults with highly visible layouts and clear text controls</p>
      </footer>

      {/* MODAL: Log Custom Scheduled Activity */}
      <AnimatePresence>
        {showCustomLogModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto" id="custom-schedule-modal">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[32px] border-2 border-[#D3CEBE] p-6 md:p-8 max-w-lg w-full shadow-2xl relative text-[#2D2D2D]">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className={`${textScale.h3} text-[#1E3A8A] font-serif`}>Add Scheduled Activity</h3>
                  <p className={`${textScale.small} text-[#7A7667] mt-1`}>Choose an exercise to practice on <strong>{selectedDayInfo.dayName}</strong>.</p>
                </div>
                <button onClick={() => setShowCustomLogModal(false)} className="p-2 text-gray-500 font-bold text-lg cursor-pointer">✕</button>
              </div>

              <form onSubmit={handleAddCustomScheduleItem} className="space-y-6">
                <div className="space-y-2">
                  <label className={`${textScale.small} block font-bold uppercase text-[#1E3A8A]`}>Select Activity Type:</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto p-2 border-2 border-[#E6E2D3] rounded-2xl bg-[#FCFAF6]">
                    {EXERCISES_DB.map((ex) => (
                      <button
                        type="button" key={ex.id} onClick={() => setCustomLogExerciseId(ex.id)}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${customLogExerciseId === ex.id ? 'bg-white border-[#1E3A8A] ring-2 ring-[#1E3A8A]/20 font-bold' : 'bg-white border-[#D3CEBE] hover:bg-[#F5F2EB]'}`}
                      >
                        <span className={`${textScale.small} font-bold text-[#2D2D2D]`}>{ex.name}</span>
                        <span className="text-[10px] uppercase font-bold text-[#7A7667] mt-1">{ex.category}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={`${textScale.small} block font-bold uppercase text-[#1E3A8A]`}>Duration (Minutes):</label>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setCustomLogMinutes(prev => Math.max(1, prev - 5))} className="p-3 bg-white border-2 border-[#D3CEBE] rounded-xl font-bold text-lg cursor-pointer w-14">-5</button>
                    <input
                      type="number" required min={1} max={180} value={customLogMinutes}
                      onChange={(e) => setCustomLogMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                      className="flex-1 py-3 px-4 rounded-xl border-2 border-[#D3CEBE] text-center font-bold text-xl text-[#2D2D2D]"
                    />
                    <button type="button" onClick={() => setCustomLogMinutes(prev => Math.min(180, prev + 5))} className="p-3 bg-white border-2 border-[#D3CEBE] rounded-xl font-bold text-lg cursor-pointer w-14">+5</button>
                  </div>
                </div>

                <button type="submit" className="w-full py-4 bg-[#1E3A8A] text-white font-bold text-lg rounded-2xl cursor-pointer" style={{ minHeight: '56px' }}>Save to Day&apos;s Schedule!</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}