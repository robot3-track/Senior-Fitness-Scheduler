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
  UserCheck
} from 'lucide-react';

// Define structures for our application
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
    safetyTip: 'Never roll your neck in full complete circles. Only stretch to a comfortable tightness—never pain.'
  }
];

// Student Touch: High contrast themes mapping for distinct CDC categorizations
const CATEGORY_THEMES = {
  aerobic: {
    bg: 'bg-blue-50 border-blue-400 text-blue-950',
    badge: 'bg-blue-700 text-white',
    icon: '🔵'
  },
  strength: {
    bg: 'bg-orange-50 border-orange-400 text-orange-950',
    badge: 'bg-orange-700 text-white',
    icon: '🟠'
  },
  balance: {
    bg: 'bg-emerald-50 border-emerald-400 text-emerald-950',
    badge: 'bg-emerald-700 text-white',
    icon: '🟢'
  },
  stretch: {
    bg: 'bg-purple-50 border-purple-400 text-purple-950',
    badge: 'bg-purple-700 text-white',
    icon: '🟣'
  }
};

const accessibleFocus = "focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-500 focus-visible:border-[#1E3A8A]";

// Helper to generate the current week's dates dynamically based on local time
function getWeekDates() {
  const today = new Date();
  const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday, etc.
  
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

// Default schedule matching CDC recommendations
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

  // Student Touch: Interactive step tracking so seniors don't lose place mid-exercise
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  
  const [completedLogs, setCompletedLogs] = useState<CompletedLog[]>(() => {
    if (typeof window !== 'undefined') {
      const email = localStorage.getItem('senior_fitness_email');
      if (email) {
        const emailKey = email.toLowerCase().trim();
        const savedLogs = localStorage.getItem(`senior_fitness_completed_logs_${emailKey}`);
        if (savedLogs) {
          try {
            return JSON.parse(savedLogs);
          } catch (e) {}
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
          try {
            return JSON.parse(savedCustomSchedule);
          } catch (e) {}
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

  // Clear step tracker when user shifts to a new activity
  useEffect(() => {
    setCompletedSteps([]);
  }, [selectedExercise]);

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
            
            <h1 className={`${textScale.title} text-[#1E3A8A] leading-tight`}>
              Senior Fitness Scheduler
            </h1>
            <p className={`${textScale.subtitle} text-[#4A473E] max-w-lg mx-auto`}>
              A friendly, easy-to-use tool designed for older adults to follow daily physical routines, use simple timers, and stay active safely.
            </p>
          </div>

          <form 
            onSubmit={(e) => handleSignIn(e)}
            className="space-y-6 bg-[#FCFAF6] p-6 rounded-2xl border-2 border-[#E6E2D3] max-w-md mx-auto"
            id="email-signin-form"
          >
            <div className="space-y-2">
              <label htmlFor="user-email-input" className={`${textScale.label} block text-[#4A473E]`}>
                Enter your Email to sign in:
              </label>
              <input
                id="user-email-input"
                type="email"
                required
                placeholder="example@email.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className={`w-full py-3.5 px-4 rounded-xl border-2 border-[#D3CEBE] bg-white text-[#2D2D2D] font-medium ${accessibleFocus} ${textScale.body}`}
              />
              <p className={`${textScale.small} text-[#4A473E] leading-relaxed`}>
                No password required! We use your email to safely separate your exercise checklist and history so multiple family members can use this device.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                className={`flex-1 bg-[#1E3A8A] hover:bg-[#1A3073] text-white font-bold rounded-xl shadow-sm cursor-pointer transition-all active:scale-95 text-center ${accessibleFocus} ${textScale.btn}`}
                style={{ minHeight: '52px' }}
              >
                Sign In
              </button>
              
              <button
                type="button"
                onClick={() => handleSignIn(undefined, 'guest@seniorfitness.org')}
                className={`bg-white border-2 border-[#D3CEBE] hover:bg-[#F5F2EB] text-[#2D2D2D] font-bold rounded-xl cursor-pointer transition-all active:scale-95 text-center ${accessibleFocus} ${textScale.btn}`}
                style={{ minHeight: '52px' }}
              >
                Enter as Guest
              </button>
            </div>
          </form>

          <div className="bg-[#FAF7EE] p-5 rounded-2xl border-2 border-[#D3CEBE] flex gap-4 items-start max-w-md mx-auto">
            <Info className="w-5 h-5 text-[#1E3A8A] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className={`${textScale.small} font-bold text-[#1E3A8A]`}>Official Healthy Aging Target:</h4>
              <p className={`${textScale.small} text-[#4A473E] leading-relaxed`}>
                Aligns with the US Centers for Disease Control (CDC) recommendation of 150 aerobic minutes, 2 strength days, and 3 balance days per week.
              </p>
            </div>
          </div>

        </div>

        <footer className="text-center py-6 text-[#4A473E] border-t border-[#E6E2D3] max-w-2xl w-full mx-auto mt-6">
          <p className={`${textScale.small} font-medium`}>
            Authorized Senior Physical Activity Guidelines Portal
          </p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFAF6] p-3 md:p-6 text-[#2D2D2D] flex flex-col justify-between" id="app-root-container">
      
      <div className="max-w-7xl mx-auto w-full space-y-6">
        
        <header className="bg-white rounded-[24px] p-4 md:p-6 border-2 border-[#D3CEBE] shadow-[4px_4px_0px_0px_rgba(90,90,64,0.15)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4" id="app-main-header">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[#1E3A8A]/10 text-[#1E3A8A] font-bold text-xs uppercase px-2.5 py-1 rounded-full border border-[#1E3A8A]/20">CDC Standard Exercises</span>
              <span className="text-[#D3CEBE]">•</span>
              <span className="text-xs text-[#4A473E] font-semibold flex items-center gap-1">
                <UserCheck className="w-3 h-3 text-[#1E3A8A]" /> Profile: <strong className="text-[#1E3A8A]">{userEmail}</strong>
              </span>
            </div>
            <h1 className={`${textScale.h2} font-serif text-[#1E3A8A]`} id="main-title">
              Senior Fitness Scheduler
            </h1>
          </div>

          <div className="flex flex-wrap gap-2.5 w-full md:w-auto" id="header-controls">
            <button
              onClick={() => setLargerText(!largerText)}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 transition-all font-bold cursor-pointer ${accessibleFocus} ${
                largerText
                  ? 'bg-[#1E3A8A] border-[#1E3A8A] text-white hover:bg-[#1A3073]'
                  : 'bg-[#F9F8F4] border-[#D3CEBE] text-[#2D2D2D] hover:bg-[#F5F2EB]'
              }`}
              style={{ minHeight: '48px' }}
              id="text-size-toggle-btn"
            >
              <Accessibility className="w-5 h-5 shrink-0" />
              <span className={textScale.btnSmall}>{largerText ? '🔠 Regular Text' : '🔠 Make Text BIGGER'}</span>
            </button>

            <button
              onClick={handleSignOut}
              className={`flex items-center gap-2 px-4 py-3 bg-white hover:bg-[#F9F8F4] text-[#4A473E] border-2 border-[#D3CEBE] rounded-xl font-bold transition-all cursor-pointer ${accessibleFocus}`}
              style={{ minHeight: '48px' }}
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span className={textScale.btnSmall}>Switch User</span>
            </button>
          </div>
        </header>

        <div className="grid grid-cols-2 md:flex md:flex-row gap-2.5 w-full bg-white p-2.5 rounded-[24px] border-2 border-[#D3CEBE] shadow-[4px_4px_0px_0px_rgba(90,90,64,0.15)]" id="navigation-tabs-bar">
          <button
            onClick={() => setActiveTab('welcome')}
            className={`flex items-center justify-center gap-2 rounded-xl cursor-pointer transition-all border-2 py-2.5 px-3.5 ${accessibleFocus} ${textScale.tab} ${
              activeTab === 'welcome'
                ? 'bg-[#1E3A8A] border-[#1E3A8A] text-white shadow-xs font-bold'
                : 'bg-transparent border-transparent text-[#1E3A8A] hover:bg-[#FCFAF6] hover:border-[#D3CEBE] font-medium'
            }`}
          >
            <Heart className="w-4 h-4 shrink-0" />
            <span>🏡 Welcome Hub</span>
          </button>

          <button
            onClick={() => setActiveTab('checklist')}
            className={`flex items-center justify-center gap-2 rounded-xl cursor-pointer transition-all border-2 py-2.5 px-3.5 ${accessibleFocus} ${textScale.tab} ${
              activeTab === 'checklist'
                ? 'bg-[#1E3A8A] border-[#1E3A8A] text-white shadow-xs font-bold'
                : 'bg-transparent border-transparent text-[#1E3A8A] hover:bg-[#FCFAF6] hover:border-[#D3CEBE] font-medium'
            }`}
          >
            <CalendarIcon className="w-4 h-4 shrink-0" />
            <span>📅 Checklist</span>
          </button>
          
          <button
            onClick={() => setActiveTab('timer')}
            className={`flex items-center justify-center gap-2 rounded-xl cursor-pointer transition-all border-2 py-2.5 px-3.5 ${accessibleFocus} ${textScale.tab} ${
              activeTab === 'timer'
                ? 'bg-[#1E3A8A] border-[#1E3A8A] text-white shadow-xs font-bold'
                : 'bg-transparent border-transparent text-[#1E3A8A] hover:bg-[#FCFAF6] hover:border-[#D3CEBE] font-medium'
            }`}
          >
            <TimerIcon className="w-4 h-4 shrink-0" />
            <span>⏱️ Active Timer</span>
          </button>
          
          <button
            onClick={() => setActiveTab('progress')}
            className={`flex items-center justify-center gap-2 rounded-xl cursor-pointer transition-all border-2 py-2.5 px-3.5 ${accessibleFocus} ${textScale.tab} ${
              activeTab === 'progress'
                ? 'bg-[#1E3A8A] border-[#1E3A8A] text-white shadow-xs font-bold'
                : 'bg-transparent border-transparent text-[#1E3A8A] hover:bg-[#FCFAF6] hover:border-[#D3CEBE] font-medium'
            }`}
          >
            <Award className="w-4 h-4 shrink-0" />
            <span>📊 CDC Progress</span>
          </button>
        </div>

        <main className="w-full" id="active-tab-content">
          
          {/* TAB 0: WELCOME HUB PORTAL */}
          {activeTab === 'welcome' && (
            <div className="space-y-6 animate-fadeIn" id="welcome-tab-view">
              <div className="bg-gradient-to-r from-[#1E3A8A] to-[#1E40AF] text-white rounded-[32px] p-6 md:p-8 border-2 border-[#1E3A8A] shadow-[6px_6px_0px_0px_rgba(30,58,138,0.2)]">
                <div className="max-w-3xl space-y-3">
                  <h2 className={`${textScale.title} font-serif text-white`}>
                    Welcome back! Let&apos;s Stay Active & Balanced.
                  </h2>
                  <div className="pt-2 flex flex-wrap items-center gap-4">
                    <span className={`${textScale.small} text-blue-100 font-semibold bg-white/10 px-3 py-1 rounded-md border border-white/10`}>
                      👤 Profile: <strong>{userEmail}</strong>
                    </span>
                    <span className={`${textScale.small} text-blue-100 font-semibold bg-white/10 px-3 py-1 rounded-md border border-white/10`}>
                      📅 {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white p-5 rounded-2xl border-2 border-[#D3CEBE] space-y-2">
                  <span className={`${textScale.small} text-[#4A473E] font-bold uppercase`}>Today&apos;s Workout</span>
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 text-[#1E3A8A] rounded-xl border border-blue-200">
                      <CalendarIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={`${textScale.bodySmall} font-bold text-[#2D2D2D]`}>
                        {dailyActivitiesList.length} scheduled
                      </p>
                      <p className="text-xs text-[#4A473E] font-semibold">
                        {dailyActivitiesList.filter(a => a.completed).length} completed today
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border-2 border-[#D3CEBE] space-y-2">
                  <span className={`${textScale.small} text-[#4A473E] font-bold uppercase`}>My Active Timer</span>
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-50 text-amber-800 rounded-xl border border-amber-200">
                      <TimerIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={`${textScale.bodySmall} font-bold text-[#2D2D2D]`}>
                        {selectedExercise.name}
                      </p>
                      <p className="text-xs text-[#4A473E] font-semibold">
                        Ready to start ({selectedExercise.minutes} mins)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border-2 border-[#D3CEBE] space-y-2">
                  <span className={`${textScale.small} text-[#4A473E] font-bold uppercase`}>Weekly Goal Progress</span>
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={`${textScale.bodySmall} font-bold text-[#2D2D2D]`}>
                        {progress.aerobicMins} / 150m Aerobic
                      </p>
                      <p className="text-xs text-[#4A473E] font-semibold">
                        {progress.strengthDays}/2 Strength • {progress.balanceDays}/3 Balance
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[28px] border-2 border-[#D3CEBE] p-6 space-y-5 shadow-sm">
                <div>
                  <h3 className={`${textScale.h3} text-[#1E3A8A] font-serif`}>Where would you like to go today?</h3>
                  <p className={`${textScale.bodySmall} text-[#4A473E] mt-0.5`}>
                    Tap any card below or select from the tabs at the top of the page.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button 
                    onClick={() => setActiveTab('checklist')} 
                    className={`group text-left p-5 bg-[#FAF7EE] hover:bg-[#F2EDE0] border-2 border-[#D3CEBE] rounded-2xl cursor-pointer transition-all active:scale-98 flex flex-col justify-between space-y-4 ${accessibleFocus}`}
                    style={{ minHeight: '160px' }}
                  >
                    <div className="p-3 bg-white border-2 border-[#D3CEBE] rounded-xl text-[#1E3A8A] inline-block">
                      <CalendarIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className={`${textScale.h4} text-[#1E3A8A] font-serif group-hover:underline flex items-center gap-1`}>
                        My Checklist &rarr;
                      </h4>
                      <p className={`${textScale.small} text-[#4A473E] mt-1 leading-relaxed`}>
                        Select a day of the week, view your daily exercises, and mark tasks as complete.
                      </p>
                    </div>
                  </button>

                  <button 
                    onClick={() => setActiveTab('timer')} 
                    className={`group text-left p-5 bg-[#FCFAF6] hover:bg-[#F2EDE0] border-2 border-[#D3CEBE] rounded-2xl cursor-pointer transition-all active:scale-98 flex flex-col justify-between space-y-4 ${accessibleFocus}`}
                    style={{ minHeight: '160px' }}
                  >
                    <div className="p-3 bg-white border-2 border-[#D3CEBE] rounded-xl text-[#1E3A8A] inline-block">
                      <TimerIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className={`${textScale.h4} text-[#1E3A8A] font-serif group-hover:underline flex items-center gap-1`}>
                        Active Timer &rarr;
                      </h4>
                      <p className={`${textScale.small} text-[#4A473E] mt-1 leading-relaxed`}>
                        Follow the current exercise with simple safe guides and a large, clear timer clock.
                      </p>
                    </div>
                  </button>

                  <button 
                    onClick={() => setActiveTab('progress')} 
                    className={`group text-left p-5 bg-[#FAF7EE] hover:bg-[#F2EDE0] border-2 border-[#D3CEBE] rounded-2xl cursor-pointer transition-all active:scale-98 flex flex-col justify-between space-y-4 ${accessibleFocus}`}
                    style={{ minHeight: '160px' }}
                  >
                    <div className="p-3 bg-white border-2 border-[#D3CEBE] rounded-xl text-[#1E3A8A] inline-block">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className={`${textScale.h4} text-[#1E3A8A] font-serif group-hover:underline flex items-center gap-1`}>
                        CDC Progress &rarr;
                      </h4>
                      <p className={`${textScale.small} text-[#4A473E] mt-1 leading-relaxed`}>
                        Track your weekly active minutes and goals.
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: CALENDAR CHECKLIST TAB */}
          {activeTab === 'checklist' && (
            <div className="space-y-6 animate-fadeIn" id="checklist-tab-view">
              
              {/* Geometric Grid for Week Navigation */}
              <div className="bg-white border-2 border-[#D3CEBE] p-4 rounded-2xl shadow-sm">
                <p className={`${textScale.label} text-[#4A473E] mb-3`}>📅 Choose a Day to view Routine:</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
                  {weekDays.map((day) => {
                    const isSelected = selectedDate === day.dateString;
                    return (
                      <button
                        key={day.dateString}
                        onClick={() => setSelectedDate(day.dateString)}
                        className={`p-3 rounded-xl border-2 text-center transition-all flex flex-col items-center justify-center cursor-pointer ${accessibleFocus} ${
                          isSelected
                            ? 'bg-[#1E3A8A] border-[#1E3A8A] text-white shadow-xs'
                            : 'bg-[#FCFAF6] border-[#D3CEBE] hover:bg-[#F5F2EB] text-[#2D2D2D]'
                        }`}
                      >
                        <span className="text-xs font-bold uppercase tracking-tight opacity-80">{day.dayName.substring(0,3)}</span>
                        <span className="text-xl font-bold mt-0.5">{day.dayOfMonth}</span>
                        {day.isToday && (
                          <span className={`text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded-md mt-1 ${
                            isSelected ? 'bg-white text-[#1E3A8A]' : 'bg-[#1E3A8A] text-white'
                          }`}>Today</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Checklist Controller Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border-2 border-[#D3CEBE]">
                <div>
                  <h3 className={`${textScale.h3} text-[#1E3A8A] font-serif`}>
                    {selectedDayInfo.dayName}&apos;s Exercise List
                  </h3>
                  <p className={`${textScale.bodySmall} text-[#4A473E]`}>
                    Follow the recommended guidelines or add items manually below.
                  </p>
                </div>
                
                <button
                  onClick={() => setShowCustomLogModal(true)}
                  className={`w-full sm:w-auto bg-white hover:bg-[#FCFAF6] text-[#1E3A8A] font-bold border-2 border-[#1E3A8A] px-5 py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all ${accessibleFocus}`}
                  style={{ minHeight: '48px' }}
                >
                  <Plus className="w-5 h-5" />
                  <span>➕ Add Custom Exercise</span>
                </button>
              </div>

              {/* Routine Item Checklist Renderer */}
              <div className="space-y-4">
                {dailyActivitiesList.length === 0 ? (
                  <div className="text-center py-12 bg-white border-2 border-dashed border-[#D3CEBE] rounded-2xl">
                    <BookOpen className="w-12 h-12 text-[#4A473E] mx-auto opacity-40 mb-3" />
                    <p className={`${textScale.body} text-[#4A473E] font-medium`}>No routine events mapped for this day.</p>
                  </div>
                ) : (
                  dailyActivitiesList.map((activity) => {
                    const theme = CATEGORY_THEMES[activity.category] || CATEGORY_THEMES.balance;
                    const baseEx = EXERCISES_DB.find(e => e.id === activity.exerciseId) || EXERCISES_DB[0];
                    
                    return (
                      <div
                        key={activity.id}
                        className={`border-2 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xs transition-all ${theme.bg}`}
                      >
                        <div className="flex items-start gap-4 flex-1">
                          {/* Checked Checkbox Large Click Target */}
                          <button
                            onClick={() => handleToggleActivityCompletion(activity)}
                            className={`w-10 h-10 rounded-xl border-2 bg-white shrink-0 flex items-center justify-center cursor-pointer transition-all ${accessibleFocus} ${
                              activity.completed ? 'border-emerald-600 text-emerald-600 bg-emerald-50' : 'border-[#D3CEBE] hover:border-[#1E3A8A]'
                            }`}
                            aria-label={`Mark ${activity.name} as complete`}
                          >
                            {activity.completed && <CheckCircle2 className="w-6 h-6 fill-current text-emerald-600" />}
                          </button>

                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className={`${textScale.h4} font-serif font-bold ${activity.completed ? 'line-through opacity-60' : ''}`}>
                                {activity.name}
                              </h4>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase ${theme.badge}`}>
                                {theme.icon} {activity.category}
                              </span>
                              <span className="text-xs bg-white/80 border border-[#D3CEBE] text-[#2D2D2D] font-bold px-2 py-0.5 rounded-md">
                                ⏱️ {activity.minutes} Mins
                              </span>
                            </div>
                            <p className={`${textScale.small} text-[#4A473E] leading-relaxed max-w-2xl`}>
                              {baseEx.description}
                            </p>
                          </div>
                        </div>

                        <div className="w-full md:w-auto shrink-0">
                          <button
                            onClick={() => handleSelectExercise(baseEx)}
                            className={`w-full md:w-auto px-5 py-3 bg-[#1E3A8A] hover:bg-[#1A3073] text-white font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all ${accessibleFocus}`}
                            style={{ minHeight: '46px' }}
                          >
                            <TimerIcon className="w-4 h-4" />
                            <span>🎯 Open in Timer</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ACTIVE TIMER VIEW */}
          {activeTab === 'timer' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn" id="timer-tab-view">
              
              {/* Left Column: Big Display Clock */}
              <div className="lg:col-span-5 bg-white border-2 border-[#D3CEBE] p-6 rounded-[28px] shadow-sm flex flex-col justify-between items-center text-center space-y-6">
                <div className="w-full">
                  <span className={`${textScale.label} text-[#4A473E] block`}>⏱️ Countdown Clock</span>
                  <h3 className={`${textScale.h3} text-[#1E3A8A] font-serif font-bold mt-1`}>{selectedExercise.name}</h3>
                </div>

                <div className="py-4 my-auto">
                  <div className={`${textScale.timerText} text-[#2D2D2D] tracking-tight tabular-nums select-none`}>
                    {formatTimerDisplay(timerSecondsLeft)}
                  </div>
                </div>

                {/* Primary Action Row with padding increments */}
                <div className="w-full space-y-4">
                  <div className="flex gap-3 justify-center items-center">
                    <button
                      onClick={() => handleAdjustTimer(-1)}
                      className={`w-14 h-14 bg-white border-2 border-[#D3CEBE] hover:bg-[#FCFAF6] rounded-xl text-[#2D2D2D] font-bold text-xl cursor-pointer shadow-xs ${accessibleFocus}`}
                    >
                      -1m
                    </button>

                    <button
                      onClick={() => setIsTimerRunning(!isTimerRunning)}
                      className={`flex-1 py-4 px-6 rounded-2xl font-bold text-xl text-white shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 ${accessibleFocus} ${
                        isTimerRunning ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
                      }`}
                      style={{ minHeight: '60px' }}
                    >
                      {isTimerRunning ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                      <span>{isTimerRunning ? 'Pause Clock' : 'Start Workout'}</span>
                    </button>

                    <button
                      onClick={() => handleAdjustTimer(1)}
                      className={`w-14 h-14 bg-white border-2 border-[#D3CEBE] hover:bg-[#FCFAF6] rounded-xl text-[#2D2D2D] font-bold text-xl cursor-pointer shadow-xs ${accessibleFocus}`}
                    >
                      +1m
                    </button>
                  </div>

                  <button
                    onClick={() => handleSetTimerPreset(Math.floor(timerInitialSeconds / 60))}
                    className={`w-full py-3 bg-white hover:bg-[#FCFAF6] border-2 border-[#D3CEBE] text-[#4A473E] rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${accessibleFocus}`}
                    style={{ minHeight: '44px' }}
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset Timer to {Math.floor(timerInitialSeconds / 60)}m</span>
                  </button>
                </div>

                {/* Grid for quick adjustments */}
                <div className="w-full pt-4 border-t border-[#E6E2D3]">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#4A473E] mb-2">⏱️ Quick Preset Minutes</p>
                  <div className="grid grid-cols-4 gap-2">
                    {[5, 10, 15, 20].map((mins) => (
                      <button
                        key={mins}
                        onClick={() => handleSetTimerPreset(mins)}
                        className={`py-2 px-1 bg-[#FCFAF6] hover:bg-[#F2EDE0] border-2 border-[#D3CEBE] rounded-lg font-bold text-xs cursor-pointer ${accessibleFocus}`}
                      >
                        {mins} Min
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column: Exercise Instructions Details */}
              <div className="lg:col-span-7 bg-white border-2 border-[#D3CEBE] p-6 rounded-[28px] shadow-sm space-y-5">
                
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-[#E6E2D3] pb-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
                      Exercise Guide
                    </span>
                    <h2 className={`${textScale.h2} text-[#1E3A8A] font-serif`}>
                      {selectedExercise.name}
                    </h2>
                  </div>

                  <button
                    onClick={() => handleSpeakInstructions(selectedExercise)}
                    className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-all border-2 ${accessibleFocus} ${
                      isSpeaking 
                        ? 'bg-red-50 border-red-400 text-red-700' 
                        : 'bg-blue-50 border-blue-300 text-blue-900 hover:bg-blue-100'
                    }`}
                  >
                    {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    <span>{isSpeaking ? '🛑 Stop Reading' : '🔊 Read Out Loud'}</span>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-3">
                    <p className={`${textScale.small} text-[#4A473E] font-bold uppercase tracking-wide`}>
                      📋 Step-by-Step Guide (Tap a step to mark your place):
                    </p>
                    
                    {selectedExercise.instructions.map((step, idx) => {
                      const isStepDone = completedSteps.includes(idx);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setCompletedSteps(prev => 
                              prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
                            );
                          }}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all flex gap-4 items-center ${accessibleFocus} ${
                            isStepDone 
                              ? 'bg-emerald-50 border-emerald-400 text-emerald-950 line-through' 
                              : 'bg-white border-[#D3CEBE] hover:border-[#1E3A8A] text-[#2D2D2D]'
                          }`}
                          style={{ minHeight: '60px' }}
                        >
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${
                            isStepDone ? 'bg-emerald-600 text-white' : 'bg-[#FCFAF6] border border-[#D3CEBE]'
                          }`}>
                            {isStepDone ? '✓' : idx + 1}
                          </span>
                          <span className={`${textScale.bodySmall} font-medium`}>{step}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Student Touch: Clear physical safety disclaimer block */}
                  <div className="bg-amber-50 border-2 border-dashed border-amber-400 p-5 rounded-2xl flex gap-4 items-start">
                    <span className="text-3xl shrink-0" role="img" aria-label="Safety Alert">⚠️</span>
                    <div className="space-y-1">
                      <h4 className={`${textScale.h4} text-amber-950 font-bold font-serif`}>
                        Senior Safety Reminder
                      </h4>
                      <p className={`${textScale.bodySmall} text-amber-900 leading-relaxed`}>
                        {selectedExercise.safetyTip}
                      </p>
                      <p className="text-xs text-amber-800 font-medium pt-1">
                        💡 Tip: Have a clear wall, countertop, or sturdy chair nearby before you begin.
                      </p>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* TAB 3: WEEKLY METRICS PROGRESS TAB */}
          {activeTab === 'progress' && (
            <div className="space-y-6 animate-fadeIn" id="progress-tab-view">
              
              <div className="bg-white border-2 border-[#D3CEBE] p-6 rounded-[28px] shadow-sm space-y-6">
                <div>
                  <h3 className={`${textScale.h3} text-[#1E3A8A] font-serif`}>My Weekly Progress (CDC Milestones)</h3>
                  <p className={`${textScale.bodySmall} text-[#4A473E] mt-0.5`}>
                    This chart shows how close you are to the targets recommended by the CDC for active health.
                  </p>
                </div>

                <div className="space-y-5">
                  {/* Progress Row 1 */}
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row justify-between text-sm font-bold text-[#2D2D2D] gap-1">
                      <span className={textScale.bodySmall}>🔵 Aerobic Activity Minutes:</span>
                      <span className="text-[#1E3A8A] font-mono">{progress.aerobicMins} / 150 minutes</span>
                    </div>
                    <div className="w-full bg-[#FCFAF6] rounded-full h-7 border-2 border-[#D3CEBE] overflow-hidden p-0.5">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (progress.aerobicMins / progress.aerobicTarget) * 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-[#4A473E] font-medium">
                      {progress.isAerobicMet ? '✅ Wonderful! Target unlocked for the week.' : '🏃‍♂️ Try walking or streaming light movement to build minutes.'}
                    </p>
                  </div>

                  {/* Progress Row 2 */}
                  <div className="space-y-2 border-t border-[#E6E2D3] pt-4">
                    <div className="flex flex-col sm:flex-row justify-between text-sm font-bold text-[#2D2D2D] gap-1">
                      <span className={textScale.bodySmall}>🟠 Muscle Strengthening Days:</span>
                      <span className="text-orange-700 font-mono">{progress.strengthDays} / 2 days</span>
                    </div>
                    <div className="w-full bg-[#FCFAF6] rounded-full h-7 border-2 border-[#D3CEBE] overflow-hidden p-0.5">
                      <div
                        className="bg-orange-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (progress.strengthDays / progress.strengthTarget) * 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-[#4A473E] font-medium">
                      {progress.isStrengthMet ? '✅ Great work! Muscles stay robust.' : '💪 Chair stands and wall pushups help satisfy this constraint.'}
                    </p>
                  </div>

                  {/* Progress Row 3 */}
                  <div className="space-y-2 border-t border-[#E6E2D3] pt-4">
                    <div className="flex flex-col sm:flex-row justify-between text-sm font-bold text-[#2D2D2D] gap-1">
                      <span className={textScale.bodySmall}>🟢 Coordination & Balance Days:</span>
                      <span className="text-emerald-700 font-mono">{progress.balanceDays} / 3 days</span>
                    </div>
                    <div className="w-full bg-[#FCFAF6] rounded-full h-7 border-2 border-[#D3CEBE] overflow-hidden p-0.5">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (progress.balanceDays / progress.balanceTarget) * 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-[#4A473E] font-medium">
                      {progress.isBalanceMet ? '✅ Excellent! Your balance coordination improves.' : '🟢 Single-leg stands or slow Tai-Chi flows count toward this goal.'}
                    </p>
                  </div>

                </div>
              </div>

              {/* Workout History Logger Stream */}
              <div className="bg-white border-2 border-[#D3CEBE] p-5 rounded-2xl shadow-sm space-y-4">
                <h4 className={`${textScale.h3} font-serif text-[#1E3A8A]`}>📋 Logged Activity History</h4>
                
                {completedLogs.length === 0 ? (
                  <p className={`${textScale.bodySmall} text-[#4A473E] py-4 italic text-center`}>
                    No logs saved for this week yet. Clear some items off your daily checklist!
                  </p>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {completedLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between p-3.5 bg-[#FCFAF6] border border-[#D3CEBE] rounded-xl text-[#2D2D2D] text-sm"
                      >
                        <div className="space-y-0.5">
                          <p className="font-bold text-base">{log.name}</p>
                          <p className="text-xs text-[#4A473E] font-semibold">
                            ⏱️ {log.minutes} mins • {log.dateString} at {log.timestamp}
                          </p>
                        </div>

                        <button
                          onClick={() => handleRemoveLog(log.id)}
                          className={`p-2.5 text-red-700 hover:bg-red-50 rounded-lg cursor-pointer border border-transparent hover:border-red-200 transition-all ${accessibleFocus}`}
                          title="Delete this workout instance"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Student Touch: Isolate data deletion into a remote bottom block to mitigate tremor accidents */}
              <div className="mt-12 bg-[#FFF1F2] border-2 border-red-300 p-6 rounded-2xl space-y-3">
                <h4 className={`${textScale.h4} text-red-950 font-serif font-bold`}>⚙️ App Management Options</h4>
                <p className={`${textScale.small} text-red-900 leading-relaxed`}>
                  Need to wipe the profile clean or switch to a new calendar week? Use the safety button below.
                </p>
                <button
                  onClick={handleResetAllData}
                  className={`bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-sm text-sm cursor-pointer ${accessibleFocus}`}
                  style={{ minHeight: '48px' }}
                >
                  🗑 Clear My Activity History
                </button>
              </div>

            </div>
          )}

        </main>
      </div>

      {/* MODAL WINDOW OVERLAY 1: TIMER COMPLETED WORKOUT CONGRATS */}
      <AnimatePresence>
        {showCompletionPrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-white border-4 border-emerald-500 rounded-[36px] max-w-md w-full p-6 md:p-8 space-y-5 text-center shadow-xl"
            >
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-300">
                <Award className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <h2 className={`${textScale.h2} text-emerald-950 font-serif`}>Great Job, Star!</h2>
                <p className={`${textScale.body} text-[#4A473E]`}>
                  You successfully finished the full session for <strong>{selectedExercise.name}</strong>!
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <button
                  onClick={() => {
                    handleLogActivity(selectedExercise.name, Math.floor(timerInitialSeconds / 60), selectedExercise.category);
                    setShowCompletionPrompt(false);
                    setActiveTab('progress');
                  }}
                  className={`w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg rounded-2xl shadow-sm cursor-pointer transition-all ${accessibleFocus}`}
                  style={{ minHeight: '54px' }}
                >
                  💾 Save to Workout History
                </button>

                <button
                  onClick={() => setShowCompletionPrompt(false)}
                  className={`w-full py-3 bg-white text-[#4A473E] font-bold text-sm rounded-xl border-2 border-[#D3CEBE] hover:bg-[#FCFAF6] cursor-pointer transition-all ${accessibleFocus}`}
                  style={{ minHeight: '46px' }}
                >
                  Close & Dismiss
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL WINDOW OVERLAY 2: ADD MANUALLY ADDED CUSTOM EVENT */}
      <AnimatePresence>
        {showCustomLogModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border-2 border-[#D3CEBE] rounded-[28px] max-w-md w-full p-6 space-y-5 shadow-2xl relative"
            >
              <div className="flex justify-between items-center border-b border-[#E6E2D3] pb-3">
                <h3 className={`${textScale.h3} text-[#1E3A8A] font-serif`}>Add Exercise to Schedule</h3>
                <button
                  onClick={() => setShowCustomLogModal(false)}
                  className="text-2xl font-bold p-1 text-[#4A473E] hover:text-[#2D2D2D]"
                  aria-label="Close form"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddCustomScheduleItem} className="space-y-4">
                
                {/* Selector Target */}
                <div className="space-y-1.5">
                  <label htmlFor="modal-exercise-select" className={`${textScale.small} text-[#4A473E] font-bold block`}>
                    1. Select Exercise Movement Type:
                  </label>
                  <select
                    id="modal-exercise-select"
                    value={customLogExerciseId}
                    onChange={(e) => setCustomLogExerciseId(e.target.value)}
                    className="w-full p-3 bg-white border-2 border-[#D3CEBE] rounded-xl font-bold text-base text-[#2D2D2D] focus:border-[#1E3A8A] focus:outline-none"
                    style={{ minHeight: '48px' }}
                  >
                    {EXERCISES_DB.map(e => (
                      <option key={e.id} value={e.id}>
                        {e.name} ({e.category})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Minute inputs explicitly optimized for tremors with flanking additions */}
                <div className="space-y-1.5">
                  <label htmlFor="modal-minutes-input" className={`${textScale.small} text-[#4A473E] font-bold block`}>
                    2. Target Minutes to Perform:
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCustomLogMinutes(prev => Math.max(1, prev - 5))}
                      className={`p-3 bg-white border-2 border-[#D3CEBE] hover:bg-[#FCFAF6] rounded-xl text-[#2D2D2D] font-bold text-lg cursor-pointer w-14 text-center shadow-xs ${accessibleFocus}`}
                    >
                      -5
                    </button>

                    <input
                      id="modal-minutes-input"
                      type="number"
                      required
                      min={1}
                      max={180}
                      value={customLogMinutes}
                      onChange={(e) => setCustomLogMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                      className={`flex-1 py-3 px-4 rounded-xl border-2 border-[#D3CEBE] text-center font-bold text-xl text-[#2D2D2D] bg-white focus:outline-none focus:border-[#1E3A8A] ${accessibleFocus}`}
                    />

                    <button
                      type="button"
                      onClick={() => setCustomLogMinutes(prev => Math.min(180, prev + 5))}
                      className={`p-3 bg-white border-2 border-[#D3CEBE] hover:bg-[#FCFAF6] rounded-xl text-[#2D2D2D] font-bold text-lg cursor-pointer w-14 text-center shadow-xs ${accessibleFocus}`}
                    >
                      +5
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className={`w-full py-4 bg-[#1E3A8A] hover:bg-[#1A3073] text-white font-bold text-lg rounded-2xl transition-all cursor-pointer shadow-md ${accessibleFocus}`}
                  style={{ minHeight: '56px' }}
                >
                  💾 Save to Day&apos;s Schedule
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}